import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentResults() {
	const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
	  const fetchResults = async () => {
		try {
		  const response = await apiRequest("/parents/results");
		  const data = await response.json();

		  if (data.success) {
			setResults(data.data);
		  }
		} catch (error) {
		  console.error("Parent results error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchResults();
	}, []);
	
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Child Results
        </h1>

        <p className="mt-2 text-gray-500">
          View your child&apos;s exam results, marks and grades here.
        </p>
		
		<div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
		  {loading ? (
			<p className="p-5 text-gray-500">Loading results...</p>
		  ) : results.length === 0 ? (
			<p className="p-5 text-gray-500">No results found.</p>
		  ) : (
			<div className="overflow-x-auto">
			  <table className="w-full text-sm">
				<thead className="bg-gray-50 border-b">
				  <tr>
					<th className="px-5 py-3 text-left text-gray-600">Exam</th>
					<th className="px-5 py-3 text-left text-gray-600">Subject</th>
					<th className="px-5 py-3 text-left text-gray-600">Marks</th>
					<th className="px-5 py-3 text-left text-gray-600">Percentage</th>
					<th className="px-5 py-3 text-left text-gray-600">Grade</th>
					<th className="px-5 py-3 text-left text-gray-600">Remarks</th>
				  </tr>
				</thead>

				<tbody>
				  {results.map((result) => (
					<tr key={result._id} className="border-b last:border-0">
					  <td className="px-5 py-4 font-medium text-gray-800">
						{result.examName || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{result.subjectName || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{result.obtainedMarks} / {result.totalMarks}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{result.percentage ?? 0}%
					  </td>

					  <td className="px-5 py-4">
						<span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
						  {result.grade || "-"}
						</span>
					  </td>

					  <td className="px-5 py-4 text-gray-600">
						{result.remarks || "-"}
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

export default ParentResults;