import { useEffect, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import StudentSidebar from "../components/StudentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function StudentTimetable() {
  const [timetableList, setTimetableList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dayFilter, setDayFilter] = useState("all");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/timetable/student");
      const data = await response.json();

      if (data.success) {
        setTimetableList(data.data || []);
      } else {
        setError(data.message || "Unable to load timetable");
      }
    } catch (error) {
      console.error("Student timetable error:", error);
      setError("Unable to load timetable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const filteredTimetable = [...timetableList]
    .filter((item) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        item.subjectName?.toLowerCase().includes(search) ||
        item.teacherName?.toLowerCase().includes(search) ||
        item.roomNumber?.toLowerCase().includes(search) ||
        item.className?.toLowerCase().includes(search) ||
        item.section?.toLowerCase().includes(search);

      const matchesDay =
        dayFilter === "all" || item.day === dayFilter;

      return matchesSearch && matchesDay;
    })
    .sort((a, b) => {
      const dayDifference =
        (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return (a.startTime || "").localeCompare(b.startTime || "");
    });

  const clearFilters = () => {
    setSearchTerm("");
    setDayFilter("all");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <StudentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                My Timetable
              </h1>

              <p className="text-gray-500 mt-1">
                View your weekly class schedule
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search subject, teacher or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Day Filter */}
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white"
            >
              <option value="all">All Days</option>

              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            {/* Clear */}
            <button
              type="button"
              onClick={clearFilters}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-8">
              Loading timetable...
            </p>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>

              <button
                onClick={fetchTimetable}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : timetableList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No timetable assigned
            </p>
          ) : filteredTimetable.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No matching timetable found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="p-3">Day</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Teacher</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Room</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTimetable.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">
                        {item.day}
                      </td>

                      <td className="p-3">
                        {item.className}
                      </td>

                      <td className="p-3">
                        {item.section || "-"}
                      </td>

                      <td className="p-3">
                        {item.subjectName}
                      </td>

                      <td className="p-3">
                        {item.teacherName || "-"}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {item.startTime} - {item.endTime}
                      </td>

                      <td className="p-3">
                        {item.roomNumber || "-"}
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

export default StudentTimetable;