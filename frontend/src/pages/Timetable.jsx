import { useEffect, useState } from "react";
import apiRequest from "../utils/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Timetable() {
  const [timetableList, setTimetableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [formData, setFormData] = useState({
		  className: "",
		  section: "",
		  day: "",
		  subjectName: "",
		  teacherName: "",
		  startTime: "",
		  endTime: "",
		  roomNumber: "",
		});

		  const fetchTimetable = async () => {
			try {
			  const response = await apiRequest("/timetable");
			  const data = await response.json();

			  if (data.success) {
				setTimetableList(data.data);
			  }
			} catch (error) {
			  console.error("Fetch timetable error:", error);
			} finally {
			  setLoading(false);
			}
		  };
		  
		  const fetchClasses = async () => {
			  try {
				const response = await apiRequest("/classes");
				const data = await response.json();

				if (data.success) {
				  setClasses(data.data);
				}
			  } catch (error) {
				console.error("Fetch classes error:", error);
			  }
			};
			
			const fetchSubjects = async () => {
			  try {
				const response = await apiRequest("/subjects");
				const data = await response.json();

				if (data.success) {
				  setSubjects(data.data);
				}
			  } catch (error) {
				console.error("Fetch subjects error:", error);
			  }
			};
					  
		  
		  const handleSubmit = async (e) => {
			  e.preventDefault();
			  
			    if (formData.startTime >= formData.endTime) {
					alert("End time must be greater than start time");
					return;
				  }


			  try {
				const endpoint = editingTimetable
				  ? `/timetable/${editingTimetable._id}`
				  : "/timetable";

				const method = editingTimetable ? "PUT" : "POST";

				const response = await apiRequest(endpoint, {
				  method,
				  body: JSON.stringify(formData),
				});

				const data = await response.json();

				if (data.success) {
				  if (editingTimetable) {
					setTimetableList((prev) =>
					  prev.map((item) =>
						item._id === editingTimetable._id ? data.data : item
					  )
					);
				  } else {
					setTimetableList((prev) => [data.data, ...prev]);
				  }

				  setFormData({
					className: "",
					section: "",
					day: "",
					subjectName: "",
					teacherName: "",
					startTime: "",
					endTime: "",
					roomNumber: "",
				  });

				  setEditingTimetable(null);
				  setShowForm(false);
				} else {
				  alert(data.message);
				}
			  } catch (error) {
				console.error("Save timetable error:", error);
				alert("Something went wrong");
			  }
			};
			
			
			const handleDelete = async (id) => {
			  const confirmDelete = window.confirm(
				"Are you sure you want to delete this timetable?"
			  );

			  if (!confirmDelete) return;

			  try {
				const response = await apiRequest(`/timetable/${id}`, {
				  method: "DELETE",
				});

				const data = await response.json();

				if (data.success) {
				  setTimetableList((prev) =>
					prev.filter((item) => item._id !== id)
				  );
				} else {
				  alert(data.message);
				}
			  } catch (error) {
				console.error("Delete timetable error:", error);
				alert("Something went wrong");
			  }
			};
			
			const handleEdit = (item) => {
			  setEditingTimetable(item);

			  setFormData({
				className: item.className || "",
				section: item.section || "",
				day: item.day || "",
				subjectName: item.subjectName || "",
				teacherName: item.teacherName || "",
				startTime: item.startTime || "",
				endTime: item.endTime || "",
				roomNumber: item.roomNumber || "",
			  });

			  setShowForm(true);
			};

  useEffect(() => {
  fetchTimetable();
  fetchClasses();
  fetchSubjects();
}, []);

const filteredTimetable = timetableList.filter((item) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    item.className?.toLowerCase().includes(search) ||
    item.section?.toLowerCase().includes(search) ||
    item.day?.toLowerCase().includes(search) ||
    item.subjectName?.toLowerCase().includes(search) ||
    item.teacherName?.toLowerCase().includes(search) ||
    item.roomNumber?.toLowerCase().includes(search);

  const matchesDay =
    dayFilter === "all" || item.day === dayFilter;
	
	const matchesClass =
  classFilter === "all" || item.className === classFilter;

  return matchesSearch && matchesDay && matchesClass;
});
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Timetable Management
            </h1>

            <p className="text-gray-500 mt-1">
              Total Timetable Entries: {timetableList.length}
            </p>
          </div>

          <button
			  onClick={() => {
				  if (showForm) {
					setShowForm(false);
					setEditingTimetable(null);

					setFormData({
					  className: "",
					  section: "",
					  day: "",
					  subjectName: "",
					  teacherName: "",
					  startTime: "",
					  endTime: "",
					  roomNumber: "",
					});
				  } else {
					setShowForm(true);
				  }
				}}
			  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
			  {showForm ? "Close Form" : "+ Add Timetable"}
			</button>
        </div>
		
		<input
		  type="text"
		  placeholder="Search timetable..."
		  value={searchTerm}
		  onChange={(e) => setSearchTerm(e.target.value)}
		  className="w-full md:w-80 border rounded-lg px-3 py-2 mb-4"
		/>
		
		<select
		  value={dayFilter}
		  onChange={(e) => setDayFilter(e.target.value)}
		  className="border rounded-lg px-3 py-2 mb-4 md:ml-3">
		  <option value="all">All Days</option>
		  <option value="Monday">Monday</option>
		  <option value="Tuesday">Tuesday</option>
		  <option value="Wednesday">Wednesday</option>
		  <option value="Thursday">Thursday</option>
		  <option value="Friday">Friday</option>
		  <option value="Saturday">Saturday</option>
		</select>
		
		
		<select
		  value={classFilter}
		  onChange={(e) => setClassFilter(e.target.value)}
		  className="border rounded-lg px-3 py-2 mb-4 md:ml-3">
		  <option value="all">All Classes</option>

		  {classes.map((item) => (
			<option key={item._id} value={item.className}>
			  {item.className} - {item.section}
			</option>
		  ))}
		</select>
		
		
		<button
		  onClick={() => {
			setSearchTerm("");
			setDayFilter("all");
			setClassFilter("all");
		  }}
		  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 md:ml-3">
		  Clear Filters
		</button>
	
		{showForm && (
		  <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
			  {editingTimetable ? "Edit Timetable" : "Add Timetable"}
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			  <select
				  value={formData.className}
				  onChange={(e) => {
					  const selectedClass = classes.find(
						(item) => item.className === e.target.value
					  );

					  setFormData({
						...formData,
						className: e.target.value,
						section: selectedClass?.section || "",
					  });
					}}
				  className="border rounded-lg px-3 py-2">
				  <option value="">Select Class</option>

				  {classes.map((item) => (
					<option key={item._id} value={item.className}>
					  {item.className} - {item.section}
					</option>
				  ))}
			  </select>

			  <input
				  type="text"
				  placeholder="Section"
				  value={formData.section}
				  readOnly
				  className="border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
				/>

			  <select
				value={formData.day}
				onChange={(e) =>
				  setFormData({ ...formData, day: e.target.value })
				}
				className="border rounded-lg px-3 py-2"
			  >
				<option value="">Select Day</option>
				<option value="Monday">Monday</option>
				<option value="Tuesday">Tuesday</option>
				<option value="Wednesday">Wednesday</option>
				<option value="Thursday">Thursday</option>
				<option value="Friday">Friday</option>
				<option value="Saturday">Saturday</option>
			  </select>

			  <select
				  value={formData.subjectName}
				  onChange={(e) => {
					  const selectedSubject = subjects.find(
						(subject) => subject.subjectName === e.target.value
					  );

					  setFormData({
						...formData,
						subjectName: e.target.value,
						teacherName: selectedSubject?.teacherName || "",
					  });
					}}
				  className="border rounded-lg px-3 py-2">
				  <option value="">Select Subject</option>

				  {subjects
					.filter(
					  (subject) =>
						!formData.className ||
						subject.className === formData.className
					)
					.map((subject) => (
					  <option
						key={subject._id}
						value={subject.subjectName}>
						{subject.subjectName}
					  </option>
					))}
			  </select>

			  <input
				  type="text"
				  placeholder="Teacher Name"
				  value={formData.teacherName}
				  readOnly
				  className="border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
				/>

			  <input
				type="time"
				value={formData.startTime}
				onChange={(e) =>
				  setFormData({ ...formData, startTime: e.target.value })
				}
				className="border rounded-lg px-3 py-2"
			  />

			  <input
				type="time"
				value={formData.endTime}
				onChange={(e) =>
				  setFormData({ ...formData, endTime: e.target.value })
				}
				className="border rounded-lg px-3 py-2"
			  />

			  <input
				type="text"
				placeholder="Room Number"
				value={formData.roomNumber}
				onChange={(e) =>
				  setFormData({ ...formData, roomNumber: e.target.value })
				}
				className="border rounded-lg px-3 py-2"
			  />
			</div>
			<button
			  type="button"
			  onClick={handleSubmit}
			  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
			  {editingTimetable ? "Update Timetable" : "Save Timetable"}
			</button>
		  </div>
		)}

        {loading ? (
          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-500">Loading timetable...</p>
          </div>
        ) : (
         <div className="bg-white rounded-xl shadow-sm p-6">
			  {timetableList.length === 0 ? (
				<p className="text-center text-gray-500">
				  No timetable entries found
				</p>
			  ) : filteredTimetable.length === 0 ? (
				<p className="text-center text-gray-500 py-6">
				  No matching timetable found
				</p>
			  ) : (
				<div className="overflow-x-auto">
				  <table className="w-full border-collapse">
					<thead>
					  <tr className="bg-gray-50 text-left">
						<th className="px-4 py-3">Class</th>
						<th className="px-4 py-3">Section</th>
						<th className="px-4 py-3">Day</th>
						<th className="px-4 py-3">Subject</th>
						<th className="px-4 py-3">Teacher</th>
						<th className="px-4 py-3">Time</th>
						<th className="px-4 py-3">Room</th>
						<th className="px-4 py-3">Action</th>
					  </tr>
					</thead>
					

					<tbody>
					  {filteredTimetable.map((item) => (
						<tr key={item._id} className="border-t">
						  <td className="px-4 py-3">{item.className}</td>
						  <td className="px-4 py-3">{item.section || "-"}</td>
						  <td className="px-4 py-3">{item.day}</td>
						  <td className="px-4 py-3">{item.subjectName}</td>
						  <td className="px-4 py-3">{item.teacherName || "-"}</td>
						  <td className="px-4 py-3">
							{item.startTime} - {item.endTime}
						  </td>
						  <td className="px-4 py-3">{item.roomNumber || "-"}</td>
						  <td className="px-4 py-3">
							  <button
								  onClick={() => handleEdit(item)}
								  className="text-blue-600 hover:underline mr-3">
								  Edit
							  </button>

							  <button
								  onClick={() => handleDelete(item._id)}
								  className="text-red-600 hover:underline">
								  Delete
							  </button>
						  </td>
						</tr>
					  ))}
					</tbody>
				  </table>
				</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Timetable;