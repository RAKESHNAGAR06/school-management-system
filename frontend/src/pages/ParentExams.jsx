import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentExams() {
	const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
		  const fetchExams = async () => {
			try {
			  const response = await apiRequest("/parents/exams");
			  const data = await response.json();

			  if (data.success) {
				setExams(data.data);
			  }
			} catch (error) {
			  console.error("Parent exams error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchExams();
		}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Child Exams
        </h1>

        <p className="mt-2 text-gray-500">
          View your child&apos;s upcoming and scheduled exams here.
        </p>
		
		<div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
		  {loading ? (
			<p className="p-5 text-gray-500">Loading exams...</p>
		  ) : exams.length === 0 ? (
			<p className="p-5 text-gray-500">No exams found.</p>
		  ) : (
			<div className="overflow-x-auto">
			  <table className="w-full text-sm">
				<thead className="bg-gray-50 border-b">
				  <tr>
					<th className="px-5 py-3 text-left text-gray-600">Exam</th>
					<th className="px-5 py-3 text-left text-gray-600">Subject</th>
					<th className="px-5 py-3 text-left text-gray-600">Date</th>
					<th className="px-5 py-3 text-left text-gray-600">Time</th>
					<th className="px-5 py-3 text-left text-gray-600">Duration</th>
					<th className="px-5 py-3 text-left text-gray-600">Total Marks</th>
				  </tr>
				</thead>

				<tbody>
				  {exams.map((exam) => (
					<tr key={exam._id} className="border-b last:border-0">
					  <td className="px-5 py-4 font-medium text-gray-800">
						{exam.examName || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{exam.subjectName || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{exam.examDate
						  ? new Date(exam.examDate).toLocaleDateString()
						  : "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{exam.startTime || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{exam.duration ? `${exam.duration} min` : "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{exam.totalMarks ?? "-"}
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

export default ParentExams;