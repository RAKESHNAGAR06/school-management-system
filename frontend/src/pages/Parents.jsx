import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  KeyRound,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { toast } from "react-toastify";
import CredentialModal from "../components/CredentialModal";

function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [relationFilter, setRelationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [
  resettingParentId,
  setResettingParentId,
] = useState(null);

const [
  credentialModal,
  setCredentialModal,
] = useState({
  isOpen: false,
  credential: null,
});


  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchParents();
  }, []);

  // Reset to first page when search or relation filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, relationFilter]);

  const fetchParents = async () => {
    try {
      const response = await apiRequest("/parents");
      const data = await response.json();

      if (data.success) {
        setParents(data.data);
      }
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this parent?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiRequest(`/parents/${id}`, {
  method: "DELETE",
});

      const data = await response.json();

      if (data.success) {
        setParents((prev) => prev.filter((parent) => parent._id !== id));
        alert("Parent deleted successfully!");
      } else {
        alert(data.message || "Failed to delete parent");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };
  
  
  const handleResetPassword = async (
		  parent
		) => {
		  const confirmed = window.confirm(
			`Generate a new temporary password for ${parent.name}?`
		  );

		  if (!confirmed) {
			return;
		  }

		  try {
			setResettingParentId(
			  parent._id
			);

			const response = await apiRequest(
			  "/auth/reset-password",
			  {
				method: "PATCH",
				body: JSON.stringify({
				  role: "parent",
				  profileId: parent._id,
				}),
			  }
			);

			const data =
			  await response.json();

			if (!response.ok) {
			  throw new Error(
				data.message ||
				  "Unable to reset password"
			  );
			}

			toast.success(
			  "Temporary password generated successfully"
			);

			setCredentialModal({
			  isOpen: true,

			  credential: {
				name:
				  data.data?.name ||
				  parent.name,

				email:
				  data.data?.email ||
				  parent.email,

				role: "parent",

				temporaryPassword:
				  data.temporaryPassword,

				credentialDelivery:
				  data.credentialDelivery,
			  },
			});
		  } catch (error) {
			console.error(
			  "Reset parent password error:",
			  error
			);

			toast.error(
			  error.message ||
				"Unable to reset password"
			);
		  } finally {
			setResettingParentId(
			  null
			);
		  }
		};

  const filteredParents = parents.filter((parent) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      parent.name?.toLowerCase().includes(searchText) ||
      parent.email?.toLowerCase().includes(searchText) ||
      parent.phone?.includes(searchText);

    const matchesRelation =
      relationFilter === "all" || parent.relation === relationFilter;

    return matchesSearch && matchesRelation;
  });

  const totalParents = parents.length;
  const activeParents = parents.filter((parent) => parent.isActive).length;
  const inactiveParents = parents.filter((parent) => !parent.isActive).length;

  // Pagination Logic
  const totalItems = filteredParents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParents = filteredParents.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Parents</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all school parents
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/parents/add")}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              Add Parent
            </button>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total */}
            <div className="rounded-xl bg-white p-5 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Parents</p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-800">
                    {totalParents}
                  </h2>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                  <Users size={24} />
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="rounded-xl bg-white p-5 shadow-sm border">
              <p className="text-sm text-gray-500">Active Parents</p>
              <h2 className="mt-1 text-2xl font-bold text-green-600">
                {activeParents}
              </h2>
            </div>

            {/* Inactive */}
            <div className="rounded-xl bg-white p-5 shadow-sm border">
              <p className="text-sm text-gray-500">Inactive Parents</p>
              <h2 className="mt-1 text-2xl font-bold text-red-600">
                {inactiveParents}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Search */}
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or phone..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Relation Filter */}
              <select
                value={relationFilter}
                onChange={(e) => setRelationFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Relations</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">
                      Parent
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600">
                      Phone
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600">
                      Relation
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600">
                      Occupation
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading parents...
                      </td>
                    </tr>
                  ) : currentParents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No parents found
                      </td>
                    </tr>
                  ) : (
                    currentParents.map((parent) => (
                      <tr
                        key={parent._id}
                        className="hover:bg-gray-50 transition"
                      >
                        {/* Parent */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {parent.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {parent.email}
                            </p>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-6 py-4 text-gray-600">
                          {parent.phone || "-"}
                        </td>

                        {/* Relation */}
                        <td className="px-6 py-4">
                          <span className="capitalize text-gray-700">
                            {parent.relation}
                          </span>
                        </td>

                        {/* Occupation */}
                        <td className="px-6 py-4 text-gray-600">
                          {parent.occupation || "-"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              parent.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {parent.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              title="View"
                              onClick={() =>
                                navigate(`/admin/parents/${parent._id}`)
                              }
                              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              onClick={() =>
                                navigate(`/admin/parents/edit/${parent._id}`)
                              }
                              title="Edit"
                              className="rounded-lg p-2 text-green-600 hover:bg-green-50 transition"
                            >
                              <Pencil size={17} />
                            </button>
							
							<button
							  type="button"
							  onClick={() =>
								handleResetPassword(parent)
							  }
							  disabled={
								resettingParentId ===
								parent._id
							  }
							  title="Reset Password"
							  className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 transition disabled:cursor-not-allowed disabled:opacity-50"
							>
							  <KeyRound size={17} />
							</button>

                            <button
                              onClick={() => handleDelete(parent._id)}
                              title="Delete"
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-gray-800">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-gray-800">
                      {Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-800">
                      {totalItems}
                    </span>{" "}
                    entries
                  </span>

                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-xs text-gray-500">
                      Show:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs bg-white outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "hover:bg-white text-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-lg hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
		  
		  <CredentialModal
			  isOpen={
				credentialModal.isOpen
			  }
			  credential={
				credentialModal.credential
			  }
			  onClose={() =>
				setCredentialModal({
				  isOpen: false,
				  credential: null,
				})
			  }
			/>
        </div>
      </main>
    </div>
  );
}

export default Parents;