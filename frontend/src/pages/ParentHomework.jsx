import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentHomework() {
	const [homeworkList, setHomeworkList] = useState([]);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
	  const fetchHomework = async () => {
		try {
		  const response = await apiRequest("/homework/parent");
		  const data = await response.json();

		  if (data.success) {
			setHomeworkList(data.data);
		  }
		} catch (error) {
		  console.error("Parent homework error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchHomework();
	}, []);
	
	const getHomeworkStatus = (dueDate) => {
		  const today = new Date();
		  const due = new Date(dueDate);

		  today.setHours(0, 0, 0, 0);
		  due.setHours(0, 0, 0, 0);

		  if (due < today) return "Overdue";
		  if (due.getTime() === today.getTime()) return "Due Today";

		  return "Pending";
		};
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Homework
        </h1>

        <p className="text-gray-500 mt-1">
          View homework assigned to your child.
        </p>
		
		<p className="text-sm text-gray-500 mt-1">
		  Total Homework: {homeworkList.length}
		</p>
		
		<div className="mt-6">
		  {loading ? (
			<p className="text-gray-500">Loading homework...</p>
		  ) : homeworkList.length === 0 ? (
			<p className="text-gray-500">No homework assigned.</p>
		  ) : (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
			  {homeworkList.map((homework) => (
				<div
				  key={homework._id}
				  className="bg-white border rounded-xl shadow-sm p-5"
				>
				  <h2 className="text-lg font-semibold text-gray-800">
					{homework.title}
				  </h2>

				  <p className="text-sm text-gray-500 mt-1">
					{homework.subjectName} • Class {homework.className}
					{homework.section ? ` - ${homework.section}` : ""}
				  </p>

				  <p className="text-gray-700 mt-4">
					{homework.description || "No description"}
				  </p>

				  <div className="mt-4 text-sm text-gray-600">
					<p>
					  <span className="font-medium">Assigned:</span>{" "}
					  {homework.assignedDate
						? new Date(homework.assignedDate).toLocaleDateString()
						: "-"}
					</p>

					<p className="mt-1">
					  <span className="font-medium">Due Date:</span>{" "}
					  {homework.dueDate
						? new Date(homework.dueDate).toLocaleDateString()
						: "-"}
					</p>
				  </div>
				  
				  <p className="mt-2">
					  <span
						className={`px-3 py-1 rounded-full text-xs font-medium ${
						  getHomeworkStatus(homework.dueDate) === "Overdue"
							? "bg-red-100 text-red-700"
							: getHomeworkStatus(homework.dueDate) === "Due Today"
							? "bg-yellow-100 text-yellow-700"
							: "bg-green-100 text-green-700"
						}`}
					  >
						{getHomeworkStatus(homework.dueDate)}
					  </span>
					</p>
				</div>
			  ))}
			</div>
		  )}
		</div>
      </main>
    </div>
  );
}

export default ParentHomework;