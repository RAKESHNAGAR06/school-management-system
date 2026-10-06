import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, IndianRupee } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function EditFee() {
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
    feeType: "tuition",
    amount: "",
    paidAmount: "",
    dueDate: "",
    paymentDate: "",
    paymentMethod: "cash",
    remarks: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feeResponse, studentsResponse] = await Promise.all([
  apiRequest(`/fees/${id}`),
  apiRequest("/students"),
]);

        const feeData = await feeResponse.json();
        const studentsData = await studentsResponse.json();

        if (feeData.success) {
          const fee = feeData.data;

          setFormData({
            studentId: fee.studentId?._id || fee.studentId || "",
            studentName: fee.studentName || "",
            className: fee.className || "",
            section: fee.section || "",
            feeType: fee.feeType || "tuition",
            amount: fee.amount || "",
            paidAmount: fee.paidAmount || "",
            dueDate: fee.dueDate
              ? new Date(fee.dueDate).toISOString().split("T")[0]
              : "",
            paymentDate: fee.paymentDate
              ? new Date(fee.paymentDate).toISOString().split("T")[0]
              : "",
            paymentMethod: fee.paymentMethod || "cash",
            remarks: fee.remarks || "",
          });
        } else {
          alert(feeData.message);
        }

        if (studentsData.success) {
          setStudents(studentsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;

    const selectedStudent = students.find(
      (student) => student._id === studentId
    );

    setFormData((prev) => ({
      ...prev,
      studentId,
      studentName: selectedStudent?.name || "",
      className: selectedStudent?.className || "",
      section: selectedStudent?.section || "",
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId) {
      alert("Please select a student");
      return;
    }

    if (!formData.amount) {
      alert("Please enter fee amount");
      return;
    }

    if (Number(formData.paidAmount || 0) > Number(formData.amount)) {
      alert("Paid amount cannot be greater than total amount");
      return;
    }

    try {
      setSaving(true);

     const response = await apiRequest(`/fees/${id}`, {
  method: "PUT",
          body: JSON.stringify({
            ...formData,
            amount: Number(formData.amount),
            paidAmount: Number(formData.paidAmount || 0),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Fee updated successfully");
        navigate(`/admin/fees/${id}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-64 pt-20 p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading fee...</p>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/admin/fees/${id}`)}
            className="p-2 rounded-lg bg-white border hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit Fee
            </h1>

            <p className="text-gray-500 mt-1">
              Update student fee information
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          {/* Student Information */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Student Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student *
              </label>

              <select
                value={formData.studentId}
                onChange={handleStudentChange}
                required
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                    {student.className
                      ? ` - ${student.className}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>

              <input
                type="text"
                value={formData.studentName}
                readOnly
                className="w-full border rounded-lg px-4 py-2.5 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>

              <input
                type="text"
                value={formData.className}
                readOnly
                className="w-full border rounded-lg px-4 py-2.5 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>

              <input
                type="text"
                value={formData.section}
                readOnly
                className="w-full border rounded-lg px-4 py-2.5 bg-gray-100"
              />
            </div>
          </div>

          {/* Fee Details */}
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Fee Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Type *
              </label>

              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tuition">Tuition Fee</option>
                <option value="admission">Admission Fee</option>
                <option value="exam">Exam Fee</option>
                <option value="transport">Transport Fee</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount *
              </label>

              <div className="relative">
                <IndianRupee
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full border rounded-lg pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid Amount
              </label>

              <div className="relative">
                <IndianRupee
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded-lg pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>

              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>

              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="3"
                className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t">
            <button
              type="button"
              onClick={() => navigate(`/admin/fees/${id}`)}
              className="px-5 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Fee"}
            </button>
          </div>
        </form>
      </div>
	  </main>
    </div>
  );
}

export default EditFee;