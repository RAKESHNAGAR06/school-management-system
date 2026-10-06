import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  School,
  UserRound,
  DoorOpen,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClass = async () => {
    try {
      const response = await apiRequest(`/classes/${id}`);

      const data = await response.json();

      if (data.success) {
        setClassData(data.data);
      } else {
        alert(data.message || "Class not found");
        navigate("/admin/classes");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch class details");
      navigate("/admin/classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-10 text-gray-500">
            Loading class details...
          </div>
        </main>
      </div>
    );
  }

  if (!classData) {
    return null;
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
                onClick={() => navigate("/admin/classes")}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Class Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View complete class information
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/admin/classes/edit/${classData._id}`)
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              <Pencil size={17} />
              Edit Class
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center">
                <School
                  size={30}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {classData.className}
                </h2>

                <p className="text-gray-500 mt-1">
                  Section {classData.section}
                </p>

                <div className="mt-2">
                  {classData.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                      <CheckCircle size={13} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500">
                      <XCircle size={13} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">

            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              Class Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Class */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <School size={19} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Class Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.className}
                  </p>
                </div>
              </div>

              {/* Section */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <School size={19} className="text-purple-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Section
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.section}
                  </p>
                </div>
              </div>

              {/* Teacher */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <UserRound size={19} className="text-green-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Class Teacher
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.classTeacher || "-"}
                  </p>
                </div>
              </div>

              {/* Room */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <DoorOpen size={19} className="text-orange-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Room Number
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.roomNumber || "-"}
                  </p>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Users size={19} className="text-pink-600" />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Student Capacity
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.capacity}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  {classData.isActive ? (
                    <CheckCircle size={19} className="text-green-600" />
                  ) : (
                    <XCircle size={19} className="text-red-500" />
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Status
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-1">
                    {classData.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="mt-7 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">
                Description
              </p>

              <p className="text-sm text-gray-700 leading-6">
                {classData.description || "No description available."}
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default ClassDetails;