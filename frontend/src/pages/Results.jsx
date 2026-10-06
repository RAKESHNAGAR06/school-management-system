import { useEffect, useState } from "react";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function Results() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
     const response = await apiRequest("/results");


      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = results.filter((result) => {
    const studentName =
      result.studentName ||
      result.studentId?.name ||
      "";

    const examName =
      result.examName ||
      result.examId?.examName ||
      "";

    const subjectName = result.subjectName || "";

    const searchText = search.toLowerCase();

    return (
      studentName.toLowerCase().includes(searchText) ||
      examName.toLowerCase().includes(searchText) ||
      subjectName.toLowerCase().includes(searchText)
    );
  });
  
  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this result?"
  );

  if (!confirmDelete) return;

  try {
 const response = await apiRequest(`/results/${id}`, {
  method: "DELETE",
});

    const data = await response.json();

    if (data.success) {
      alert("Result deleted successfully");

      setResults((prevResults) =>
        prevResults.filter((result) => result._id !== id)
      );
    } else {
      alert(data.message || "Failed to delete result");
    }
  } catch (error) {
    console.error("Delete result error:", error);
    alert("Something went wrong");
  }
};

 return (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    <Topbar />

    <main className="ml-64 pt-20 p-6">
      <div className="mx-auto max-w-7xl">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Exam Results
          </h1>

          <p className="text-gray-500 mt-1">
            Manage student exam results and marks
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/results/add")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Result
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search student, exam or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading results...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Student
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Exam
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Subject
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Marks
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Percentage
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Grade
                  </th>
				  
				  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">
					  Actions
					</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => (
                  <tr
                    key={result._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {result.studentName || result.studentId?.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {result.examName || result.examId?.examName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {result.subjectName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {result.obtainedMarks} / {result.totalMarks}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {result.percentage}%
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {result.grade}
                      </span>
                    </td>
					
					<td className="px-6 py-4">
					  <button
						onClick={() => navigate(`/admin/results/${result._id}`)}
						className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
						title="View Result"
					  >
						<Eye size={17} />
					  </button>
					  
					  <button
					  onClick={() => handleDelete(result._id)}
					  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
					  title="Delete Result"
					>
					  <Trash2 size={18} />
					</button>
					</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>
      </div>
    </main>
  </div>
  );
}

export default Results;