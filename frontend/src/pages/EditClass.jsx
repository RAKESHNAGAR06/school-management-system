import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    className: "",
    section: "",
    classTeacher: "",
    roomNumber: "",
    capacity: 40,
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchClass = async () => {
    try {
      const response = await apiRequest(`/classes/${id}`);

      const data = await response.json();

      if (data.success) {
        setFormData({
          className: data.data.className || "",
          section: data.data.section || "",
          classTeacher: data.data.classTeacher || "",
          roomNumber: data.data.roomNumber || "",
          capacity: data.data.capacity || 40,
          description: data.data.description || "",
          isActive: data.data.isActive ?? true,
        });
      } else {
        alert(data.message || "Class not found");
        navigate("/admin/classes");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch class");
      navigate("/admin/classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
  }, [id]);

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
     const response = await apiRequest(`/classes/${id}`, {
  method: "PUT",
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (data.success) {
        alert("Class updated successfully!");
        navigate(`/admin/classes/${id}`);
      } else {
        alert(data.message || "Failed to update class");
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
          <div className="text-center py-10 text-gray-500">
            Loading class...
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
              onClick={() =>
                navigate(`/admin/classes/${id}`)
              }
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Class
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Update class information
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>

                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Class Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Teacher
                  </label>

                  <input
                    type="text"
                    name="classTeacher"
                    value={formData.classTeacher}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room Number
                  </label>

                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Capacity
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Status */}
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      Active Class
                    </span>
                  </label>
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  ></textarea>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/classes/${id}`)
                  }
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Update Class"}
                </button>

              </div>

            </form>

          </div>
        </div>
      </main>
    </div>
  );
}

export default EditClass;