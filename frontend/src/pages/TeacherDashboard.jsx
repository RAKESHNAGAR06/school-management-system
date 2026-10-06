import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import apiRequest from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
} from "lucide-react";

function TeacherDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [dashboardData, setDashboardData] = useState({
	  myClasses: 0,
	  students: 0,
	  attendancePercentage: 0,
	  upcomingExams: 0,
	});
  const navigate = useNavigate();
  
  useEffect(() => {
	  const fetchDashboard = async () => {
		try {
		  const response = await apiRequest("/teachers/dashboard");
		  const data = await response.json();

		  if (data.success) {
			setDashboardData(data.data);
		  }
		} catch (error) {
		  console.error("Teacher dashboard error:", error);
		}
	  };

	  fetchDashboard();
	}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Teacher Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome, {user?.name || "Teacher"}
        </p>
		
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">

	  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
		<p className="text-sm text-gray-500">My Classes</p>
		<h2 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.myClasses}</h2>
	  </div>

	  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
		<p className="text-sm text-gray-500">Students</p>
		<h2 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.students}</h2>
	  </div>

	  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
		<p className="text-sm text-gray-500">Today's Attendance</p>
		<h2 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.attendancePercentage}%</h2>
	  </div>

	  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
		<p className="text-sm text-gray-500">Upcoming Exams</p>
		<h2 className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.upcomingExams}</h2>
	  </div>

	</div>
	
	<div className="mt-8">
	  <h2 className="text-xl font-bold text-gray-800 mb-4">
		Quick Actions
	  </h2>

	  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
		<button
		  onClick={() => navigate("/teacher/attendance")}
		  className="bg-white border hover:bg-gray-50 rounded-xl p-5 text-left shadow-sm"
		>
		  <CalendarCheck className="w-6 h-6 mb-3 text-blue-600" />

		  <h3 className="font-semibold text-gray-800">
			Mark Attendance
		  </h3>

		  <p className="text-sm text-gray-500 mt-1">
			Mark or update today&apos;s attendance
		  </p>
		</button>

		<button
		  onClick={() => navigate("/teacher/exams")}
		  className="bg-white border hover:bg-gray-50 rounded-xl p-5 text-left shadow-sm">
		  <ClipboardList className="w-6 h-6 mb-3 text-purple-600" />

		  <h3 className="font-semibold text-gray-800">
			View Exams
		  </h3>

		  <p className="text-sm text-gray-500 mt-1">
			Check exams for assigned classes
		  </p>
		</button>

		<button
		  onClick={() => navigate("/teacher/results")}
		  className="bg-white border hover:bg-gray-50 rounded-xl p-5 text-left shadow-sm">
		  <FileText className="w-6 h-6 mb-3 text-green-600" />

		  <h3 className="font-semibold text-gray-800">
			Manage Results
		  </h3>

		  <p className="text-sm text-gray-500 mt-1">
			Add, edit and manage student results
		  </p>
		</button>
	  </div>
	</div>
      </main>
    </div>
  );
}

export default TeacherDashboard;