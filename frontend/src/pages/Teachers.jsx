import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  Eye,
  Search,
  KeyRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { toast } from "react-toastify";
import CredentialModal from "../components/CredentialModal";

function Teachers() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const [
  resettingTeacherId,
  setResettingTeacherId,
] = useState(null);

	const [
	  credentialModal,
	  setCredentialModal,
	] = useState({
	  isOpen: false,
	  credential: null,
	});

  const teachersPerPage = 10;

  // Fetch Teachers
  const fetchTeachers = async () => {
    try {
      const response = await apiRequest("/teachers");
      const data = await response.json();

      if (data.success) {
        setTeachers(data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Delete Teacher
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) return;

    try {
     const response = await apiRequest(`/teachers/${id}`, {
  method: "DELETE",
});

      const data = await response.json();

      if (data.success) {
        alert("Teacher deleted successfully!");

        setTeachers(
          teachers.filter((teacher) => teacher._id !== id)
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };
  
  
  const handleResetPassword = async (
		  teacher
		) => {
		  const confirmed = window.confirm(
			`Generate a new temporary password for ${teacher.name}?`
		  );

		  if (!confirmed) {
			return;
		  }

		  try {
			setResettingTeacherId(
			  teacher._id
			);

			const response = await apiRequest(
			  "/auth/reset-password",
			  {
				method: "PATCH",
				body: JSON.stringify({
				  role: "teacher",
				  profileId: teacher._id,
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
				  teacher.name,

				email:
				  data.data?.email ||
				  teacher.email,

				role: "teacher",

				temporaryPassword:
				  data.temporaryPassword,

				credentialDelivery:
				  data.credentialDelivery,
			  },
			});
		  } catch (error) {
			console.error(
			  "Reset teacher password error:",
			  error
			);

			toast.error(
			  error.message ||
				"Unable to reset password"
			);
		  } finally {
			setResettingTeacherId(
			  null
			);
		  }
		};

  // Search + Filter
  const filteredTeachers = teachers.filter((teacher) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      teacher.name.toLowerCase().includes(searchText) ||
      teacher.email.toLowerCase().includes(searchText);

    const matchesSubject =
      subjectFilter === "" ||
      teacher.subject
        ?.toLowerCase()
        .includes(subjectFilter.toLowerCase());

    return matchesSearch && matchesSubject;
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredTeachers.length / teachersPerPage
  );

  const startIndex =
    (currentPage - 1) * teachersPerPage;

  const paginatedTeachers = filteredTeachers.slice(
    startIndex,
    startIndex + teachersPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Teachers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage all teachers in your school
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/teachers/add")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Teacher
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3">
                <Users className="text-blue-600" size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total Teachers
                </p>

                <h2 className="text-2xl font-bold text-gray-800">
                  {teachers.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Teachers
            </p>

            <h2 className="mt-1 text-2xl font-bold text-green-600">
              {teachers.filter((teacher) => teacher.isActive).length}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Inactive Teachers
            </p>

            <h2 className="mt-1 text-2xl font-bold text-red-600">
              {teachers.filter((teacher) => !teacher.isActive).length}
            </h2>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Social Science">
                Social Science
              </option>
              <option value="Computer">Computer</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Qualification
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedTeachers.length > 0 ? (
                  paginatedTeachers.map((teacher) => (
                    <tr
                      key={teacher._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {teacher.name}
                          </p>

                          <p className="text-sm text-gray-500">
                            {teacher.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.phone || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.subject || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {teacher.qualification || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            teacher.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {teacher.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            title="View"
                            onClick={() =>
                              navigate(
                                `/admin/teachers/${teacher._id}`
                              )
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() =>
                              navigate(
                                `/admin/teachers/edit/${teacher._id}`
                              )
                            }
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                          >
                            <Pencil size={17} />
                          </button>
						  
						  <button
							  type="button"
							  title="Reset Password"
							  onClick={() =>
								handleResetPassword(teacher)
							  }
							  disabled={
								resettingTeacherId ===
								teacher._id
							  }
							  className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
							  <KeyRound size={17} />
							</button>

                          <button
                            title="Delete"
                            onClick={() =>
                              handleDelete(teacher._id)
                            }
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1}-
                {Math.min(
                  startIndex + teachersPerPage,
                  filteredTeachers.length
                )}{" "}
                of {filteredTeachers.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(currentPage - 1)
                  }
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="px-3 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(currentPage + 1)
                  }
                  className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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

export default Teachers;