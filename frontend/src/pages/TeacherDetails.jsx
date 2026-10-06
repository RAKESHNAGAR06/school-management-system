import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, BookOpen } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function TeacherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await apiRequest("/teachers");

        const data = await response.json();

        if (data.success) {
          const foundTeacher = data.data.find(
            (item) => item._id === id
          );

          setTeacher(foundTeacher);
        }
      } catch (error) {
        console.error("Error fetching teacher:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <p className="text-gray-500">Loading teacher...</p>
        </main>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Teacher not found
            </h2>

            <button
              onClick={() => navigate("/admin/teachers")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Teachers
            </button>
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Teacher Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View complete teacher information
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/teachers")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Profile */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="bg-blue-600 px-6 py-8">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600">
                <User size={40} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {teacher.name}
                </h2>

                <p className="mt-1 text-blue-100">
                  {teacher.subject || "Teacher"}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    teacher.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {teacher.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <div className="rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">
                  Personal Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">
                    {teacher.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium capitalize text-gray-800">
                    {teacher.gender || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <p className="font-medium text-gray-800">
                      {teacher.phone || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <p className="font-medium text-gray-800">
                      {teacher.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">
                  Professional Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Subject</p>
                  <p className="font-medium text-gray-800">
                    {teacher.subject || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Qualification
                  </p>
                  <p className="font-medium text-gray-800">
                    {teacher.qualification || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Experience
                  </p>
                  <p className="font-medium text-gray-800">
                    {teacher.experience || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Joining Date
                  </p>
                  <p className="font-medium text-gray-800">
                    {teacher.joiningDate
                      ? new Date(
                          teacher.joiningDate
                        ).toLocaleDateString("en-IN")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-5 md:col-span-2">
              <h3 className="mb-3 font-semibold text-gray-800">
                Address
              </h3>

              <p className="text-gray-600">
                {teacher.address || "No address available"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t p-6">
            <button
              onClick={() =>
                navigate(`/admin/teachers/edit/${teacher._id}`)
              }
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Edit Teacher
            </button>

            <button
              onClick={() => navigate("/admin/teachers")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Back to List
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherDetails;