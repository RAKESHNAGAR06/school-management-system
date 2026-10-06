import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Search,
  Trash2,
  RotateCcw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function AdminHomework() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/homework/admin");
      const data = await response.json();

      if (data.success) {
        setHomeworkList(data.data || []);
      } else {
        setError(data.message || "Unable to load homework");
      }
    } catch (error) {
      console.error("Admin homework fetch error:", error);
      setError("Unable to load homework");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const getStatus = (dueDate) => {
    if (!dueDate) return "Pending";

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "Overdue";
    if (due.getTime() === today.getTime()) return "Due Today";

    return "Pending";
  };

  const getStatusClass = (status) => {
    if (status === "Overdue") {
      return "bg-red-100 text-red-700";
    }

    if (status === "Due Today") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-green-100 text-green-700";
  };

  const classes = useMemo(
    () =>
      [
        ...new Set(
          homeworkList
            .map((item) => item.className)
            .filter(Boolean)
        ),
      ].sort(),
    [homeworkList]
  );

  const sections = useMemo(
    () =>
      [
        ...new Set(
          homeworkList
            .filter(
              (item) =>
                classFilter === "all" ||
                item.className === classFilter
            )
            .map((item) => item.section)
            .filter(Boolean)
        ),
      ].sort(),
    [homeworkList, classFilter]
  );

  const subjects = useMemo(
    () =>
      [
        ...new Set(
          homeworkList
            .map((item) => item.subjectName)
            .filter(Boolean)
        ),
      ].sort(),
    [homeworkList]
  );

  const filteredHomework = homeworkList.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    const status = getStatus(item.dueDate);

    const teacherName =
      typeof item.assignedBy === "object"
        ? item.assignedBy?.name || ""
        : "";

    const matchesSearch =
      item.title?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.className?.toLowerCase().includes(search) ||
      item.section?.toLowerCase().includes(search) ||
      item.subjectName?.toLowerCase().includes(search) ||
      teacherName.toLowerCase().includes(search);

    const matchesClass =
      classFilter === "all" ||
      item.className === classFilter;

    const matchesSection =
      sectionFilter === "all" ||
      item.section === sectionFilter;

    const matchesSubject =
      subjectFilter === "all" ||
      item.subjectName === subjectFilter;

    const matchesStatus =
      statusFilter === "all" ||
      status === statusFilter;

    return (
      matchesSearch &&
      matchesClass &&
      matchesSection &&
      matchesSubject &&
      matchesStatus
    );
  });

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this homework?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiRequest(
        `/homework/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setHomeworkList((prev) =>
          prev.filter((item) => item._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete homework error:", error);
      alert("Unable to delete homework");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setSectionFilter("all");
    setSubjectFilter("all");
    setStatusFilter("all");
  };

  const overdueCount = homeworkList.filter(
    (item) => getStatus(item.dueDate) === "Overdue"
  ).length;

  const dueTodayCount = homeworkList.filter(
    (item) => getStatus(item.dueDate) === "Due Today"
  ).length;

  const pendingCount = homeworkList.filter(
    (item) => getStatus(item.dueDate) === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Homework Management
              </h1>

              <p className="text-gray-500 mt-1">
                Monitor homework assigned by teachers
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Total Homework
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {homeworkList.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Pending
            </p>
            <h2 className="text-2xl font-bold text-green-600 mt-2">
              {pendingCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Due Today
            </p>
            <h2 className="text-2xl font-bold text-orange-600 mt-2">
              {dueTodayCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">
              Overdue
            </p>
            <h2 className="text-2xl font-bold text-red-600 mt-2">
              {overdueCount}
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="relative xl:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search homework..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="w-full border rounded-lg pl-10 pr-3 py-2"
              />
            </div>

            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setSectionFilter("all");
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Classes</option>

              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) =>
                setSectionFilter(e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Sections</option>

              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Subjects</option>

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 flex items-center gap-2 border px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw size={17} />
            Clear Filters
          </button>
        </div>

        {/* Homework Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">
              Loading homework...
            </p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>

              <button
                onClick={fetchHomework}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : homeworkList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No homework found
            </p>
          ) : filteredHomework.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No matching homework found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="bg-gray-50 border-b text-left">
                    <th className="p-3">Title</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Assigned</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHomework.map((item) => {
                    const status = getStatus(
                      item.dueDate
                    );

                    return (
                      <tr
                        key={item._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <div className="font-medium text-gray-800">
                            {item.title}
                          </div>

                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1 max-w-[220px] truncate">
                              {item.description}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          {item.className}
                        </td>

                        <td className="p-3">
                          {item.section || "-"}
                        </td>

                        <td className="p-3">
                          {item.subjectName}
                        </td>

                        <td className="p-3">
                          {item.assignedBy?.name || "-"}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {item.assignedDate
                            ? new Date(
                                item.assignedDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {item.dueDate
                            ? new Date(
                                item.dueDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Homework"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminHomework;