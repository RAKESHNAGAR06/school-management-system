import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function Attendance() {
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiInsight, setAiInsight] = useState(null);

  const [aiFilters, setAiFilters] =
    useState({
	  className: "",
	  section: "",
	  startDate: "",
	  endDate: "",
    });
  

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const fetchAttendance = async () => {
    try {
      // 1. GET - Attendance List
      const response = await apiRequest("/attendance");
      const data = await response.json();

      if (data.success) {
        setAttendance(data.data);
      } else {
        alert(data.message || "Failed to fetch attendance");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmDelete) return;

    try {
     // 5. DELETE - Delete Attendance
		const response = await apiRequest(`/attendance/${id}`, {
		  method: "DELETE",
		});

      const data = await response.json();

      if (data.success) {
        alert("Attendance deleted successfully!");
        fetchAttendance();
      } else {
        alert(data.message || "Failed to delete attendance");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };
  
  
 const handleGenerateAttendanceInsight = async () => {
  try {
    // ==========================================
    // 1. BASIC FRONTEND VALIDATION
    // ==========================================

    if (
      aiFilters.startDate &&
      aiFilters.endDate &&
      aiFilters.startDate > aiFilters.endDate
    ) {
      setAiError(
        "End date must be greater than or equal to start date."
      );
      return;
    }

    // ==========================================
    // 2. RESET AI STATE
    // ==========================================

    setAiLoading(true);
    setAiError("");
    setAiInsight(null);

    // ==========================================
    // 3. SEND REQUEST TO BACKEND
    // ==========================================

    const response = await apiRequest(
      "/ai/attendance-insight",
      {
        method: "POST",

        body: JSON.stringify({
          className: aiFilters.className,
          section: aiFilters.section,
          startDate: aiFilters.startDate,
          endDate: aiFilters.endDate,
        }),
      }
    );

    // ==========================================
    // 4. READ RESPONSE
    // ==========================================

    const data = await response.json();

    // ==========================================
    // 5. HANDLE BACKEND ERROR
    // ==========================================

    if (!response.ok || !data.success) {
      setAiError(
        data.message ||
          "Unable to generate attendance insight."
      );
      return;
    }

    // ==========================================
    // 6. SAVE AI RESULT
    // ==========================================

    setAiInsight(data.data);
  } catch (error) {
    console.error(
      "Attendance AI error:",
      error
    );

    setAiError(
      "Something went wrong while generating attendance insight."
    );
  } finally {
    setAiLoading(false);
  }
};
  
  
  const availableClasses = Array.from(
	  new Map(
		attendance.map((item) => [
		  `${item.className}|||${item.section || ""}`,
		  {
			className: item.className,
			section: item.section || "",
		  },
		])
	  ).values()
	).filter((item) => item.className);

  const filteredAttendance = attendance.filter((item) => {
    const studentName =
      item.studentName ||
      item.studentId?.name ||
      "";

    const matchesSearch =
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      (item.className || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (item.section || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = attendance.length;
  const present = attendance.filter(
    (item) => item.status === "present"
  ).length;
  const absent = attendance.filter(
    (item) => item.status === "absent"
  ).length;
  const late = attendance.filter(
    (item) => item.status === "late"
  ).length;

  // Pagination Calculations
  const totalItems = filteredAttendance.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendance = filteredAttendance.slice(startIndex, endIndex);

  const getStatusStyle = (status) => {
    switch (status) {
      case "present":
        return "bg-green-50 text-green-600";

      case "absent":
        return "bg-red-50 text-red-600";

      case "late":
        return "bg-yellow-50 text-yellow-600";

      case "leave":
        return "bg-blue-50 text-blue-600";

      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle size={15} />;

      case "absent":
        return <XCircle size={15} />;

      case "late":
        return <Clock size={15} />;

      case "leave":
        return <CalendarDays size={15} />;

      default:
        return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Attendance
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Manage student attendance
              </p>
            </div>

            <div className="flex items-center gap-3">

			  <button
				type="button"
				onClick={() => {
				  setShowAI((prev) => !prev);
				  setAiError("");
				}}
				className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-white transition hover:bg-purple-700"
			  >
				<Sparkles size={18} />
				AI Insights
			  </button>

			  <button
				onClick={() =>
				  navigate(
					"/admin/attendance/add"
				  )
				}
				className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700"
			  >
				<Plus size={18} />
				Add Attendance
			  </button>

			</div>
          </div>
		  
		  {showAI && (
  <div className="mb-6 rounded-xl border border-purple-200 bg-white p-6 shadow-sm">

    <div className="flex items-start justify-between gap-4">

      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Sparkles
            size={20}
            className="text-purple-600"
          />
          AI Attendance Insights
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Analyze attendance patterns and identify records that may need staff attention.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowAI(false);
          setAiError("");
        }}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <X size={18} />
      </button>

    </div>

    {/* Filters */}
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Class
        </label>

        <select
          value={
            aiFilters.className
              ? `${aiFilters.className}|||${aiFilters.section}`
              : ""
          }
          onChange={(e) => {
            if (!e.target.value) {
              setAiFilters({
                ...aiFilters,
                className: "",
                section: "",
              });

              return;
            }

            const [
              className,
              section,
            ] =
              e.target.value.split(
                "|||"
              );

            setAiFilters({
              ...aiFilters,
              className,
              section:
                section || "",
            });
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
        >
          <option value="">
            All Classes
          </option>

          {availableClasses.map(
            (item) => (
              <option
                key={`${item.className}-${item.section}`}
                value={`${item.className}|||${item.section}`}
              >
                {item.className}
                {item.section
                  ? ` - ${item.section}`
                  : ""}
              </option>
            )
          )}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Start Date
        </label>

        <input
          type="date"
          value={
            aiFilters.startDate
          }
          onChange={(e) =>
            setAiFilters({
              ...aiFilters,
              startDate:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          End Date
        </label>

        <input
          type="date"
          value={aiFilters.endDate}
          onChange={(e) =>
            setAiFilters({
              ...aiFilters,
              endDate:
                e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
        />
      </div>

    </div>

    {aiError && (
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {aiError}
      </div>
    )}

    <button
      type="button"
      onClick={
        handleGenerateAttendanceInsight
      }
      disabled={aiLoading}
      className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {aiLoading ? (
        <>
          <RefreshCw
            size={18}
            className="animate-spin"
          />
          Analyzing Attendance...
        </>
      ) : (
        <>
          <Sparkles size={18} />
          Generate Insight
        </>
      )}
    </button>

    {aiInsight &&
      !aiLoading && (
        <div className="mt-6 border-t pt-6">

          {/* AI Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs text-gray-500">
                Attendance
              </p>

              <p className="mt-1 text-xl font-bold text-blue-700">
                {aiInsight.statistics
                  .attendancePercentage}
                %
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-xs text-gray-500">
                Present
              </p>

              <p className="mt-1 text-xl font-bold text-green-700">
                {
                  aiInsight
                    .statistics
                    .present
                }
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-gray-500">
                Absent
              </p>

              <p className="mt-1 text-xl font-bold text-red-700">
                {
                  aiInsight
                    .statistics
                    .absent
                }
              </p>
            </div>

            <div className="rounded-xl bg-yellow-50 p-4">
              <p className="text-xs text-gray-500">
                Late
              </p>

              <p className="mt-1 text-xl font-bold text-yellow-700">
                {
                  aiInsight
                    .statistics
                    .late
                }
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-xs text-gray-500">
                Students
              </p>

              <p className="mt-1 text-xl font-bold text-purple-700">
                {
                  aiInsight
                    .statistics
                    .uniqueStudents
                }
              </p>
            </div>

          </div>

          {/* Flagged Students */}
          {aiInsight
            .studentsNeedingAttention
            ?.length > 0 && (
            <div className="mt-5 rounded-xl border p-5">

              <h3 className="font-semibold text-gray-800">
                Students Needing Attention
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Based only on attendance thresholds.
              </p>

              <div className="mt-4 overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-3">
                        Student
                      </th>

                      <th className="pb-3">
                        Class
                      </th>

                      <th className="pb-3">
                        Attendance
                      </th>

                      <th className="pb-3">
                        Absent
                      </th>

                      <th className="pb-3">
                        Late
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {aiInsight.studentsNeedingAttention.map(
                      (
                        student,
                        index
                      ) => (
                        <tr
                          key={`${student.studentName}-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 font-medium">
                            {
                              student.studentName
                            }
                          </td>

                          <td className="py-3">
                            {
                              student.className
                            }
                            {student.section
                              ? ` - ${student.section}`
                              : ""}
                          </td>

                          <td className="py-3">
                            {
                              student.attendancePercentage
                            }
                            %
                          </td>

                          <td className="py-3 text-red-600">
                            {
                              student.absent
                            }
                          </td>

                          <td className="py-3 text-yellow-600">
                            {
                              student.late
                            }
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* AI Analysis */}
          <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/50 p-5">

            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
              <Sparkles
                size={18}
                className="text-purple-600"
              />
              AI Analysis
            </h3>

            <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {aiInsight.insight}
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-400">
            AI-generated attendance analysis should be reviewed by school staff before taking action.
          </p>

        </div>
      )}

  </div>
)}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Records
                  </p>

                  <h2 className="text-2xl font-bold text-gray-800 mt-1">
                    {total}
                  </h2>
                </div>

                <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CalendarCheck
                    className="text-blue-600"
                    size={22}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Present
                  </p>

                  <h2 className="text-2xl font-bold text-green-600 mt-1">
                    {present}
                  </h2>
                </div>

                <CheckCircle
                  className="text-green-500"
                  size={28}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Absent
                  </p>

                  <h2 className="text-2xl font-bold text-red-600 mt-1">
                    {absent}
                  </h2>
                </div>

                <XCircle
                  className="text-red-500"
                  size={28}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Late
                  </p>

                  <h2 className="text-2xl font-bold text-yellow-600 mt-1">
                    {late}
                  </h2>
                </div>

                <Clock
                  className="text-yellow-500"
                  size={28}
                />
              </div>
            </div>

          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
            <div className="flex flex-col md:flex-row gap-3">

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search student, class or section..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">Leave</option>
              </select>

            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

            {loading ? (
              <div className="text-center py-16 text-gray-500">
                Loading attendance...
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="text-center py-16">
                <CalendarCheck
                  size={40}
                  className="mx-auto text-gray-300 mb-3"
                />

                <p className="text-gray-500">
                  No attendance records found
                </p>

                <button
                  onClick={() =>
                    navigate("/admin/attendance/add")
                  }
                  className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                >
                  Add Attendance
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-gray-600">
                        Student
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-gray-600">
                        Class
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-gray-600">
                        Date
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-gray-600">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {currentAttendance.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.studentName ||
                                item.studentId?.name ||
                                "-"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item.studentId?.email || ""}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {item.className || "-"}
                          {item.section
                            ? ` - ${item.section}`
                            : ""}
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(item.date)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {getStatusIcon(item.status)}
                            {item.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              title="View"
                              onClick={() =>
                                navigate(
                                  `/admin/attendance/${item._id}`
                                )
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              title="Edit"
                              onClick={() =>
                                navigate(
                                  `/admin/attendance/edit/${item._id}`
                                )
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              title="Delete"
                              onClick={() =>
                                handleDelete(item._id)
                              }
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

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
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
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
                    className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
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

export default Attendance;