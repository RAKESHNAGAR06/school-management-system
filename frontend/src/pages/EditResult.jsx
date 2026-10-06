import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ArrowLeft, Save } from "lucide-react";
import apiRequest from "../utils/api";

function EditResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [obtainedMarks, setObtainedMarks] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await apiRequest(`/results/${id}`);

        const data = await response.json();

        if (data.success) {
          setResult(data.data);
          setObtainedMarks(data.data.obtainedMarks);
          setRemarks(data.data.remarks || "");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(obtainedMarks) > Number(result.totalMarks)) {
      alert("Obtained marks cannot be greater than total marks");
      return;
    }

    try {
      setSaving(true);

     const response = await apiRequest(`/results/${id}`, {
  method: "PUT",
  body: JSON.stringify({
    ...result,
    obtainedMarks: Number(obtainedMarks),
    remarks: remarks,
  }),
});


      const data = await response.json();

      if (data.success) {
        alert("Result updated successfully");
        navigate(`/admin/results/${id}`);
      } else {
        alert(data.message || "Failed to update result");
      }
    } catch (error) {
      console.error("Error updating result:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!result) {
    return <div className="p-6">Result not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={() => navigate(`/admin/results/${id}`)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to Result
          </button>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">
              Edit Result
            </h1>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold text-gray-800">
                  {result.studentName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Exam</p>
                <p className="font-semibold text-gray-800">
                  {result.examName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-semibold text-gray-800">
                  {result.subjectName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="font-semibold text-gray-800">
                  {result.totalMarks}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Obtained Marks
                </label>

                <input
                  type="number"
                  min="0"
                  max={result.totalMarks}
                  value={obtainedMarks}
                  onChange={(e) => setObtainedMarks(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="4"
                  placeholder="Enter remarks..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/results/${id}`)}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditResult;