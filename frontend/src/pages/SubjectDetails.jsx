import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
     const response = await apiRequest(`/subjects/${id}`);

      const data = await response.json();

      if (data.success) {
        setSubject(data.data);
      } else {
        alert(data.message || "Subject not found");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Loading subject details...
          </div>
        </main>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Subject not found
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/subjects")}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Subject Details
                </h1>
                <p className="text-sm text-gray-500">
                  View complete subject information
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/admin/subjects/edit/${subject._id}`)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Pencil size={18} />
              Edit Subject
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

            {/* Subject Header */}
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <BookOpen className="text-blue-600" size={28} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {subject.subjectName}
                </h2>

                <p className="text-sm text-gray-500">
                  Subject Code: {subject.subjectCode}
                </p>
              </div>

              <div className="ml-auto">
                {subject.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-600">
                    <CheckCircle size={16} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-600">
                    <XCircle size={16} />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Subject Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Subject Name
                  </p>
                  <p className="font-medium text-gray-800">
                    {subject.subjectName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Subject Code
                  </p>
                  <p className="font-medium text-gray-800">
                    {subject.subjectCode || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Class
                  </p>
                  <p className="font-medium text-gray-800">
                    {subject.className || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Teacher
                  </p>
                  <p className="font-medium text-gray-800">
                    {subject.teacherName || "-"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400 mb-1">
                    Description
                  </p>
                  <p className="font-medium text-gray-800">
                    {subject.description || "-"}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default SubjectDetails;