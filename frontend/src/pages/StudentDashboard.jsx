import StudentSidebar from "../components/StudentSidebar";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import apiRequest from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  NotebookPen,
} from "lucide-react";

function StudentDashboard() {
	const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	
	
	useEffect(() => {
	  const fetchDashboard = async () => {
		try {
		  const response = await apiRequest("/students/dashboard");
		  const data = await response.json();

		  if (data.success) {
			setDashboardData(data.data);
		  }
		} catch (error) {
		  console.error("Student dashboard error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchDashboard();
	}, []);
	
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
		  Welcome, {dashboardData?.studentName || "Student"}
		</h1>

		<p className="mt-2 text-gray-500">
		  Class {dashboardData?.className || "-"}{" "}
		  {dashboardData?.section || ""}
		</p>
		
		{loading ? (
			  <p className="mt-6 text-gray-500">Loading dashboard...</p>
			) : dashboardData ? (
			  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
				<div className="bg-white rounded-xl border p-5 shadow-sm">
				  <p className="text-sm text-gray-500">Attendance</p>

				  <h2 className="text-2xl font-bold text-gray-800 mt-2">
					{dashboardData.attendancePercentage}%
				  </h2>
				</div>

				<div className="bg-white rounded-xl border p-5 shadow-sm">
				  <p className="text-sm text-gray-500">Upcoming Exams</p>

				  <h2 className="text-2xl font-bold text-gray-800 mt-2">
					{dashboardData.upcomingExams}
				  </h2>
				</div>

				<div className="bg-white rounded-xl border p-5 shadow-sm">
				  <p className="text-sm text-gray-500">Results Available</p>

				  <h2 className="text-2xl font-bold text-gray-800 mt-2">
					{dashboardData.resultsCount}
				  </h2>
				</div>
			  </div>
			) : (
			  <p className="mt-6 text-red-500">
				Unable to load dashboard data.
			  </p>
			)}
			
			<div className="mt-8">
			  <h2 className="text-xl font-bold text-gray-800 mb-4">
				Quick Actions
			  </h2>

			  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<button
				  onClick={() => navigate("/student/attendance")}
				  className="bg-white border rounded-xl p-5 text-left shadow-sm hover:bg-gray-50">
				  <CalendarCheck className="w-6 h-6 mb-3 text-blue-600" />

				  <h3 className="font-semibold text-gray-800">
					My Attendance
				  </h3>

				  <p className="text-sm text-gray-500 mt-1">
					View your attendance records
				  </p>
				</button>

				<button
				  onClick={() => navigate("/student/exams")}
				  className="bg-white border rounded-xl p-5 text-left shadow-sm hover:bg-gray-50">
				  <ClipboardList className="w-6 h-6 mb-3 text-purple-600" />

				  <h3 className="font-semibold text-gray-800">
					My Exams
				  </h3>

				  <p className="text-sm text-gray-500 mt-1">
					Check your scheduled exams
				  </p>
				</button>

				<button
				  onClick={() => navigate("/student/results")}
				  className="bg-white border rounded-xl p-5 text-left shadow-sm hover:bg-gray-50">
				  <FileText className="w-6 h-6 mb-3 text-green-600" />

				  <h3 className="font-semibold text-gray-800">
					My Results
				  </h3>

				  <p className="text-sm text-gray-500 mt-1">
					View marks, percentage and grades
				  </p>
				</button>
				
				<button
				  onClick={() => navigate("/student/homework")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <NotebookPen className="w-6 h-6 mb-3 text-indigo-600" />

				  <h3 className="font-semibold text-gray-800">
					Homework
				  </h3>

				  <p className="text-sm text-gray-500 mt-1">
					View assigned homework
				  </p>
				</button>
			  </div>
			</div>
      </main>
    </div>
  );
}

export default StudentDashboard;