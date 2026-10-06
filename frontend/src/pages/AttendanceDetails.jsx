import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [id]);

  const fetchAttendance = async () => {
    try {
      // 3. GET - Attendance Details / Edit Data
const response = await apiRequest(`/attendance/${id}`);

      const data = await response.json();

      if (data.success) {
        setAttendance(data.data);
      } else {
        alert(data.message || "Attendance not found");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "present":
        return {
          icon: <CheckCircle size={18} />,
          className: "bg-green-50 text-green-600",
          label: "Present",
        };

      case "absent":
        return {
          icon: <XCircle size={18} />,
          className: "bg-red-50 text-red-600",
          label: "Absent",
        };

      case "late":
        return {
          icon: <Clock size={18} />,
          className: "bg-yellow-50 text-yellow-600",
          label: "Late",
        };

      case "leave":
        return {
          icon: <CalendarDays size={18} />,
          className: "bg-blue-50 text-blue-600",
          label: "Leave",
        };

      default:
        return {
          icon: null,
          className: "bg-gray-50 text-gray-600",
          label: status || "-",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Loading attendance details...
          </div>
        </main>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Attendance not found
          </div>
        </main>
      </div>
    );
  }

  const statusInfo = getStatusInfo(attendance.status);

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
                onClick={() => navigate("/admin/attendance")}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Attendance Details
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  View attendance information
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/admin/attendance/edit/${attendance._id}`)
              }
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Pencil size={18} />
              Edit Attendance
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <CalendarCheck
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {attendance.studentName ||
                    attendance.studentId?.name ||
                    "-"}
                </h2>

                <p className="text-sm text-gray-500">
                  Attendance for {formatDate(attendance.date)}
                </p>
              </div>

              <div className="ml-auto">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusInfo.className}`}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Information */}
            <div className="p-6">

              <h3 className="text-lg font-semibold text-gray-800 mb-5">
                Attendance Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Student Name
                  </p>

                  <p className="font-medium text-gray-800">
                    {attendance.studentName ||
                      attendance.studentId?.name ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Student Email
                  </p>

                  <p className="font-medium text-gray-800">
                    {attendance.studentId?.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Class
                  </p>

                  <p className="font-medium text-gray-800">
                    {attendance.className || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Section
                  </p>

                  <p className="font-medium text-gray-800">
                    {attendance.section || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Attendance Date
                  </p>

                  <p className="font-medium text-gray-800">
                    {formatDate(attendance.date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">
                    Status
                  </p>

                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-gray-400 mb-1">
                    Remarks
                  </p>

                  <p className="font-medium text-gray-800">
                    {attendance.remarks || "-"}
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

export default AttendanceDetails;