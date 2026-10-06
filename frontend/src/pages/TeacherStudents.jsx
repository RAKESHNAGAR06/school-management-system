import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";


function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  
  
  const classes = [...new Set(students.map((student) => student.className))];

	const sections = [
	  ...new Set(
		students
		  .filter(
			(student) =>
			  !selectedClass || student.className === selectedClass
		  )
		  .map((student) => student.section)
	  ),
	];
	
	const filteredStudents = students.filter((student) => {
	  const classMatch =
		!selectedClass || student.className === selectedClass;

	  const sectionMatch =
		!selectedSection || student.section === selectedSection;

	  return classMatch && sectionMatch;
	});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await apiRequest("/teachers/my-students");
        const data = await response.json();

        if (data.success) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error("Error fetching teacher students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Students
        </h1>

        <p className="mt-2 text-gray-500">
          Students from your assigned classes
        </p>
		
		<div className="flex flex-col md:flex-row gap-4 mt-6 mb-6">
		  <select
			value={selectedClass}
			onChange={(e) => {
			  setSelectedClass(e.target.value);
			  setSelectedSection("");
			}}
			className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
		  >
			<option value="">All Classes</option>

			{classes.map((className) => (
			  <option key={className} value={className}>
				{className}
			  </option>
			))}
		  </select>

		  <select
			value={selectedSection}
			onChange={(e) => setSelectedSection(e.target.value)}
			className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
		  >
			<option value="">All Sections</option>

			{sections.map((section) => (
			  <option key={section} value={section}>
				{section}
			  </option>
			))}
		  </select>
		</div>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="mt-6 text-gray-500">No students found.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mt-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Roll No.
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Class
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Section
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm text-gray-600">
                    Phone
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="border-t border-gray-100"
                  >
                    <td className="px-4 py-3 text-sm">
                      {student.rollNumber || "-"}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {student.name}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {student.className}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {student.section}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {student.email}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {student.phone || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherStudents;