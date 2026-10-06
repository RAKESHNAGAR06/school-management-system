import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, FileText } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { API_BASE_URL } from "../utils/api";

function AddExam() {
  const navigate = useNavigate();
  const API = `${API_BASE_URL}/exams`;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    examName: "",
    examType: "unit-test",
    className: "",
    section: "",
    subjectName: "",
    examDate: "",
    startTime: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const response = await apiRequest("/exams", {
  method: "POST",
  body: JSON.stringify(formData),
});

      const result = await response.json();

      if (result.success) {
        alert("Exam created successfully!");
        navigate("/admin/exams");
      } else {
        alert(result.message || "Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Something went wrong while connecting to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                to="/admin/exams"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition mb-2"
              >
                <ArrowLeft size={16} />
                Back to Exams
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                Add New Exam
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details to schedule a new examination
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Exam Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="examName"
                      required
                      placeholder="e.g. Mathematics Mid-Term Exam"
                      value={formData.examName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Exam Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="examType"
                      required
                      value={formData.examType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unit-test">Unit Test</option>
                      <option value="mid-term">Mid Term</option>
                      <option value="final">Final</option>
                      <option value="pre-board">Pre Board</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Subject Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      required
                      placeholder="e.g. Mathematics"
                      value={formData.subjectName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Class Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="className"
                      required
                      placeholder="e.g. Class 10"
                      value={formData.className}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      name="section"
                      placeholder="e.g. A"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule & Timing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Schedule & Timing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Exam Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="examDate"
                      required
                      value={formData.examDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (e.g. 2 Hours / 90 mins)
                    </label>
                    <input
                      type="text"
                      name="duration"
                      placeholder="e.g. 2.5 Hours"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Marks & Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                  Marks & Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      required
                      min="0"
                      placeholder="e.g. 100"
                      value={formData.totalMarks}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Passing Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      min="0"
                      placeholder="e.g. 33"
                      value={formData.passingMarks}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Mark as Active Exam
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Link
                  to="/admin/exams"
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddExam;