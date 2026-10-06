import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
  CalendarDays,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function Exams() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const [examType, setExamType] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);



  const fetchExams = async () => {
    try {
      setLoading(true);

const response = await apiRequest("/exams");
      const result = await response.json();

      if (result.success) {
        setExams(result.data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Reset to first page when search or type filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, examType]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) return;

    try {
		const response = await fetch(`${API}/${id}`, {
		  method: "DELETE",
		  headers: {
			Authorization: `Bearer ${token}`,
		  },
		});

const data = await response.json();

      const result = await response.json();

      if (result.success) {
        setExams((prev) => prev.filter((exam) => exam._id !== id));
      } else {
        alert(result.message || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  // Filtered dataset
  const filteredExams = exams.filter((exam) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      exam.examName?.toLowerCase().includes(searchText) ||
      exam.className?.toLowerCase().includes(searchText) ||
      exam.section?.toLowerCase().includes(searchText) ||
      exam.subjectName?.toLowerCase().includes(searchText);

    const matchesType = examType ? exam.examType === examType : true;

    return matchesSearch && matchesType;
  });

  // Pagination Logic
  const totalItems = filteredExams.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  // Stats Calculations
  const totalExams = exams.length;
  const activeExams = exams.filter((exam) => exam.isActive === true).length;
  const upcomingExams = exams.filter(
    (exam) => new Date(exam.examDate) >= new Date()
  ).length;
  const totalMarks = exams.reduce(
    (sum, exam) => sum + Number(exam.totalMarks || 0),
    0
  );

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatExamType = (type) => {
    if (!type) return "-";

    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Exams & Tests
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage school exams and tests
              </p>
            </div>

            <Link
              to="/admin/exams/add"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              <Plus size={18} />
              Add Exam
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Exams</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {totalExams}
                  </h2>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Exams</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {activeExams}
                  </h2>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <GraduationCap className="text-green-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Exams</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {upcomingExams}
                  </h2>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CalendarDays className="text-orange-600" size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Marks</p>
                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {totalMarks}
                  </h2>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="text-purple-600" size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search exam, class or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Exam Type Filter */}
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Exam Types</option>
                <option value="unit-test">Unit Test</option>
                <option value="mid-term">Mid Term</option>
                <option value="final">Final</option>
                <option value="pre-board">Pre Board</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Exam
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Type
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Class
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Subject
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Exam Date
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Marks
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-center px-5 py-4 font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-10 text-gray-500"
                      >
                        Loading exams...
                      </td>
                    </tr>
                  ) : currentExams.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-10 text-gray-500"
                      >
                        No exams found
                      </td>
                    </tr>
                  ) : (
                    currentExams.map((exam) => (
                      <tr
                        key={exam._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-800">
                            {exam.examName}
                          </div>

                          {exam.startTime && (
                            <div className="text-xs text-gray-500 mt-1">
                              {exam.startTime}
                              {exam.duration ? ` • ${exam.duration}` : ""}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {formatExamType(exam.examType)}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {exam.className}
                          {exam.section ? ` - ${exam.section}` : ""}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {exam.subjectName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {formatDate(exam.examDate)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-800">
                            {exam.totalMarks}
                          </div>

                          <div className="text-xs text-gray-500">
                            Pass: {exam.passingMarks}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              exam.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {exam.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/exams/${exam._id}`}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              title="View"
                            >
                              <Eye size={17} />
                            </Link>

                            <Link
                              to={`/admin/exams/edit/${exam._id}`}
                              className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </Link>

                            <button
                              onClick={() => handleDelete(exam._id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete"
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

            {/* Pagination Controls Footer */}
            {!loading && totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t bg-gray-50 text-sm text-gray-600">
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

                  {/* Rows per page selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-xs text-gray-500">
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

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

export default Exams;