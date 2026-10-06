import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function TeacherTimetable() {
  const [timetableList, setTimetableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState("all");
  
  const fetchTimetable = async () => {
	  try {
		const response = await apiRequest("/timetable/teacher");
		const data = await response.json();

		if (data.success) {
		  setTimetableList(data.data);
		} else {
		  console.error(data.message);
		}
	  } catch (error) {
		console.error("Fetch teacher timetable error:", error);
	  } finally {
		setLoading(false);
	  }
	};
	
	useEffect(() => {
	  fetchTimetable();
	}, []);
	
	
	const dayOrder = {
	  Monday: 1,
	  Tuesday: 2,
	  Wednesday: 3,
	  Thursday: 4,
	  Friday: 5,
	  Saturday: 6,
	};

	const sortedTimetable = [...timetableList].sort((a, b) => {
	  if (dayOrder[a.day] !== dayOrder[b.day]) {
		return dayOrder[a.day] - dayOrder[b.day];
	  }
	  
	  	  return a.startTime.localeCompare(b.startTime);
	});
	
	
	const filteredTimetable = sortedTimetable.filter((item) => {
	  return dayFilter === "all" || item.day === dayFilter;
	});



  return (
    <div className="min-h-screen bg-gray-100">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Timetable
        </h1>

        <p className="text-gray-500 mt-1">
          View your class schedule
        </p>
		<div className="mb-4">
		  <select
			value={dayFilter}
			onChange={(e) => setDayFilter(e.target.value)}
			className="border rounded-lg px-3 py-2 mt-2">
			<option value="all">All Days</option>
			<option value="Monday">Monday</option>
			<option value="Tuesday">Tuesday</option>
			<option value="Wednesday">Wednesday</option>
			<option value="Thursday">Thursday</option>
			<option value="Friday">Friday</option>
			<option value="Saturday">Saturday</option>
		  </select>
		</div>
		<div className="bg-white rounded-xl shadow-sm p-6 mt-6">
		 {timetableList.length === 0 ? (
			  <p className="text-center text-gray-500 py-6">
				No timetable found
			  </p>
			) : filteredTimetable.length === 0 ? (
			  <p className="text-center text-gray-500 py-6">
				No timetable found for selected day
			  </p>
			) : (
			<div className="overflow-x-auto">
			  <table className="w-full">
				<thead>
				  <tr className="border-b text-left">
					<th className="p-3">Day</th>
					<th className="p-3">Class</th>
					<th className="p-3">Section</th>
					<th className="p-3">Subject</th>
					<th className="p-3">Time</th>
					<th className="p-3">Room</th>
				  </tr>
				</thead>

				<tbody>
				  {filteredTimetable.map((item) => (
					<tr key={item._id} className="border-b hover:bg-gray-50">
					  <td className="p-3">{item.day}</td>
					  <td className="p-3">{item.className}</td>
					  <td className="p-3">{item.section || "-"}</td>
					  <td className="p-3">{item.subjectName}</td>
					  <td className="p-3">
						{item.startTime} - {item.endTime}
					  </td>
					  <td className="p-3">{item.roomNumber || "-"}</td>
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

export default TeacherTimetable;