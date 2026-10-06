import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function Fees() {
  const [fees, setFees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchFees = async () => {
    try {
      const response = await apiRequest("/fees");
      const data = await response.json();

      if (data.success) {
        setFees(data.data);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Search/Filter logic jab change ho to Page 1 par reset kar dein
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredFees = fees.filter((fee) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      fee.studentName?.toLowerCase().includes(searchText) ||
      fee.className?.toLowerCase().includes(searchText) ||
      fee.section?.toLowerCase().includes(searchText) ||
      fee.feeType?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "" || fee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination Calculation
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFees = filteredFees.slice(indexOfFirstItem, indexOfLastItem);

  const totalAmount = fees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0
  );

  const totalPaid = fees.reduce(
    (sum, fee) => sum + Number(fee.paidAmount || 0),
    0
  );

  const totalDue = fees.reduce(
    (sum, fee) => sum + Number(fee.dueAmount || 0),
    0
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this fee?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiRequest(`/fees/${id}`, {
  method: "DELETE",
});

      const data = await response.json();

      if (data.success) {
        fetchFees();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error deleting fee:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Fees Management
              </h1>
              <p className="text-gray-500 mt-1">
                Manage student fees and payment records
              </p>
            </div>

            <Link
              to="/admin/fees/add"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
            >
              <Plus size={18} />
              Add Fee
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Records</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {fees.length}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Amount</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1 flex items-center">
                <IndianRupee size={20} />
                {totalAmount.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Paid</p>
              <h2 className="text-2xl font-bold text-green-600 mt-1 flex items-center">
                <IndianRupee size={20} />
                {totalPaid.toLocaleString("en-IN")}
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Due</p>
              <h2 className="text-2xl font-bold text-red-600 mt-1 flex items-center">
                <IndianRupee size={20} />
                {totalDue.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search student, class, section..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full border rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Student
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Class
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Fee Type
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Amount
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Paid
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Due
                    </th>
                    <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-center px-5 py-4 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {currentFees.length > 0 ? (
                    currentFees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-800">
                            {fee.studentName}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {fee.className || "-"}{" "}
                          {fee.section ? `- ${fee.section}` : ""}
                        </td>

                        <td className="px-5 py-4 capitalize text-gray-600">
                          {fee.feeType}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          ₹{Number(fee.amount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-green-600 font-medium">
                          ₹
                          {Number(fee.paidAmount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4 text-red-600 font-medium">
                          ₹
                          {Number(fee.dueAmount || 0).toLocaleString("en-IN")}
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

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admin/fees/${fee._id}`}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="View"
                            >
                              <Eye size={17} />
                            </Link>

                            <Link
                              to={`/admin/fees/edit/${fee._id}`}
                              className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </Link>

                            <button
                              onClick={() => handleDelete(fee._id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-12 text-gray-500"
                      >
                        No fee records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredFees.length > 0 && (
              <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                {/* Showing info & rows per page */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredFees.length)} of{" "}
                    {filteredFees.length} entries
                  </span>

                  <div className="flex items-center gap-2">
                    <label htmlFor="rowsPerPage" className="text-xs font-medium text-gray-500">Rows:</label>
                    <select
                      id="rowsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border rounded px-2 py-1 bg-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page navigation buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white border text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Fees;