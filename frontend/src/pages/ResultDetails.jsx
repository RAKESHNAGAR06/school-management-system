import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  User,
  FileText,
  BookOpen,
  Award,
  MessageSquare,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { API_BASE_URL } from "../utils/api";


function ResultDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

 const API = `${API_BASE_URL}/results/${id}`;

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await apiRequest(`/results/${id}`);
        const data = await response.json();

        if (data.success) {
          setResult(data.data);
        } else {
          alert(data.message || "Result not found");
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [API]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-10 text-gray-500">
            Loading result...
          </div>
        </main>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500">Result not found.</p>

            <button
              onClick={() => navigate("/admin/results")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Results
            </button>
          </div>
        </main>
      </div>
    );
  }

  const studentName =
    result.studentName || result.studentId?.name || "-";

  const examName =
    result.examName || result.examId?.examName || "-";

  const percentage = Number(result.percentage || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/results")}
                className="p-2 rounded-lg border bg-white hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Result Details
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  View complete examination result
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/admin/results/edit/${result._id}`)
              }
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
            >
              <Pencil size={18} />
              Edit Result
            </button>
          </div>

          {/* Student & Exam Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={22} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Student Information
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="font-medium text-gray-800">
                    {studentName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">
                    {result.studentId?.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-medium text-gray-800">
                    {result.studentId?.className || "-"}
                    {result.studentId?.section
                      ? ` - ${result.studentId.section}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="text-purple-600" size={22} />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  Exam Information
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Exam Name</p>
                  <p className="font-medium text-gray-800">
                    {examName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-800">
                    {result.subjectName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Exam Type</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {result.examId?.examType
                      ? result.examId.examType.replace("-", " ")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Marks Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="text-green-600" size={22} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Marks Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500">
                  Total Marks
                </p>

                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {result.totalMarks}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500">
                  Obtained Marks
                </p>

                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {result.obtainedMarks}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500">
                  Percentage
                </p>

                <p className="text-3xl font-bold text-green-600 mt-2">
                  {percentage}%
                </p>
              </div>

            </div>
          </div>

          {/* Grade */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="text-yellow-600" size={22} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Grade
              </h2>
            </div>

            <div className="flex items-center justify-center py-6">
              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {result.grade || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-xl shadow-sm border p-6">

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MessageSquare className="text-orange-600" size={22} />
              </div>

              <h2 className="text-lg font-semibold text-gray-800">
                Remarks
              </h2>
            </div>

            <p className="text-gray-600">
              {result.remarks || "No remarks added."}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ResultDetails;