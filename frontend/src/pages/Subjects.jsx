import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function Subjects() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchSubjects = async () => {
    try {
      const response = await apiRequest("/subjects");
      const data = await response.json();

      if (data.success) {
        setSubjects(data.data);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiRequest(`/subjects/${id}`, {
  method: "DELETE",
});

      const data = await response.json();

      if (data.success) {
        alert("Subject deleted successfully!");

        setSubjects(subjects.filter((subject) => subject._id !== id));
      } else {
        alert(data.message || "Failed to delete subject");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      subject.subjectName?.toLowerCase().includes(searchText) ||
      subject.subjectCode?.toLowerCase().includes(searchText) ||
      subject.className?.toLowerCase().includes(searchText) ||
      subject.teacherName?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subject.isActive) ||
      (statusFilter === "inactive" && !subject.isActive);

    return matchesSearch && matchesStatus;
  });

  const totalSubjects = subjects.length;

  const activeSubjects = subjects.filter(
    (subject) => subject.isActive
  ).length;

  const inactiveSubjects = subjects.filter(
    (subject) => !subject.isActive
  ).length;

  // Pagination Logic
  const totalItems = filteredSubjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubjects = filteredSubjects.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage school subjects
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/subjects/add")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              <Plus size={18} />
              Add Subject
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {/* Total */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Subjects</p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {totalSubjects}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen size={22} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Subjects</p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {activeSubjects}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle size={22} className="text-green-600" />
                </div>
              </div>
            </div>

            {/* Inactive */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inactive Subjects</p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {inactiveSubjects}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center">
                  <XCircle size={22} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search subject, code, class or teacher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Subject
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Code
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Class
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Teacher
                    </th>

                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="text-right px-5 py-4 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-500"
                      >
                        Loading subjects...
                      </td>
                    </tr>
                  ) : currentSubjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-500"
                      >
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    currentSubjects.map((subject) => (
                      <tr
                        key={subject._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-800">
                            {subject.subjectName}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                            {subject.subjectCode}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {subject.className || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {subject.teacherName || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {subject.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                              <CheckCircle size={13} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500">
                              <XCircle size={13} />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="View"
                              onClick={() =>
                                navigate(`/admin/subjects/${subject._id}`)
                              }
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              title="Edit"
                              onClick={() =>
                                navigate(`/admin/subjects/edit/${subject._id}`)
                              }
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 transition"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              title="Delete"
                              onClick={() => handleDelete(subject._id)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalItems}
                    </span>{" "}
                    entries
                  </span>

                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="itemsPerPage"
                      className="text-xs text-gray-500"
                    >
                      Show:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "hover:bg-white text-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Subjects;