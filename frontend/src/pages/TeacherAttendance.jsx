import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function TeacherAttendance() {
	
	const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
	const [attendance, setAttendance] = useState({});
	const [attendanceDate, setAttendanceDate] = useState(
			  new Date().toISOString().split("T")[0]
			);
			
			
	const handleSaveAttendance = async () => {
	  try {
		const attendanceData = students.map((student) => ({
		  studentId: student._id,
		  status: attendance[student._id] || "present",
		}));

		const response = await apiRequest("/teachers/attendance", {
		  method: "POST",
		  body: JSON.stringify({
			date: attendanceDate,
			attendance: attendanceData,
		  }),
		});

		const data = await response.json();

		if (data.success) {
		  alert("Attendance saved successfully");
		} else {
		  alert(data.message || "Failed to save attendance");
		}
	  } catch (error) {
		console.error("Save attendance error:", error);
		alert("Something went wrong");
	  }
	};
	
	useEffect(() => {
		  const fetchAttendanceByDate = async () => {
			if (!attendanceDate || students.length === 0) return;

			try {
			  const response = await apiRequest(
				`/teachers/attendance?date=${attendanceDate}`
			  );

			  const data = await response.json();

			  if (data.success) {
				const updatedAttendance = {};

				students.forEach((student) => {
				  updatedAttendance[student._id] = "present";
				});

				data.data.forEach((record) => {
				  updatedAttendance[record.studentId] = record.status;
				});

				setAttendance(updatedAttendance);
			  }
			} catch (error) {
			  console.error("Error loading attendance:", error);
			}
		  };

		  fetchAttendanceByDate();
		}, [attendanceDate, students]);
	
	

    useEffect(() => {
		  const fetchStudents = async () => {
			try {
			  const response = await apiRequest("/teachers/attendance/students");
			  const data = await response.json();

			  if (data.success) {
				setStudents(data.data);
				const initialAttendance = {};
				data.data.forEach((student) => {
				  initialAttendance[student._id] = "present";
				});

				setAttendance(initialAttendance);
			  }
			} catch (error) {
			  console.error("Attendance students error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchStudents();
		}, []);
		
return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Attendance
        </h1>

        <p className="mt-2 text-gray-500">
          Mark and view attendance for your assigned classes.
        </p>
		
		<div className="mt-6 flex items-center gap-4">
		  <div>
			<label className="block text-sm font-medium text-gray-700 mb-1">
			  Attendance Date
			</label>

			<input
			  type="date"
			  value={attendanceDate}
			  onChange={(e) => setAttendanceDate(e.target.value)}
			  className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
			/>
		  </div>
</div>
		
		{loading ? (
			  <p className="mt-6 text-gray-500">Loading...</p>
			) : students.length === 0 ? (
			  <p className="mt-6 text-gray-500">No students found.</p>
			) : (
			  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
				<table className="w-full">
				  <thead className="bg-gray-50">
					<tr>
					  <th className="text-left px-4 py-3 text-sm text-gray-600">
						Roll No.
					  </th>
					  <th className="text-left px-4 py-3 text-sm text-gray-600">
						Student
					  </th>
					  <th className="text-left px-4 py-3 text-sm text-gray-600">
						Class
					  </th>
					  <th className="text-left px-4 py-3 text-sm text-gray-600">
						Section
					  </th>
					  <th className="text-left px-4 py-3 text-sm text-gray-600">
						Status
					  </th>
					</tr>
				  </thead>

				  <tbody>
					{students.map((student) => (
					  <tr
						key={student._id}
						className="border-t border-gray-100"
					  >
						<td className="px-4 py-3 text-sm">
						  {student.rollNumber || "-"}
						</td>

						<td className="px-4 py-3 text-sm font-medium text-gray-800">
						  {student.name}
						</td>

						<td className="px-4 py-3 text-sm">
						  {student.className}
						</td>

						<td className="px-4 py-3 text-sm">
						  {student.section}
						</td>

						<td className="px-4 py-3">
						  <select
							value={attendance[student._id] || "present"}
							onChange={(e) =>
							  setAttendance({
								...attendance,
								[student._id]: e.target.value,
							  })
							}
							className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
						  >
							<option value="present">Present</option>
							<option value="absent">Absent</option>
							<option value="late">Late</option>
							<option value="leave">Leave</option>
						  </select>
						</td>
					  </tr>
					))}
				  </tbody>
				</table>
			  </div>
			)}
			
			<button
			  onClick={handleSaveAttendance}
			  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
			>
			  Save Attendance
			</button>
      </main>
    </div>
  );
}

export default TeacherAttendance;