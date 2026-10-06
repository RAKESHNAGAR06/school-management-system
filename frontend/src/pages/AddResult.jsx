import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function AddResult() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    examId: "",
    examName: "",
    subjectName: "",
    totalMarks: "",
    obtainedMarks: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
       
		const [
  studentsResponse,
  examsResponse,
] = await Promise.all([
  apiRequest("/students"),
  apiRequest("/exams"),
]);

        const studentsData = await studentsResponse.json();
        const examsData = await examsResponse.json();

        if (studentsData.success) {
          setStudents(studentsData.data);
        }

        if (examsData.success) {
          setExams(examsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleStudentChange = (e) => {
    const studentId = e.target.value;

    const selectedStudent = students.find(
      (student) => student._id === studentId
    );

    setFormData((prev) => ({
      ...prev,
      studentId,
      studentName: selectedStudent?.name || "",
    }));
  };

  const handleExamChange = (e) => {
    const examId = e.target.value;

    const selectedExam = exams.find(
      (exam) => exam._id === examId
    );

    setFormData((prev) => ({
      ...prev,
      examId,
      examName: selectedExam?.examName || "",
      subjectName: selectedExam?.subjectName || "",
      totalMarks: selectedExam?.totalMarks || "",
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId) {
      alert("Please select a student");
      return;
    }

    if (!formData.examId) {
      alert("Please select an exam");
      return;
    }

    if (formData.obtainedMarks === "") {
      alert("Please enter obtained marks");
      return;
    }

    if (
      Number(formData.obtainedMarks) >
      Number(formData.totalMarks)
    ) {
      alert("Obtained marks cannot be greater than total marks");
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest("/results", {
  method: "POST",
          body: JSON.stringify({
            ...formData,
            totalMarks: Number(formData.totalMarks),
            obtainedMarks: Number(formData.obtainedMarks),
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Result added successfully");
        navigate("/admin/results");
      } else {
        alert(result.message || "Failed to add result");
      }
    } catch (error) {
      console.error("Error adding result:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-4xl">

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/admin/results")}
              className="p-2 rounded-lg border bg-white hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Add Result
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter student's exam marks
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border p-6"
          >

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>

                <select
                  value={formData.studentId}
                  onChange={handleStudentChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Student</option>

                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam *
                </label>

                <select
                  value={formData.examId}
                  onChange={handleExamChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Exam</option>

                  {exams.map((exam) => (
                    <option key={exam._id} value={exam._id}>
                      {exam.examName} - {exam.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>

                <input
                  type="text"
                  value={formData.subjectName}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
                />
              </div>

              {/* Total Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Marks
                </label>

                <input
                  type="number"
                  value={formData.totalMarks}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-600"
                />
              </div>

              {/* Obtained Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obtained Marks *
                </label>

                <input
                  type="number"
                  name="obtainedMarks"
                  value={formData.obtainedMarks}
                  onChange={handleChange}
                  min="0"
                  max={formData.totalMarks || undefined}
                  placeholder="Enter obtained marks"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>

                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter remarks"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t">
              <button
                type="button"
                onClick={() => navigate("/admin/results")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Result"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export default AddResult;