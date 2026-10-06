import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  Wallet,
  UserRound,
  NotebookPen,
} from "lucide-react";

function ParentDashboard() {
	const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	
	useEffect(() => {
		  const fetchDashboard = async () => {
			try {
			  const response = await apiRequest("/parents/dashboard");
			  const data = await response.json();

			  if (data.success) {
				setDashboardData(data.data);
			  }
			} catch (error) {
			  console.error("Parent dashboard error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchDashboard();
		}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Parent Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome to the parent portal.
        </p>
		
		{loading ? (
			  <p className="mt-6 text-gray-500">Loading dashboard...</p>
			) : dashboardData ? (
			  <>
				<div className="mt-2">
				  <p className="text-gray-500">
					Parent: {dashboardData.parentName}
				  </p>

				  <p className="text-gray-500">
					Child: {dashboardData.studentName} — Class{" "}
					{dashboardData.className} {dashboardData.section}
				  </p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
				  <div className="bg-white rounded-xl border p-5 shadow-sm">
					<p className="text-sm text-gray-500">
					  Attendance
					</p>

					<h2 className="text-2xl font-bold text-gray-800 mt-2">
					  {dashboardData.attendancePercentage}%
					</h2>
				  </div>

				  <div className="bg-white rounded-xl border p-5 shadow-sm">
					<p className="text-sm text-gray-500">
					  Upcoming Exams
					</p>

					<h2 className="text-2xl font-bold text-gray-800 mt-2">
					  {dashboardData.upcomingExams}
					</h2>
				  </div>

				  <div className="bg-white rounded-xl border p-5 shadow-sm">
					<p className="text-sm text-gray-500">
					  Results Available
					</p>

					<h2 className="text-2xl font-bold text-gray-800 mt-2">
					  {dashboardData.resultsCount}
					</h2>
				  </div>
				</div>
			  </>
			) : (
			  <p className="mt-6 text-red-500">
				Unable to load dashboard data.
			  </p>
			)}
			
			<div className="mt-8">
			  <h2 className="text-lg font-semibold text-gray-800 mb-4">
				Quick Actions
			  </h2>

			  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<button
				  onClick={() => navigate("/parent/attendance")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <CalendarCheck className="w-6 h-6 mb-3 text-blue-600" />
				  <h3 className="font-semibold text-gray-800">Attendance</h3>
				  <p className="text-sm text-gray-500 mt-1">
					View child attendance
				  </p>
				</button>

				<button
				  onClick={() => navigate("/parent/exams")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <ClipboardList className="w-6 h-6 mb-3 text-purple-600" />
				  <h3 className="font-semibold text-gray-800">Exams</h3>
				  <p className="text-sm text-gray-500 mt-1">
					View exam schedule
				  </p>
				</button>

				<button
				  onClick={() => navigate("/parent/results")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <FileText className="w-6 h-6 mb-3 text-green-600" />
				  <h3 className="font-semibold text-gray-800">Results</h3>
				  <p className="text-sm text-gray-500 mt-1">
					Check exam results
				  </p>
				</button>

				<button
				  onClick={() => navigate("/parent/fees")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <Wallet className="w-6 h-6 mb-3 text-orange-600" />
				  <h3 className="font-semibold text-gray-800">Fees</h3>
				  <p className="text-sm text-gray-500 mt-1">
					View fee details
				  </p>
				</button>
				
				<button
				  onClick={() => navigate("/parent/child")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <UserRound className="w-6 h-6 mb-3 text-indigo-600" />
				  <h3 className="font-semibold text-gray-800">My Child</h3>
				  <p className="text-sm text-gray-500 mt-1">
					View child profile
				  </p>
				</button>
				
				<button
				  onClick={() => navigate("/parent/homework")}
				  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition text-left">
				  <NotebookPen className="w-6 h-6 mb-3 text-indigo-600" />

				  <h3 className="font-semibold text-gray-800">
					Homework
				  </h3>

				  <p className="text-sm text-gray-500 mt-1">
					View child homework
				  </p>
				</button>
			  </div>
			</div>
      </main>
    </div>
  );
}

export default ParentDashboard;