import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import {
  Pencil,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

function TeacherHomework() {
	const [homeworkList, setHomeworkList] = useState([]);
    const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [classes, setClasses] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [editingHomework, setEditingHomework] = useState(null);
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [showAI, setShowAI] = useState(false);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState("");

	const [aiForm, setAiForm] = useState({
	  topic: "",
	  difficulty: "medium",
	  questionCount: 5,
	  additionalInstructions: "",
	});

	const [formData, setFormData] = useState({
	  title: "",
	  description: "",
	  className: "",
	  section: "",
	  subjectName: "",
	  dueDate: "",
	});
	
	useEffect(() => {
	  const fetchHomework = async () => {
		try {
		  const response = await apiRequest("/homework/teacher");
		  const data = await response.json();

		  if (data.success) {
			setHomeworkList(data.data);
		  }
		} catch (error) {
		  console.error("Homework fetch error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchHomework();
	}, []);
	
	useEffect(() => {
	  const fetchClasses = async () => {
		try {
		  const response = await apiRequest("/classes");
		  const data = await response.json();

		  if (data.success) {
			setClasses(data.data);
		  }
		} catch (error) {
		  console.error("Classes fetch error:", error);
		}
	  };

	  fetchClasses();
	}, []);
	
	useEffect(() => {
	  const fetchSubjects = async () => {
		try {
		  const response = await apiRequest("/subjects");
		  const data = await response.json();

		  if (data.success) {
			setSubjects(data.data);
		  }
		} catch (error) {
		  console.error("Subjects fetch error:", error);
		}
	  };

	  fetchSubjects();
	}, []);
	
	
	const handleGenerateHomework = async () => {
	  if (
		!formData.className ||
		!formData.subjectName ||
		!aiForm.topic.trim()
	  ) {
		setAiError(
		  "Please select class, subject and enter a topic."
		);
		return;
	  }

	  try {
		setAiLoading(true);
		setAiError("");

		const response = await apiRequest(
		  "/ai/generate-homework",
		  {
			method: "POST",
			body: JSON.stringify({
			  className: formData.className,
			  section: formData.section,
			  subjectName: formData.subjectName,
			  topic: aiForm.topic,
			  difficulty: aiForm.difficulty,
			  questionCount: Number(
				aiForm.questionCount
			  ),
			  additionalInstructions:
				aiForm.additionalInstructions,
			}),
		  }
		);

		const data = await response.json();

		if (!data.success) {
		  setAiError(
			data.message ||
			  "Unable to generate homework"
		  );
		  return;
		}

		const generated =
		  data.data.generatedHomework;

		/*
		  Expected AI format:

		  Title: ...
		  Instructions: ...
		  Questions:
		  1. ...
		*/

		const titleMatch = generated.match(
		  /Title:\s*(.+)/i
		);

		const generatedTitle =
		  titleMatch?.[1]?.trim() ||
		  `${aiForm.topic} Homework`;

		const description = generated
		  .replace(/Title:\s*.+\n?/i, "")
		  .trim();

		setFormData((prev) => ({
		  ...prev,
		  title: generatedTitle,
		  description,
		}));

		setShowAI(false);
	  } catch (error) {
		console.error(
		  "AI homework generation error:",
		  error
		);

		setAiError(
		  "Something went wrong while generating homework."
		);
	  } finally {
		setAiLoading(false);
	  }
	};
	
	
	const handleSubmit = async (e) => {
		  e.preventDefault();

		  try {
			const endpoint = editingHomework
			  ? `/homework/${editingHomework._id}`
			  : "/homework";

			const method = editingHomework ? "PUT" : "POST";

			const response = await apiRequest(endpoint, {
			  method,
			  body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (data.success) {
			  if (editingHomework) {
				setHomeworkList((prev) =>
				  prev.map((item) =>
					item._id === editingHomework._id ? data.data : item
				  )
				);
			  } else {
				setHomeworkList((prev) => [data.data, ...prev]);
			  }

			  setFormData({
				title: "",
				description: "",
				className: "",
				section: "",
				subjectName: "",
				dueDate: "",
			  });

			  setEditingHomework(null);
			  setShowForm(false);
			} else {
			  alert(data.message);
			}
		  } catch (error) {
			console.error("Save homework error:", error);
			alert("Something went wrong");
		  }
		};
		
	const handleDelete = async (id) => {
		  const confirmDelete = window.confirm(
			"Are you sure you want to delete this homework?"
		  );

		  if (!confirmDelete) return;

		  try {
			const response = await apiRequest(`/homework/${id}`, {
			  method: "DELETE",
			});

			const data = await response.json();

			if (data.success) {
			  setHomeworkList((prev) =>
				prev.filter((homework) => homework._id !== id)
			  );
			} else {
			  alert(data.message);
			}
		  } catch (error) {
			console.error("Delete homework error:", error);
			alert("Something went wrong");
		  }
		};
		
	const handleEdit = (homework) => {
		  setEditingHomework(homework);

		  setFormData({
			title: homework.title || "",
			description: homework.description || "",
			className: homework.className || "",
			section: homework.section || "",
			subjectName: homework.subjectName || "",
			dueDate: homework.dueDate
			  ? homework.dueDate.split("T")[0]
			  : "",
		  });

		  setShowForm(true);
		};
		
	const getHomeworkStatus = (dueDate) => {
	  const today = new Date();
	  const due = new Date(dueDate);

	  today.setHours(0, 0, 0, 0);
	  due.setHours(0, 0, 0, 0);

	  if (due < today) return "Overdue";
	  if (due.getTime() === today.getTime()) return "Due Today";

	  return "Pending";
	};
	
	const filteredHomework = homeworkList.filter((homework) => {
	  if (statusFilter === "all") return true;

	  const status = getHomeworkStatus(homework.dueDate);

	  if (statusFilter === "pending") return status === "Pending";
	  if (statusFilter === "today") return status === "Due Today";
	  if (statusFilter === "overdue") return status === "Overdue";

	  return true;
	});
	
	const searchedHomework = filteredHomework.filter((homework) => {
	  const search = searchTerm.toLowerCase();

	  return (
		homework.title.toLowerCase().includes(search) ||
		homework.subjectName.toLowerCase().includes(search)
	  );
	});
	
  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
	   <div className="flex items-center justify-between">
	     <div>
			<h1 className="text-2xl font-semibold text-gray-800">
			  Homework
			</h1>

			<p className="text-gray-500 mt-1">
			  Create and manage homework for your students.
			</p>
			
			<p className="text-sm text-gray-500 mt-1">
			  Total Homework: {homeworkList.length}
			</p>
		 </div>
		<button
			onClick={() => setShowForm(!showForm)}
			className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
		  >
			Add Homework
		  </button>
	   </div>
	   <div className="mt-6 flex flex-wrap gap-4">
	        <select
			  value={statusFilter}
			  onChange={(e) => setStatusFilter(e.target.value)}
			  className="border rounded-lg px-3 py-2">
			  <option value="all">All Status</option>
			  <option value="pending">Pending</option>
			  <option value="today">Due Today</option>
			  <option value="overdue">Overdue</option>
			</select>
			
			<input
			  type="text"
			  placeholder="Search homework..."
			  value={searchTerm}
			  onChange={(e) => setSearchTerm(e.target.value)}
			  className="border rounded-lg px-3 py-2"
			/>
		</div>
		<div className="mt-6">
		  {showForm && (
			<form
			  onSubmit={handleSubmit}
			  className="mt-5 bg-white border rounded-xl shadow-sm p-6 space-y-4"
			>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

			  <h2 className="text-lg font-semibold text-gray-800">
				{editingHomework
				  ? "Edit Homework"
				  : "Add Homework"}
			  </h2>

			  {!editingHomework && (
				<button
				  type="button"
				  onClick={() => {
					setShowAI((prev) => !prev);
					setAiError("");
				  }}
				  className="flex items-center justify-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
				>
				  <Sparkles size={17} />
				  Generate with AI
				</button>
			  )}

			</div>
			
			{showAI && !editingHomework && (
			  <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5">

				<div className="mb-4">
				  <h3 className="flex items-center gap-2 font-semibold text-gray-800">
					<Sparkles
					  size={18}
					  className="text-purple-600"
					/>
					AI Homework Generator
				  </h3>

				  <p className="mt-1 text-sm text-gray-500">
					Select class and subject below, then enter a topic to generate a homework draft.
				  </p>
				</div>

				{!formData.className ||
				!formData.subjectName ? (
				  <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
					First select a class and subject from the homework form.
				  </div>
				) : (
				  <div className="mb-4 rounded-lg border bg-white p-3 text-sm text-gray-600">
					Generating for{" "}
					<strong>
					  {formData.className}
					  {formData.section
						? ` - ${formData.section}`
						: ""}
					</strong>
					{" • "}
					<strong>
					  {formData.subjectName}
					</strong>
				  </div>
				)}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">

				  <div className="md:col-span-2">
					<label className="mb-1 block text-sm font-medium text-gray-700">
					  Topic
					</label>

					<input
					  type="text"
					  placeholder="e.g. Indian National Movement"
					  value={aiForm.topic}
					  onChange={(e) =>
						setAiForm({
						  ...aiForm,
						  topic: e.target.value,
						})
					  }
					  className="w-full rounded-lg border bg-white px-3 py-2"
					/>
				  </div>

				  <div>
					<label className="mb-1 block text-sm font-medium text-gray-700">
					  Difficulty
					</label>

					<select
					  value={aiForm.difficulty}
					  onChange={(e) =>
						setAiForm({
						  ...aiForm,
						  difficulty: e.target.value,
						})
					  }
					  className="w-full rounded-lg border bg-white px-3 py-2"
					>
					  <option value="easy">
						Easy
					  </option>

					  <option value="medium">
						Medium
					  </option>

					  <option value="hard">
						Hard
					  </option>
					</select>
				  </div>

				  <div>
					<label className="mb-1 block text-sm font-medium text-gray-700">
					  Number of Questions
					</label>

					<input
					  type="number"
					  min="1"
					  max="20"
					  value={aiForm.questionCount}
					  onChange={(e) =>
						setAiForm({
						  ...aiForm,
						  questionCount: e.target.value,
						})
					  }
					  className="w-full rounded-lg border bg-white px-3 py-2"
					/>
				  </div>

				  <div className="md:col-span-2">
					<label className="mb-1 block text-sm font-medium text-gray-700">
					  Additional Instructions
					</label>

					<textarea
					  rows="3"
					  placeholder="Optional: Include 2 short-answer questions, avoid MCQs..."
					  value={
						aiForm.additionalInstructions
					  }
					  onChange={(e) =>
						setAiForm({
						  ...aiForm,
						  additionalInstructions:
							e.target.value,
						})
					  }
					  className="w-full rounded-lg border bg-white px-3 py-2"
					/>
				  </div>

				</div>

				{aiError && (
				  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{aiError}
				  </div>
				)}

				<div className="mt-4 flex gap-3">

				  <button
					type="button"
					onClick={handleGenerateHomework}
					disabled={
					  aiLoading ||
					  !formData.className ||
					  !formData.subjectName
					}
					className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
				  >
					{aiLoading ? (
					  <>
						<RefreshCw
						  size={17}
						  className="animate-spin"
						/>
						Generating...
					  </>
					) : (
					  <>
						<Sparkles size={17} />
						Generate Homework
					  </>
					)}
				  </button>

				  <button
					type="button"
					onClick={() => {
					  setShowAI(false);
					  setAiError("");
					}}
					className="rounded-lg border bg-white px-4 py-2 text-sm"
				  >
					Close
				  </button>

				</div>

			  </div>
			)}
			
			  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<input
				  type="text"
				  placeholder="Homework Title"
				  value={formData.title}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  title: e.target.value,
					})
				  }
				  className="border rounded-lg px-3 py-2"
				  required
				/>

				<select
				  value={
					formData.className
					  ? `${formData.className}|||${formData.section}`
					  : ""
				  }
				  onChange={(e) => {
					const [className, section] =
					  e.target.value.split("|||");

					setFormData({
					  ...formData,
					  className,
					  section: section || "",
					  subjectName: "",
					});
				  }}
				  className="border rounded-lg px-3 py-2"
				  required
				>
				  <option value="">
					Select Class
				  </option>

				  {classes.map((item) => (
					<option
					  key={item._id}
					  value={`${item.className}|||${item.section || ""}`}
					>
					  {item.className}
					  {item.section
						? ` - ${item.section}`
						: ""}
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
				  value={formData.subjectName}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  subjectName: e.target.value,
					})
				  }
				  className="border rounded-lg px-3 py-2"
				  required
				>
				  <option value="">Select Subject</option>

				 {subjects
				  .filter((subject) => {
					if (!formData.className) {
					  return true;
					}

					const sameClass =
					  subject.className ===
					  formData.className;

					const sameSection =
					  !subject.section ||
					  !formData.section ||
					  subject.section ===
						formData.section;

					return sameClass && sameSection;
				  })
				  .map((subject) => (
					<option
					  key={subject._id}
					  value={subject.subjectName}
					>
					  {subject.subjectName}
					</option>
				  ))}
				</select>

				<input
				  type="date"
				  value={formData.dueDate}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  dueDate: e.target.value,
					})
				  }
				  className="border rounded-lg px-3 py-2"
				  required
				/>
			  </div>

			  <textarea
				placeholder="Homework Description"
				value={formData.description}
				onChange={(e) =>
				  setFormData({
					...formData,
					description: e.target.value,
				  })
				}
				className="w-full border rounded-lg px-3 py-2"
				rows="4"
			  />

			  <div className="flex gap-3">
				<button
				  type="submit"
				  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
				>
				  {editingHomework ? "Update Homework" : "Save Homework"}
				</button>

				<button
				  type="button"
				  onClick={() => {
					  setShowForm(false);
					  setEditingHomework(null);

					  setFormData({
						title: "",
						description: "",
						className: "",
						section: "",
						subjectName: "",
						dueDate: "",
					  });
					}}
				  className="border px-4 py-2 rounded-lg">
				  Cancel
				</button>
			  </div>
			</form>
		  )}
		</div>
		
		<div className="mt-6 bg-white rounded-xl border shadow-sm overflow-hidden">
		  {loading ? (
			<p className="p-5 text-gray-500">Loading homework...</p>
		  ) : homeworkList.length === 0 ? (
			<p className="p-5 text-gray-500">No homework found.</p>
		  ) : (
			<div className="overflow-x-auto">
			  <table className="w-full text-sm">
				<thead className="bg-gray-50 border-b">
				  <tr>
					<th className="px-5 py-3 text-left text-gray-600">Title</th>
					<th className="px-5 py-3 text-left text-gray-600">Class</th>
					<th className="px-5 py-3 text-left text-gray-600">Section</th>
					<th className="px-5 py-3 text-left text-gray-600">Subject</th>
					<th className="px-5 py-3 text-left text-gray-600">Assigned Date</th>
					<th className="px-5 py-3 text-left text-gray-600">Due Date</th>
					<th className="px-5 py-3 text-left text-gray-600">Status</th>
					<th className="px-5 py-3 text-left text-gray-600">Action</th>
				  </tr>
				</thead>

				<tbody>
				{searchedHomework.length === 0 && (
				  <tr>
					<td
					  colSpan="8"
					  className="px-5 py-8 text-center text-gray-500"
					>
					  No homework found
					</td>
				  </tr>
				)}
				  {searchedHomework.map((homework) => (
					<tr key={homework._id} className="border-b last:border-0">
					  <td className="px-5 py-4 font-medium text-gray-800">
						{homework.title}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{homework.className || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{homework.section || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{homework.subjectName || "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{homework.assignedDate
						  ? new Date(homework.assignedDate).toLocaleDateString()
						  : "-"}
					  </td>

					  <td className="px-5 py-4 text-gray-700">
						{homework.dueDate
						  ? new Date(homework.dueDate).toLocaleDateString()
						  : "-"}
					  </td>
					  
					  <td className="px-5 py-4">
						  <span
							className={`px-3 py-1 rounded-full text-xs font-medium ${
							  getHomeworkStatus(homework.dueDate) === "Overdue"
								? "bg-red-100 text-red-700"
								: getHomeworkStatus(homework.dueDate) === "Due Today"
								? "bg-yellow-100 text-yellow-700"
								: "bg-green-100 text-green-700"}`}>
							{getHomeworkStatus(homework.dueDate)}
						  </span>
					  </td>
					  
					  <td className="px-5 py-4">
					    <div className="flex gap-3">
						  <button
						    title="Edit"
							onClick={() => handleDelete(homework._id)}
							className="text-red-600 hover:text-red-800 font-medium">
							<Trash2 size={17} />
						  </button>
						  
						  <button
						      title="Delete"
							  onClick={() => handleEdit(homework)}
							  className="text-green-600 hover:bg-green-100 font-medium">
							  <Pencil size={17} />
							</button>
						</div>
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

export default TeacherHomework;