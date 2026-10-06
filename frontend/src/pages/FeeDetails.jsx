import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  IndianRupee,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function FeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFee = async () => {
    try {
     const response = await apiRequest(`/fees/${id}`);

      const data = await response.json();

      if (data.success) {
        setFee(data.data);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching fee:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFee();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-64 pt-20 p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading fee details...</p>
        </div>
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="min-h-screen bg-gray-50 ml-64 pt-20 p-6">
        <div className="bg-white rounded-xl border p-8 text-center">
          <p className="text-gray-500">Fee record not found.</p>

          <button
            onClick={() => navigate("/admin/fees")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Fees
          </button>
        </div>
      </div>
    );
  }

  const statusClass =
    fee.status === "paid"
      ? "bg-green-100 text-green-700"
      : fee.status === "partial"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
  <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/fees")}
              className="p-2 rounded-lg bg-white border hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Fee Details
              </h1>

              <p className="text-gray-500 mt-1">
                View complete fee information
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/admin/fees/edit/${fee._id}`)}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium"
          >
            <Pencil size={18} />
            Edit Fee
          </button>
        </div>

        {/* Student Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <User size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Student Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <p className="text-sm text-gray-500">Student Name</p>
              <p className="font-semibold text-gray-800 mt-1">
                {fee.studentName || fee.studentId?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="font-semibold text-gray-800 mt-1">
                {fee.className || fee.studentId?.className || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Section</p>
              <p className="font-semibold text-gray-800 mt-1">
                {fee.section || fee.studentId?.section || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Total Amount</p>

            <p className="text-2xl font-bold text-gray-800 mt-2 flex items-center">
              <IndianRupee size={20} />
              {Number(fee.amount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Paid Amount</p>

            <p className="text-2xl font-bold text-green-600 mt-2 flex items-center">
              <IndianRupee size={20} />
              {Number(fee.paidAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <p className="text-sm text-gray-500">Due Amount</p>

            <p className="text-2xl font-bold text-red-600 mt-2 flex items-center">
              <IndianRupee size={20} />
              {Number(fee.dueAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <CreditCard size={20} />
            </div>

            <h2 className="text-lg font-semibold text-gray-800">
              Payment Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Fee Type</p>
              <p className="font-semibold text-gray-800 mt-1 capitalize">
                {fee.feeType || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-800 mt-1 capitalize">
                {fee.paymentMethod || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>

              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass}`}
              >
                {fee.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Due Date</p>

              <p className="font-semibold text-gray-800 mt-1 flex items-center gap-2">
                <Calendar size={16} />
                {fee.dueDate
                  ? new Date(fee.dueDate).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Date</p>

              <p className="font-semibold text-gray-800 mt-1 flex items-center gap-2">
                <Calendar size={16} />
                {fee.paymentDate
                  ? new Date(fee.paymentDate).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Remarks</p>

              <p className="font-semibold text-gray-800 mt-1">
                {fee.remarks || "-"}
              </p>
            </div>
          </div>
		  </div>
    
	</div>
      </main>
    </div>
  );
}

export default FeeDetails;