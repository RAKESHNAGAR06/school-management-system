import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { API_BASE_URL } from "../utils/api";

function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = `${API_BASE_URL}/exams/${id}`;

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(`/exams/${id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setExam(result.data);
        } else {
          alert(result.message || "Failed to load exam details");
          navigate("/admin/exams");
        }
      } catch (error) {
        console.error("Error fetching exam details:", error);
        alert("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id, API, navigate]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(API, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Exam deleted successfully");
        navigate("/admin/exams");
      } else {
        alert(result.message || "Failed to delete exam");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatExamType = (type) => {
    if (!type) return "-";
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/admin/exams"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft size={16} />
              Back to Exams
            </Link>

            {!loading && exam && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/admin/exams/edit/${exam._id}`}
                  className="inline-flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2 rounded-lg font-medium text-sm transition"
                >
                  <Pencil size={16} />
                  Edit
                </Link>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium text-sm transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
              Loading exam details...
            </div>
          ) : !exam ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
              No exam information found.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Banner Card */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {formatExamType(exam.examType)}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          exam.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {exam.isActive ? (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Inactive
                          </>
                        )}
                      </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800">
                      {exam.examName}
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                      {exam.subjectName} • {exam.className}
                      {exam.section ? ` (Sec ${exam.section})` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Schedule Card */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    Schedule Information
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Exam Date</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(exam.examDate)}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Start Time</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {exam.startTime || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-gray-800">
                        {exam.duration || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic & Marks Card */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b flex items-center gap-2">
                    <Award size={18} className="text-purple-600" />
                    Academic & Marks Details
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Subject</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <BookOpen size={14} className="text-gray-400" />
                        {exam.subjectName}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Class & Section</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1">
                        <GraduationCap size={14} className="text-gray-400" />
                        {exam.className} {exam.section ? `- ${exam.section}` : ""}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-50">
                      <span className="text-gray-500">Total Marks</span>
                      <span className="font-bold text-gray-800">
                        {exam.totalMarks}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Passing Marks</span>
                      <span className="font-medium text-green-600">
                        {exam.passingMarks || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ExamDetails;