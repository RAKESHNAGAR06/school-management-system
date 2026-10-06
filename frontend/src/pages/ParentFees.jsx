import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentFees() {
	const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
	  const fetchFees = async () => {
		try {
		  const response = await apiRequest("/parents/fees");
		  const data = await response.json();

		  if (data.success) {
			setFees(data.data);
		  }
		} catch (error) {
		  console.error("Parent fees error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchFees();
	}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Child Fees
        </h1>

        <p className="mt-2 text-gray-500">
          View your child&apos;s fee details and payment status here.
        </p>
		
		<div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
		  {loading ? (
			<p className="p-5 text-gray-500">Loading fees...</p>
		  ) : fees.length === 0 ? (
			<p className="p-5 text-gray-500">No fee records found.</p>
		  ) : (
			<div className="overflow-x-auto">
			  <table className="w-full text-sm">
				<thead className="bg-gray-50 border-b">
				  <tr>
					<th className="px-5 py-3 text-left text-gray-600">Fee Type</th>
					<th className="px-5 py-3 text-left text-gray-600">Amount</th>
					<th className="px-5 py-3 text-left text-gray-600">Paid</th>
					<th className="px-5 py-3 text-left text-gray-600">Due</th>
					<th className="px-5 py-3 text-left text-gray-600">Due Date</th>
					<th className="px-5 py-3 text-left text-gray-600">Status</th>
					<th className="px-5 py-3 text-left text-gray-600">Payment Method</th>
				  </tr>
				</thead>

				<tbody>
				  {fees.map((fee) => (
					<tr key={fee._id} className="border-b last:border-0">
					  <td className="px-5 py-4 font-medium text-gray-800 capitalize">
						{fee.feeType || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						₹{fee.amount ?? 0}
					  </td>

					  <td className="px-5 py-4 text-green-700">
						₹{fee.paidAmount ?? 0}
					  </td>

					  <td className="px-5 py-4 text-red-700">
						₹{fee.dueAmount ?? 0}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{fee.dueDate
						  ? new Date(fee.dueDate).toLocaleDateString()
						  : "-"}
					  </td>

					  <td className="px-5 py-4">
						<span
						  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
							fee.status === "paid"
							  ? "bg-green-100 text-green-700"
							  : fee.status === "partial"
							  ? "bg-yellow-100 text-yellow-700"
							  : "bg-red-100 text-red-700"
						  }`}
						>
						  {fee.status}
						</span>
					  </td>

					  <td className="px-5 py-4 text-gray-700 capitalize">
						{fee.paymentMethod || "-"}
					  </td>
					</tr>
				  ))}
				</tbody>
			  </table>
			</div>
		  )}
		</div>
      </main>
    </div>
  );
}

export default ParentFees;