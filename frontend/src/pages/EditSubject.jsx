import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function EditSubject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subjectName: "",
    subjectCode: "",
    className: "",
    teacherName: "",
    description: "",
    isActive: true,
  });


  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const response = await apiRequest(`/subjects/${id}`);

      const data = await response.json();

      if (data.success) {
        setFormData({
          subjectName: data.data.subjectName || "",
          subjectCode: data.data.subjectCode || "",
          className: data.data.className || "",
          teacherName: data.data.teacherName || "",
          description: data.data.description || "",
          isActive: data.data.isActive,
        });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);

    try {
      const response = await apiRequest(`/subjects/${id}`, {
  method: "PUT",
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (data.success) {
        alert("Subject updated successfully!");
        navigate(`/admin/subjects/${id}`);
      } else {
        alert(data.message || "Failed to update subject");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Loading subject...
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
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(`/admin/subjects/${id}`)}
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Subject
              </h1>

              <p className="text-sm text-gray-500">
                Update subject information
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600" size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Subject Information
                </h2>

                <p className="text-xs text-gray-400">
                  Modify the details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">

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
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
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
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>

                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    placeholder="e.g. Class 10"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher
                  </label>

                  <input
                    type="text"
                    name="teacherName"
                    value={formData.teacherName}
                    onChange={handleChange}
                    placeholder="Teacher name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
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
                    placeholder="Enter subject description"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Active */}
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
                      Subject is Active
                    </span>
                  </label>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() => navigate(`/admin/subjects/${id}`)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Subject"}
                </button>

              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditSubject;