import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Users,
  UserRound,
  UserRoundCheck,
  School,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  Download,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import apiRequest from "../utils/api";

function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [fees, setFees] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [classes, setClasses] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentSort, setStudentSort] = useState("name");
  const [showAIReport, setShowAIReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [filters, setFilters] = useState({
	  className: "",
	  section: "",
	  startDate: "",
	  endDate: "",
	});
	
	
  const buildQuery = () => {
	  const params = new URLSearchParams();

	  if (filters.className) {
		params.append("className", filters.className);
	  }

	  if (filters.section) {
		params.append("section", filters.section);
	  }

	  if (filters.startDate) {
		params.append("startDate", filters.startDate);
	  }

	  if (filters.endDate) {
		params.append("endDate", filters.endDate);
	  }

	  const query = params.toString();

	  return query ? `?${query}` : "";
	};
	
const downloadCSV = async (endpoint, fileName) => {
  try {
    const response = await apiRequest(endpoint);

    if (!response.ok) {
      alert("Failed to export report");
      return;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Export error:", error);
    alert("Something went wrong");
  }
};

const exportAttendanceCSV = () => {
  downloadCSV(
    `/reports/attendance/export${buildQuery()}`,
    "attendance-report.csv"
  );
};

const exportFeesCSV = () => {
  downloadCSV(
    `/reports/fees/export${buildQuery()}`,
    "fees-report.csv"
  );
};

const exportPerformanceCSV = () => {
  downloadCSV(
    `/reports/performance/export${buildQuery()}`,
    "performance-report.csv"
  );
};

const generateAIReportSummary =
  async () => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate >
        filters.endDate
    ) {
      setAiError(
        "End date must be greater than or equal to start date"
      );

      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiReport(null);

      const response =
        await apiRequest(
          "/ai/report-summary",
          {
            method: "POST",

            body: JSON.stringify({
              className:
                filters.className,

              section:
                filters.section,

              startDate:
                filters.startDate,

              endDate:
                filters.endDate,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) { 
        setAiError(
          data.message ||
            "Unable to generate AI report summary"
        );

        return;
      }

      setAiReport(data.data);
    } catch (error) {
      console.error(
        "AI report summary error:",
        error
      );

      setAiError(
        "Something went wrong while generating AI report summary."
      );
    } finally {
      setAiLoading(false);
    }
  };


useEffect(() => {
  const loadInitialData = async () => {
    try {
      const response =
        await apiRequest("/classes");

      const data =
        await response.json();

      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error(
        "Class fetch error:",
        error
      );
    }
  };

  loadInitialData();
}, []);

const handleApplyFilters = () => {
  if (
    filters.startDate &&
    filters.endDate &&
    filters.startDate >
      filters.endDate
  ) {
    alert(
      "End date must be greater than or equal to start date"
    );
    return;
  }

  setAiReport(null);
  setAiError("");

  fetchReports(filters);
};

const handleClearFilters = () => {
  const emptyFilters = {
    className: "",
    section: "",
    startDate: "",
    endDate: "",
  };

  setFilters(emptyFilters);

  setAiReport(null);
  setAiError("");

  fetchReports(emptyFilters);
};

  const reportCards = summary
    ? [
        {
          title: "Total Students",
          value: summary.totalStudents,
          icon: Users,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        },
        {
          title: "Total Teachers",
          value: summary.totalTeachers,
          icon: UserRoundCheck,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
        },
        {
          title: "Total Parents",
          value: summary.totalParents,
          icon: UserRound,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
        },
        {
          title: "Total Classes",
          value: summary.totalClasses,
          icon: School,
          iconBg: "bg-orange-100",
          iconColor: "text-orange-600",
        },
        {
          title: "Total Subjects",
          value: summary.totalSubjects,
          icon: BookOpen,
          iconBg: "bg-pink-100",
          iconColor: "text-pink-600",
        },
        {
          title: "Total Exams",
          value: summary.totalExams,
          icon: FileText,
          iconBg: "bg-indigo-100",
          iconColor: "text-indigo-600",
        },
        {
          title: "Total Results",
          value: summary.totalResults,
          icon: Award,
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
        },
      ]
    : [];
	
	
	const fetchReports = async (
  customFilters = null
) => {
  try {
    setLoading(true);
    setError("");

    const activeFilters =
      customFilters || filters;

    const params =
      new URLSearchParams();

    if (activeFilters.className) {
      params.append(
        "className",
        activeFilters.className
      );
    }

    if (activeFilters.section) {
      params.append(
        "section",
        activeFilters.section
      );
    }

    if (activeFilters.startDate) {
      params.append(
        "startDate",
        activeFilters.startDate
      );
    }

    if (activeFilters.endDate) {
      params.append(
        "endDate",
        activeFilters.endDate
      );
    }

    const queryString =
      params.toString();

    const query =
      queryString
        ? `?${queryString}`
        : "";

    const [
      summaryResponse,
      attendanceResponse,
      feesResponse,
      performanceResponse,
      studentReportResponse,
    ] = await Promise.all([
      apiRequest("/reports/summary"),

      apiRequest(
        `/reports/attendance${query}`
      ),

      apiRequest(
        `/reports/fees${query}`
      ),

      apiRequest(
        `/reports/performance${query}`
      ),

      apiRequest(
        `/reports/students${query}`
      ),
    ]);

    const [
      summaryData,
      attendanceData,
      feesData,
      performanceData,
      studentReportData,
    ] = await Promise.all([
      summaryResponse.json(),
      attendanceResponse.json(),
      feesResponse.json(),
      performanceResponse.json(),
      studentReportResponse.json(),
    ]);

    if (summaryData.success) {
      setSummary(
        summaryData.data || null
      );
    }

    if (attendanceData.success) {
      setAttendance(
        attendanceData.data || null
      );
    } else {
      setAttendance(null);
    }

    if (feesData.success) {
      setFees(
        feesData.data || null
      );
    } else {
      setFees(null);
    }

    if (performanceData.success) {
      setPerformance(
        performanceData.data || null
      );
    } else {
      setPerformance(null);
    }

    if (studentReportData.success) {
      setStudentReports(
        studentReportData.data || []
      );
    } else {
      setStudentReports([]);
    }

    if (
      !summaryData.success ||
      !attendanceData.success ||
      !feesData.success ||
      !performanceData.success ||
      !studentReportData.success
    ) {
      setError(
        "Some reports could not be loaded"
      );
    }
  } catch (error) {
    console.error(
      "Report fetch error:",
      error
    );

    setError(
      "Unable to connect to server"
    );
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchReports();
  // Initial report load only.
  // Filters are applied manually using
  // the Apply Filters button.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


const availableSections = [
  ...new Set(
    classes
      .filter(
        (item) =>
          !filters.className ||
          item.className === filters.className
      )
      .map((item) => item.section)
      .filter(Boolean)
  ),
];

const filteredStudentReports = [...studentReports]
  .filter((item) => {
    const search =
      studentSearch.toLowerCase().trim();

    return (
      item.name?.toLowerCase().includes(search) ||
      item.rollNumber
        ?.toString()
        .toLowerCase()
        .includes(search) ||
      item.className
        ?.toLowerCase()
        .includes(search) ||
      item.section
        ?.toLowerCase()
        .includes(search)
    );
  })
  .sort((a, b) => {
    if (studentSort === "attendance") {
      return (
        b.attendance.percentage -
        a.attendance.percentage
      );
    }

    if (studentSort === "performance") {
      return (
        b.performance.averagePercentage -
        a.performance.averagePercentage
      );
    }

    if (studentSort === "pendingFees") {
      return (
        b.fees.pending -
        a.fees.pending
      );
    }

    return (a.name || "").localeCompare(
      b.name || ""
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

		  <div className="flex items-center gap-3">

			<div className="rounded-xl bg-blue-100 p-3">
			  <BarChart3
				className="text-blue-600"
				size={28}
			  />
			</div>

			<div>
			  <h1 className="text-2xl font-bold text-gray-800">
				Reports & Analytics
			  </h1>

			  <p className="text-sm text-gray-500">
				Overview of your school management data
			  </p>
			</div>

		  </div>

		  <button
			type="button"
			onClick={() => {
			  setShowAIReport(true);

			  if (!aiReport) {
				generateAIReportSummary();
			  }
			}}
			className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
		  >
			<Sparkles size={18} />
			AI Report Summary
		  </button>

		</div>
		  
		  <div className="mb-8 rounded-xl bg-white p-5 shadow-sm">
			  <h2 className="mb-4 text-lg font-semibold text-gray-800">
				Report Filters
			  </h2>

			  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<select
				  value={filters.className}
				  onChange={(e) =>
					setFilters((prev) => ({
					  ...prev,
					  className: e.target.value,
					  section: "",
					}))
				  }
				  className="rounded-lg border px-3 py-2"
				>
				  <option value="">All Classes</option>

				  {[...new Set(classes.map((item) => item.className))]
					.filter(Boolean)
					.map((className) => (
					  <option key={className} value={className}>
						{className}
					  </option>
					))}
				</select>

				<select
				  value={filters.section}
				  onChange={(e) =>
					setFilters((prev) => ({
					  ...prev,
					  section: e.target.value,
					}))
				  }
				  className="rounded-lg border px-3 py-2"
				>
				  <option value="">All Sections</option>

				  {availableSections.map((section) => (
					<option key={section} value={section}>
					  Section {section}
					</option>
				  ))}
				</select>

				<input
				  type="date"
				  value={filters.startDate}
				  onChange={(e) =>
					setFilters((prev) => ({
					  ...prev,
					  startDate: e.target.value,
					}))
				  }
				  className="rounded-lg border px-3 py-2"
				/>

				<input
				  type="date"
				  value={filters.endDate}
				  onChange={(e) =>
					setFilters((prev) => ({
					  ...prev,
					  endDate: e.target.value,
					}))
				  }
				  className="rounded-lg border px-3 py-2"
				/>
			  </div>

			  <div className="mt-4 flex gap-3">
				<button
				  onClick={handleApplyFilters}
				  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
				  Apply Filters
				</button>

				<button
				  onClick={handleClearFilters}
				  className="rounded-lg border px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
				  Clear Filters
				</button>
			  </div>
			</div>
			
			{showAIReport && (
			  <div className="mb-8 rounded-xl border border-purple-200 bg-white p-6 shadow-sm">

				<div className="flex items-start justify-between gap-4">

				  <div>

					<h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
					  <Sparkles
						size={21}
						className="text-purple-600"
					  />

					  AI Management Summary
					</h2>

					<p className="mt-1 text-sm text-gray-500">
					  AI analysis based on the selected report filters and school records.
					</p>

				  </div>

				  <button
					type="button"
					onClick={() =>
					  setShowAIReport(false)
					}
					className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
				  >
					<X size={19} />
				  </button>

				</div>

				{/* Active Filters */}

				<div className="mt-5 flex flex-wrap gap-2 text-xs">

				  <span className="rounded-full bg-gray-100 px-3 py-1.5">
					Class:{" "}
					{filters.className ||
					  "All Classes"}
				  </span>

				  <span className="rounded-full bg-gray-100 px-3 py-1.5">
					Section:{" "}
					{filters.section ||
					  "All Sections"}
				  </span>

				  <span className="rounded-full bg-gray-100 px-3 py-1.5">
					From:{" "}
					{filters.startDate ||
					  "All Dates"}
				  </span>

				  <span className="rounded-full bg-gray-100 px-3 py-1.5">
					To:{" "}
					{filters.endDate ||
					  "All Dates"}
				  </span>

				</div>

				<button
				  type="button"
				  onClick={
					generateAIReportSummary
				  }
				  disabled={aiLoading}
				  className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				>

				  {aiLoading ? (
					<>
					  <RefreshCw
						size={17}
						className="animate-spin"
					  />

					  Analyzing Reports...
					</>
				  ) : (
					<>
					  <RefreshCw size={17} />

					  {aiReport
						? "Regenerate Summary"
						: "Generate Summary"}
					</>
				  )}

				</button>

				{aiError && (
				  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{aiError}
				  </div>
				)}

				{aiReport && !aiLoading && (
				  <div className="mt-6">
					{/* Metrics */}

					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					  {/* Students */}
					  <div className="rounded-xl bg-blue-50 p-4">
						<p className="text-xs text-gray-500">
						  Students
						</p>

						<p className="mt-1 text-2xl font-bold text-blue-700">
						  {aiReport.statistics?.dataScope
							?.activeStudents ?? 0}
						</p>
					  </div>

					  {/* Attendance */}
					  <div className="rounded-xl bg-green-50 p-4">
						<p className="text-xs text-gray-500">
						  Attendance
						</p>

						<p className="mt-1 text-2xl font-bold text-green-700">
						  {aiReport.statistics?.attendance
							?.attendancePercentage != null
							? `${aiReport.statistics.attendance.attendancePercentage}%`
							: "N/A"}
						</p>
					  </div>

					  {/* Average Result */}
					  <div className="rounded-xl bg-indigo-50 p-4">
						<p className="text-xs text-gray-500">
						  Average Result
						</p>

						<p className="mt-1 text-2xl font-bold text-indigo-700">
						  {aiReport.statistics?.academicPerformance
							?.averagePercentage != null
							? `${aiReport.statistics.academicPerformance.averagePercentage}%`
							: "N/A"}
						</p>
					  </div>

					  {/* Fee Collection */}
					  <div className="rounded-xl bg-orange-50 p-4">
						<p className="text-xs text-gray-500">
						  Fee Collection
						</p>

						<p className="mt-1 text-2xl font-bold text-orange-700">
						  {(() => {
							const total =
							  Number(
								aiReport.statistics?.fees
								  ?.totalAmount
							  ) || 0;

							const paid =
							  Number(
								aiReport.statistics?.fees
								  ?.totalPaid
							  ) || 0;

							if (total <= 0) {
							  return "N/A";
							}

							return `${(
							  (paid / total) *
							  100
							).toFixed(2)}%`;
						  })()}
						</p>
					  </div>
					</div>

					{/* Extra report statistics */}

					<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					  <div className="rounded-xl border border-gray-200 p-4">
						<p className="text-xs text-gray-500">
						  Attendance Records
						</p>

						<p className="mt-1 text-lg font-semibold text-gray-800">
						  {aiReport.statistics?.attendance
							?.totalRecords ?? 0}
						</p>
					  </div>

					  <div className="rounded-xl border border-gray-200 p-4">
						<p className="text-xs text-gray-500">
						  Result Records
						</p>

						<p className="mt-1 text-lg font-semibold text-gray-800">
						  {aiReport.statistics
							?.academicPerformance
							?.resultCount ?? 0}
						</p>
					  </div>

					  <div className="rounded-xl border border-gray-200 p-4">
						<p className="text-xs text-gray-500">
						  Fees Collected
						</p>

						<p className="mt-1 text-lg font-semibold text-green-700">
						  ₹
						  {Number(
							aiReport.statistics?.fees
							  ?.totalPaid || 0
						  ).toLocaleString("en-IN")}
						</p>
					  </div>

					  <div className="rounded-xl border border-gray-200 p-4">
						<p className="text-xs text-gray-500">
						  Fees Pending
						</p>

						<p className="mt-1 text-lg font-semibold text-red-600">
						  ₹
						  {Number(
							aiReport.statistics?.fees
							  ?.totalDue || 0
						  ).toLocaleString("en-IN")}
						</p>
					  </div>
					</div>

					{/* AI text */}

					<div className="mt-5 rounded-xl border border-purple-100 bg-purple-50/40 p-5">
					  <h3 className="flex items-center gap-2 font-semibold text-gray-800">
						<Sparkles
						  size={18}
						  className="text-purple-600"
						/>

						AI Analysis
					  </h3>

					  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">
						{aiReport.summary ||
						  "No AI summary available."}
					  </div>
					</div>

					{/* Data scope notice */}

					<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
					  <p className="text-sm font-medium text-amber-800">
						Report data scope
					  </p>

					  <p className="mt-1 text-xs leading-5 text-amber-700">
						Attendance respects the selected date
						range. Academic results and fee totals
						currently use all matching records
						because their date semantics differ from
						attendance.
					  </p>
					</div>

					<p className="mt-3 text-xs text-gray-400">
					  AI-generated summaries are informational
					  and should be reviewed against the
					  underlying school records before
					  administrative action.
					</p>
				  </div>
				)}

			  </div>
			)}

          {/* Loading */}
          {loading && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">Loading reports...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
              {error}
            </div>
          )}

          {/* Report Cards */}
          {!loading && !error && summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {reportCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {card.title}
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-gray-800">
                          {card.value}
                        </h2>
                      </div>

                      <div className={`rounded-xl p-3 ${card.iconBg}`}>
                        <Icon size={25} className={card.iconColor} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
		  
		  {!loading && !error && attendance && (
			  <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
			  <div className="mb-4 flex items-center justify-between">
					<h2 className="mb-6 text-xl font-bold text-gray-800">
					  Attendance Report
					</h2>
					<button
					  onClick={exportAttendanceCSV}
					  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
					>
					  <Download size={18} />
					  Export Attendance CSV
					</button>
			  </div>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				  <div className="rounded-xl bg-gray-50 p-5">
					<p className="text-sm text-gray-500">Total Records</p>
					<p className="mt-2 text-3xl font-bold text-gray-800">
					  {attendance.totalRecords}
					</p>
				  </div>

				  <div className="rounded-xl bg-green-50 p-5">
					<p className="text-sm text-gray-500">Present</p>
					<p className="mt-2 text-3xl font-bold text-green-600">
					  {attendance.present}
					</p>
				  </div>

				  <div className="rounded-xl bg-red-50 p-5">
					<p className="text-sm text-gray-500">Absent</p>
					<p className="mt-2 text-3xl font-bold text-red-600">
					  {attendance.absent}
					</p>
				  </div>

				  <div className="rounded-xl bg-yellow-50 p-5">
					<p className="text-sm text-gray-500">Late</p>
					<p className="mt-2 text-3xl font-bold text-yellow-600">
					  {attendance.late}
					</p>
				  </div>
				</div>

				<div className="mt-6">
				  <div className="mb-2 flex items-center justify-between">
					<span className="text-sm font-medium text-gray-600">
					  Attendance Percentage
					</span>

					<span className="text-lg font-bold text-blue-600">
					  {attendance.attendancePercentage}%
					</span>
				  </div>

				  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
					<div
					  className="h-full rounded-full bg-blue-600 transition-all duration-500"
					  style={{
						width: `${Math.min(
						  attendance.attendancePercentage,
						  100
						)}%`,
					  }}
					></div>
				  </div>
				</div>
			  </div>
			)}


{!loading && !error && fees && (
  <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
   <div className="mb-4 flex items-center justify-between">
  <h2 className="text-xl font-semibold">Fees Report</h2>

  <button
    onClick={exportFeesCSV}
    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
  >
    <Download size={18} />
    Export Fees CSV
  </button>
</div>
	

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl bg-blue-50 p-5">
        <p className="text-sm text-gray-500">Total Fees</p>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          ₹{fees.totalFees}
        </p>
      </div>

      <div className="rounded-xl bg-green-50 p-5">
        <p className="text-sm text-gray-500">Collected Fees</p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          ₹{fees.collectedFees}
        </p>
      </div>

      <div className="rounded-xl bg-red-50 p-5">
        <p className="text-sm text-gray-500">Pending Fees</p>
        <p className="mt-2 text-3xl font-bold text-red-600">
          ₹{fees.pendingFees}
        </p>
      </div>
    </div>

    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Fee Collection
        </span>

        <span className="text-lg font-bold text-green-600">
          {fees.collectionPercentage}%
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-green-600 transition-all duration-500"
          style={{
            width: `${Math.min(
              fees.collectionPercentage,
              100
            )}%`,
          }}
        ></div>
      </div>
    </div>
  </div>
)}


{!loading && !error && performance && (
  <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-center justify-between">
  <h2 className="text-xl font-bold text-gray-800">
    Exam & Result Performance
  </h2>

  <button
    onClick={exportPerformanceCSV}
    className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
  >
    <Download size={18} />
    Export Performance CSV
  </button>
</div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-blue-50 p-5">
        <p className="text-sm text-gray-500">Average Percentage</p>
        <p className="mt-2 text-3xl font-bold text-blue-600">
          {performance.averagePercentage}%
        </p>
      </div>

      <div className="rounded-xl bg-green-50 p-5">
        <p className="text-sm text-gray-500">Highest Percentage</p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          {performance.highestPercentage}%
        </p>
      </div>

      <div className="rounded-xl bg-orange-50 p-5">
        <p className="text-sm text-gray-500">Lowest Percentage</p>
        <p className="mt-2 text-3xl font-bold text-orange-600">
          {performance.lowestPercentage}%
        </p>
      </div>

      <div className="rounded-xl bg-purple-50 p-5">
        <p className="text-sm text-gray-500">Total Results</p>
        <p className="mt-2 text-3xl font-bold text-purple-600">
          {performance.totalResults}
        </p>
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="rounded-xl bg-green-50 p-5">
        <p className="text-sm text-gray-500">Passed Students</p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          {performance.passedStudents}
        </p>
      </div>

      <div className="rounded-xl bg-red-50 p-5">
        <p className="text-sm text-gray-500">Failed Students</p>
        <p className="mt-2 text-3xl font-bold text-red-600">
          {performance.failedStudents}
        </p>
      </div>
    </div>

    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Grade Distribution
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {Object.entries(performance.grades).map(
          ([grade, count]) => (
            <div
              key={grade}
              className="rounded-xl border border-gray-200 p-4 text-center"
            >
              <p className="text-lg font-bold text-gray-800">
                {grade}
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {count}
              </p>

              <p className="text-xs text-gray-500">
                Students
              </p>
            </div>
          )
        )}
      </div>
    </div>
  </div>
)}




{!loading && !error && (
  <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-800">
        Student-wise Detailed Report
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Attendance, fees and academic performance
        for each student
      </p>
    </div>

    {/* Search + Sort */}
    <div className="mb-5 flex flex-col gap-3 md:flex-row">
      <input
        type="text"
        value={studentSearch}
        onChange={(e) =>
          setStudentSearch(e.target.value)
        }
        placeholder="Search student, roll no, class..."
        className="w-full rounded-lg border px-4 py-2 md:max-w-md"
      />

      <select
        value={studentSort}
        onChange={(e) =>
          setStudentSort(e.target.value)
        }
        className="rounded-lg border px-4 py-2"
      >
        <option value="name">
          Sort by Name
        </option>

        <option value="attendance">
          Highest Attendance
        </option>

        <option value="performance">
          Highest Performance
        </option>

        <option value="pendingFees">
          Highest Pending Fees
        </option>
      </select>
    </div>

    {studentReports.length === 0 ? (
      <p className="py-8 text-center text-gray-500">
        No student report data found
      </p>
    ) : filteredStudentReports.length === 0 ? (
      <p className="py-8 text-center text-gray-500">
        No matching student found
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-3">
                Student
              </th>

              <th className="p-3">
                Roll No.
              </th>

              <th className="p-3">
                Class
              </th>

              <th className="p-3">
                Attendance
              </th>

              <th className="p-3">
                Total Fees
              </th>

              <th className="p-3">
                Paid
              </th>

              <th className="p-3">
                Pending
              </th>

              <th className="p-3">
                Avg. Result
              </th>

              <th className="p-3">
                Performance
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudentReports.map(
              (student) => (
                <tr
                  key={student.studentId}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {student.name}
                  </td>

                  <td className="p-3">
                    {student.rollNumber || "-"}
                  </td>

                  <td className="p-3">
                    {student.className}
                    {student.section
                      ? ` - ${student.section}`
                      : ""}
                  </td>

                  <td className="p-3">
                    <span
                      className={
                        student.attendance
                          .percentage >= 75
                          ? "font-semibold text-green-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {
                        student.attendance
                          .percentage
                      }
                      %
                    </span>
                  </td>

                  <td className="p-3">
                    ₹
                    {student.fees.total.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="p-3 font-medium text-green-600">
                    ₹
                    {student.fees.paid.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="p-3 font-medium text-red-600">
                    ₹
                    {student.fees.pending.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="p-3">
                    {
                      student.performance
                        .averagePercentage
                    }
                    %
                  </td>

                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        student.performance.status ===
                        "Excellent"
                          ? "bg-green-100 text-green-700"
                          : student.performance
                                .status === "Good"
                          ? "bg-blue-100 text-blue-700"
                          : student.performance
                                .status ===
                              "Average"
                          ? "bg-yellow-100 text-yellow-700"
                          : student.performance
                                .status ===
                              "Needs Improvement"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {
                        student.performance
                          .status
                      }
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


        </div>
      </main>
    </div>
  );
}

export default Reports;