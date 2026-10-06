import { useEffect, useState } from "react";
import { Plus, Users, Pencil, Trash2, Eye, KeyRound } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import CredentialModal from "../components/CredentialModal";
import { toast } from "react-toastify";

function Students() {
  const [
	  resettingStudentId,
	  setResettingStudentId,
	] = useState(null);

	const [
	  credentialModal,
	  setCredentialModal,
	] = useState({
	  isOpen: false,
	  credential: null,
	});	
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const token = localStorage.getItem("token");

  const fetchStudents = async () => {
    try {
      const response = await apiRequest("/students");
      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this student?"
  );

  if (!confirmDelete) return;

  try {
   const response = await apiRequest(`/students/${id}`, {
  method: "DELETE",
});

    const data = await response.json();

    if (data.success) {
      alert("Student deleted successfully!");

      setStudents(
        students.filter((student) => student._id !== id)
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
  student
) => {
  const confirmed = window.confirm(
    `Generate a new temporary password for ${student.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setResettingStudentId(
      student._id
    );

    const response = await apiRequest(
      "/auth/reset-password",
      {
        method: "PATCH",
        body: JSON.stringify({
          role: "student",
          profileId: student._id,
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
          student.name,

        email:
          data.data?.email ||
          student.email,

        role: "student",

        temporaryPassword:
          data.temporaryPassword,

        credentialDelivery:
          data.credentialDelivery,
      },
    });
  } catch (error) {
    console.error(
      "Reset student password error:",
      error
    );

    toast.error(
      error.message ||
        "Unable to reset password"
    );
  } finally {
    setResettingStudentId(
      null
    );
  }
};

  useEffect(() => {
    fetchStudents();
  }, []);
  
  const filteredStudents = students.filter((student) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    student.name.toLowerCase().includes(searchText) ||
    student.email.toLowerCase().includes(searchText);

  const matchesClass =
    classFilter === "" ||
    student.className
      ?.toLowerCase()
      .includes(classFilter.toLowerCase());

  const matchesSection =
    sectionFilter === "" ||
    student.section
      ?.toLowerCase()
      .includes(sectionFilter.toLowerCase());

  return matchesSearch && matchesClass && matchesSection;
});


const totalPages = Math.ceil(
  filteredStudents.length / studentsPerPage
);

const startIndex = (currentPage - 1) * studentsPerPage;

const paginatedStudents = filteredStudents.slice(
  startIndex,
  startIndex + studentsPerPage
);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <Topbar />

      <main className="ml-64 pt-20">
        <div className="p-6">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Students
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage all students in your school
              </p>
            </div>

            <a
              href="/admin/students/add"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Student
            </a>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Users className="text-blue-600" size={24} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Students
                  </p>

                  <h2 className="text-2xl font-bold text-gray-800">
                    {students.length}
                  </h2>
                </div>
              </div>
            </div>

          </div>
		  
		  {/* Search & Filters */}
			<div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

			  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

				{/* Search */}
				<input
				  type="text"
				  placeholder="Search student..."
				  value={search}
				  onChange={(e) => {
					  setSearch(e.target.value);
					  setCurrentPage(1);
					}}
				  className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
				/>

				{/* Class */}
				<input
				  type="text"
				  placeholder="Filter by class"
				  value={classFilter}
				  onChange={(e) => {
					  setClassFilter(e.target.value);
					  setCurrentPage(1);
					}}
				  className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
				/>

				{/* Section */}
				<input
				  type="text"
				  placeholder="Filter by section"
				  value={sectionFilter}
				  onChange={(e) => {
					  setSectionFilter(e.target.value);
					  setCurrentPage(1);
					}}
				  className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
				/>

				{/* Clear */}
				<button
				  onClick={() => {
					setSearch("");
					setClassFilter("");
					setSectionFilter("");
					setCurrentPage(1);
				  }}
				  className="rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
				>
				  Clear Filters
				</button>

			  </div>

			</div>

          {/* Students Table */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-gray-800">
                Student List
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No students found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Student
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Email
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Class
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Section
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                        Roll No.
                      </th>
					  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
						  Status
						</th>
					  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
						  Actions
					  </th>
                    </tr>
                  </thead>

                  <tbody>
				  {paginatedStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="border-t transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">
                            {student.name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.email}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.phone || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.className || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.section || "-"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {student.rollNumber || "-"}
                        </td>
						<td className="px-6 py-4">
						  <span
							className={`rounded-full px-3 py-1 text-xs font-medium ${
							  student.isActive
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
							}`}
						  >
							{student.isActive ? "Active" : "Inactive"}
						  </span>
						</td>
						<td className="px-6 py-4">
						  <div className="flex items-center gap-2">

							<button
							  onClick={() =>
								window.location.href = `/admin/students/${student._id}`
							  }
							  className="rounded-lg p-2 text-green-600 hover:bg-green-50"
							  title="View Student"
							>
							  <Eye size={18} />
							</button>

							<button
							  onClick={() =>
								window.location.href = `/admin/students/edit/${student._id}`
							  }
							  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
							  title="Edit Student"
							>
							  <Pencil size={18} />
							</button>
							
							<button
							  type="button"
							  onClick={() =>
								handleResetPassword(student)
							  }
							  disabled={
								resettingStudentId ===
								student._id
							  }
							  title="Reset Password"
							  className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
							  <KeyRound size={18} />
							</button>

							<button
							  onClick={() => handleDelete(student._id)}
							  className="rounded-lg p-2 text-red-600 hover:bg-red-50"
							  title="Delete Student"
							>
							  <Trash2 size={18} />
							</button>

						  </div>
						</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
				
				<div className="flex items-center justify-between border-t px-6 py-4">

				  <p className="text-sm text-gray-500">
					Showing{" "}
					{filteredStudents.length === 0
					  ? 0
					  : startIndex + 1}{" "}
					to{" "}
					{Math.min(
					  startIndex + studentsPerPage,
					  filteredStudents.length
					)}{" "}
					of {filteredStudents.length} students
				  </p>

				  <div className="flex items-center gap-2">

					<button
					  onClick={() =>
						setCurrentPage((prev) => Math.max(prev - 1, 1))
					  }
					  disabled={currentPage === 1}
					  className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
					>
					  Previous
					</button>

					<span className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
					  {currentPage} / {totalPages || 1}
					</span>

					<button
					  onClick={() =>
						setCurrentPage((prev) =>
						  Math.min(prev + 1, totalPages)
						)
					  }
					  disabled={
						currentPage === totalPages || totalPages === 0
					  }
					  className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
					>
					  Next
					</button>

				  </div>
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

export default Students;