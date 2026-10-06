import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentAttendance() {
	const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
		  const fetchAttendance = async () => {
			try {
			  const response = await apiRequest("/parents/attendance");
			  const data = await response.json();

			  if (data.success) {
				setAttendance(data.data);
			  }
			} catch (error) {
			  console.error("Parent attendance error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchAttendance();
		}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Child Attendance
        </h1>

        <p className="mt-2 text-gray-500">
          View your child&apos;s attendance records here.
        </p>
		
		<div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
		  {loading ? (
			<p className="p-5 text-gray-500">Loading attendance...</p>
		  ) : attendance.length === 0 ? (
			<p className="p-5 text-gray-500">No attendance records found.</p>
		  ) : (
			<div className="overflow-x-auto">
			  <table className="w-full text-sm">
				<thead className="bg-gray-50 border-b">
				  <tr>
					<th className="px-5 py-3 text-left text-gray-600">Date</th>
					<th className="px-5 py-3 text-left text-gray-600">Class</th>
					<th className="px-5 py-3 text-left text-gray-600">Section</th>
					<th className="px-5 py-3 text-left text-gray-600">Status</th>
					<th className="px-5 py-3 text-left text-gray-600">Remarks</th>
				  </tr>
				</thead>

				<tbody>
				  {attendance.map((record) => (
					<tr key={record._id} className="border-b last:border-0">
					  <td className="px-5 py-4 text-gray-700">
						{new Date(record.date).toLocaleDateString()}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{record.className || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{record.section || "-"}
					  </td>

					  <td className="px-5 py-4">
						<span
						  className={`px-3 py-1 rounded-full text-xs font-medium ${
							record.status === "present"
							  ? "bg-green-100 text-green-700"
							  : record.status === "absent"
							  ? "bg-red-100 text-red-700"
							  : record.status === "late"
							  ? "bg-yellow-100 text-yellow-700"
							  : "bg-blue-100 text-blue-700"
						  }`}
						>
						  {record.status}
						</span>
					  </td>

					  <td className="px-5 py-4 text-gray-600">
						{record.remarks || "-"}
					  </td>
					</tr>
				  ))}
				</tbody>
			  </table>
			</div>
		  )}
		</div>
      </main>
    </div>
  );
}

export default ParentAttendance;