import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiRequest("/teachers/my-classes");
        const data = await response.json();

        if (data.success) {
          setClasses(data.data);
        }
      } catch (error) {
        console.error("Error fetching teacher classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Classes
        </h1>

        <p className="mt-2 text-gray-500">
          Your assigned classes
        </p>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading...</p>
        ) : classes.length === 0 ? (
          <p className="mt-6 text-gray-500">
            No classes assigned.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {cls.className} - {cls.section}
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Room: {cls.roomNumber || "N/A"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Capacity: {cls.capacity}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Teacher: {cls.classTeacher}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherClasses;