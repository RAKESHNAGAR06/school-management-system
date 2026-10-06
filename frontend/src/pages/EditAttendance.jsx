import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function EditAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    className: "",
    section: "",
    date: "",
    status: "present",
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
     const [attendanceResponse, studentsResponse] =
  await Promise.all([
    apiRequest(`/attendance/${id}`),
    apiRequest("/students"),
  ]);

      const attendanceData = await attendanceResponse.json();
      const studentsData = await studentsResponse.json();

      if (!attendanceData.success) {
        alert(
          attendanceData.message || "Attendance not found"
        );
        return;
      }

      setStudents(studentsData.data || []);

      const attendance = attendanceData.data;

      setFormData({
        studentId:
          attendance.studentId?._id ||
          attendance.studentId ||
          "",
        studentName: attendance.studentName || "",
        className: attendance.className || "",
        section: attendance.section || "",
        date: attendance.date
          ? new Date(attendance.date)
              .toISOString()
              .split("T")[0]
          : "",
        status: attendance.status || "present",
        remarks: attendance.remarks || "",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;

    const selectedStudent = students.find(
      (student) => student._id === studentId
    );

    if (selectedStudent) {
      setFormData({
        ...formData,
        studentId: selectedStudent._id,
        studentName: selectedStudent.name,
        className: selectedStudent.className || "",
        section: selectedStudent.section || "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId) {
      alert("Please select a student");
      return;
    }

    setSaving(true);

    try {
      // 4. PUT - Update Attendance
const response = await apiRequest(`/attendance/${id}`, {
  method: "PUT",
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (data.success) {
        alert("Attendance updated successfully!");
        navigate(`/admin/attendance/${id}`);
      } else {
        alert(
          data.message || "Failed to update attendance"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Loading attendance...
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
                navigate(`/admin/attendance/${id}`)
              }
              className="p-2 rounded-lg hover:bg-gray-200 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Attendance
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Update attendance information
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <CalendarCheck
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Attendance Information
                </h2>

                <p className="text-xs text-gray-400">
                  Update the details below
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Student */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student
                  </label>

                  <select
                    value={formData.studentId}
                    onChange={handleStudentChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      Select Student
                    </option>

                    {students.map((student) => (
                      <option
                        key={student._id}
                        value={student._id}
                      >
                        {student.name}
                        {student.rollNumber
                          ? ` - Roll No. ${student.rollNumber}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>

                  <input
                    type="text"
                    value={formData.className}
                    readOnly
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section
                  </label>

                  <input
                    type="text"
                    value={formData.section}
                    readOnly
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 outline-none"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">
                      Present
                    </option>
                    <option value="absent">
                      Absent
                    </option>
                    <option value="late">
                      Late
                    </option>
                    <option value="leave">
                      Leave
                    </option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Optional remarks..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-200">

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/admin/attendance/${id}`)
                  }
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving
                    ? "Updating..."
                    : "Update Attendance"}
                </button>

              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditAttendance;