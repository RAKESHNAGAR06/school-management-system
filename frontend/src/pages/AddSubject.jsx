import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function AddSubject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    className: "",
    teacherName: "",
    description: "",
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest("/subjects", {
  method: "POST",
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (data.success) {
        alert("Subject added successfully!");
        navigate("/admin/subjects");
      } else {
        alert(data.message || "Failed to add subject");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/admin/subjects")}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Add New Subject
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Create a new subject
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200">
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Subject Information
                </h2>

                <p className="text-xs text-gray-500">
                  Enter subject details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Subject Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Name
                  </label>

                  <input
                    type="text"
                    name="subjectName"
                    value={formData.subjectName}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Subject Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Code
                  </label>

                  <input
                    type="text"
                    name="subjectCode"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    placeholder="e.g. MATH101"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Class Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>

                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    placeholder="e.g. Class 10"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Teacher Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Name
                  </label>

                  <input
                    type="text"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="Enter teacher name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Enter subject description..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  ></textarea>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      Active Subject
                    </span>
                  </label>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() => navigate("/admin/subjects")}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add Subject
                </button>

              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddSubject;