import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";


import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";
import AddStudent from "./pages/AddStudent";
import Students from "./pages/Students";
import EditStudent from "./pages/EditStudent";
import StudentDetails from "./pages/StudentDetails";
import AddTeacher from "./pages/AddTeacher";
import Teachers from "./pages/Teachers";
import TeacherDetails from "./pages/TeacherDetails";
import EditTeacher from "./pages/EditTeacher";
import AddParent from "./pages/AddParent";
import Parents from "./pages/Parents";
import ParentDetails from "./pages/ParentDetails";
import EditParent from "./pages/EditParent";
import AddClass from "./pages/AddClass";
import Classes from "./pages/Classes";
import ClassDetails from "./pages/ClassDetails";
import EditClass from "./pages/EditClass";
import AddSubject from "./pages/AddSubject";
import Subjects from "./pages/Subjects";
import SubjectDetails from "./pages/SubjectDetails";
import EditSubject from "./pages/EditSubject";
import Attendance from "./pages/Attendance";
import AddAttendance from "./pages/AddAttendance";
import AttendanceDetails from "./pages/AttendanceDetails";
import EditAttendance from "./pages/EditAttendance";
import Fees from "./pages/Fees";
import AddFee from "./pages/AddFee";
import FeeDetails from "./pages/FeeDetails";
import EditFee from "./pages/EditFee";
import Exams from "./pages/Exams";
import AddExam from "./pages/AddExam";
import EditExam from "./pages/EditExam";
import ExamDetails from "./pages/ExamDetails";
import Results from "./pages/Results";
import AddResult from "./pages/AddResult";
import ResultDetails from "./pages/ResultDetails";
import EditResult from "./pages/EditResult";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherExams from "./pages/TeacherExams";
import TeacherResults from "./pages/TeacherResults";
import TeacherProfile from "./pages/TeacherProfile";
import StudentDashboard from "./pages/StudentDashboard";
import StudentAttendance from "./pages/StudentAttendance";
import StudentExams from "./pages/StudentExams";
import StudentResults from "./pages/StudentResults";
import StudentProfile from "./pages/StudentProfile";
import ParentDashboard from "./pages/ParentDashboard";
import ParentChild from "./pages/ParentChild";
import ParentAttendance from "./pages/ParentAttendance";
import ParentExams from "./pages/ParentExams";
import ParentResults from "./pages/ParentResults";
import ParentFees from "./pages/ParentFees";
import ParentProfile from "./pages/ParentProfile";
import TeacherHomework from "./pages/TeacherHomework";
import StudentHomework from "./pages/StudentHomework";
import ParentHomework from "./pages/ParentHomework";
import Timetable from "./pages/Timetable";
import TeacherTimetable from "./pages/TeacherTimetable";
import StudentTimetable from "./pages/StudentTimetable";
import ParentTimetable from "./pages/ParentTimetable";
import AdminHomework from "./pages/AdminHomework";
import AdminNotifications from "./pages/AdminNotifications";
import Notifications from "./pages/Notifications";
import EventsHolidays from "./pages/EventsHolidays";
import MyEvents from "./pages/MyEvents";
import SchoolAIAssistant from "./pages/SchoolAIAssistant";
import ArchivedRecords from "./pages/ArchivedRecords";
import ChangePassword from "./pages/ChangePassword";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />
		
		{/* Add student */}
		<Route
		  path="/admin/students/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddStudent />
			</ProtectedRoute>
		  }
		/>
		
		
		<Route
		  path="/admin/students"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Students />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/students/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditStudent />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/students/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <StudentDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/teachers/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddTeacher />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/teachers"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Teachers />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/teachers/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <TeacherDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/teachers/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditTeacher />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/parents/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddParent />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/parents"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Parents />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/parents/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <ParentDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/parents/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditParent />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/classes/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddClass />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/classes"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Classes />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/classes/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <ClassDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/classes/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditClass />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/subjects/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddSubject />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/subjects"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Subjects />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/subjects/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <SubjectDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/subjects/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditSubject />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/attendance"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Attendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/attendance/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddAttendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/attendance/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AttendanceDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/attendance/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditAttendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/fees"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Fees />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/fees/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddFee />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/fees/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <FeeDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/fees/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditFee />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/exams"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Exams />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/exams/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddExam />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/exams/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditExam />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/exams/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <ExamDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/results"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Results />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/results/add"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AddResult />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/results/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <ResultDetails />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/results/edit/:id"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EditResult />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/reports"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Reports />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/settings"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Settings />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/dashboard"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherDashboard />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/classes"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherClasses />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/students"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherStudents />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/attendance"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherAttendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/exams"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherExams />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/results"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherResults />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/profile"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherProfile />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/dashboard"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentDashboard />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/attendance"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentAttendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/exams"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentExams />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/results"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentResults />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/profile"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentProfile />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/dashboard"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentDashboard />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/child"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentChild />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/attendance"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentAttendance />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/exams"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentExams />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/results"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentResults />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/fees"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentFees />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/profile"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentProfile />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/homework"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherHomework />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/homework"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentHomework />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/homework"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentHomework />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/timetable"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <Timetable />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/timetable"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <TeacherTimetable />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/student/timetable"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <StudentTimetable />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/parent/timetable"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <ParentTimetable />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/homework"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AdminHomework />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/notifications"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <AdminNotifications />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/notifications"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <Notifications />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/student/notifications"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <Notifications />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/parent/notifications"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <Notifications />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/events"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <EventsHolidays />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/teacher/events"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <MyEvents />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/student/events"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <MyEvents />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/parent/events"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <MyEvents />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/ai-assistant"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <SchoolAIAssistant />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/teacher/ai-assistant"
		  element={
			<ProtectedRoute allowedRoles={["teacher"]}>
			  <SchoolAIAssistant />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/student/ai-assistant"
		  element={
			<ProtectedRoute allowedRoles={["student"]}>
			  <SchoolAIAssistant />
			</ProtectedRoute>
		  }
		/>

		<Route
		  path="/parent/ai-assistant"
		  element={
			<ProtectedRoute allowedRoles={["parent"]}>
			  <SchoolAIAssistant />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/admin/archived"
		  element={
			<ProtectedRoute allowedRoles={["admin"]}>
			  <ArchivedRecords />
			</ProtectedRoute>
		  }
		/>
		
		<Route
		  path="/change-password"
		  element={
			<ProtectedRoute
			  allowedRoles={[
				"admin",
				"teacher",
				"student",
				"parent",
			  ]}
			>
			  <ChangePassword />
			</ProtectedRoute>
		  }
		/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;