import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import {
  Pencil,Trash2
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [formData, setFormData] = useState({
	  studentId: "",
	  examId: "",
	  obtainedMarks: "",
	  remarks: "",
	});
  const [editingResult, setEditingResult] = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  
  const filteredResults = results.filter((result) => {
  const examMatch =
    !selectedExam || result.examId === selectedExam;

  const studentMatch =
    !selectedStudent || result.studentId === selectedStudent;

  return examMatch && studentMatch;
   });  
	
	
	const handleSaveResult = async () => {
  try {
    if (
      !formData.studentId ||
      !formData.examId ||
      formData.obtainedMarks === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    let response;

    if (editingResult) {
      response = await apiRequest(
        `/teachers/results/${editingResult._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            obtainedMarks: Number(formData.obtainedMarks),
            remarks: formData.remarks,
          }),
        }
      );
    } else {
      const selectedStudent = students.find(
        (student) => student._id === formData.studentId
      );

      const selectedExam = exams.find(
        (exam) => exam._id === formData.examId
      );

      response = await apiRequest("/teachers/results", {
        method: "POST",
        body: JSON.stringify({
          studentId: selectedStudent._id,
          examId: selectedExam._id,
          obtainedMarks: Number(formData.obtainedMarks),
          remarks: formData.remarks,
        }),
      });
    }

    const data = await response.json();

    if (data.success) {
  toast.success(
    editingResult
      ? "Result updated successfully"
      : "Result added successfully"
  );

  setShowAddForm(false);
  setEditingResult(null);

  setFormData({
    studentId: "",
    examId: "",
    obtainedMarks: "",
    remarks: "",
  });

  fetchResults();
} else {
  toast.error(data.message || "Failed to save result");
}
  } catch (error) {
  console.error("Save result error:", error);
  toast.error("Something went wrong");
}
};

 const fetchResults = async () => {
  try {
    const response = await apiRequest("/teachers/my-results");
    const data = await response.json();

    if (data.success) {
      setResults(data.data);
    }
  } catch (error) {
    console.error("Teacher results error:", error);
  } finally {
    setLoading(false);
  }
};


const handleDeleteResult = async (id) => {
  

  try {
    const response = await apiRequest(`/teachers/results/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

   if (data.success) {
  toast.success("Result deleted successfully");
  fetchResults();
} else {
  toast.error(data.message || "Failed to delete result");
} 
  }
catch (error) {
  console.error("Delete result error:", error);
  toast.error("Something went wrong");
}
};

useEffect(() => {
  fetchResults();
}, []);
  
  
  useEffect(() => {
	  const fetchFormData = async () => {
		try {
		  const [studentsResponse, examsResponse] = await Promise.all([
			apiRequest("/teachers/my-students"),
			apiRequest("/teachers/my-exams"),
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
		  console.error("Result form data error:", error);
		}
	  };

	  fetchFormData();
	}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
	  <ToastContainer
		  position="top-right"
		  autoClose={3500}
		/>
        
		<div className="flex items-center justify-between">
		  <h1 className="text-2xl font-bold text-gray-800">
			Results
		  </h1>

		 <button
		  onClick={() => setShowAddForm(true)}
		  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
		>
		  Add Result
		</button>
		</div>
		
		
		<div className="mt-6 flex flex-wrap gap-4">
		  <select
			value={selectedStudent}
			onChange={(e) => setSelectedStudent(e.target.value)}
			className="border rounded-lg px-3 py-2"
		  >
			<option value="">All Students</option>

			{students.map((student) => (
			  <option key={student._id} value={student._id}>
				{student.name}
			  </option>
			))}
		  </select>

		  <select
			value={selectedExam}
			onChange={(e) => setSelectedExam(e.target.value)}
			className="border rounded-lg px-3 py-2"
		  >
			<option value="">All Exams</option>

			{exams.map((exam) => (
			  <option key={exam._id} value={exam._id}>
				{exam.examName} - {exam.subjectName}
			  </option>
			))}
		  </select>
		</div>

        {loading ? (
          <p className="mt-4 text-gray-500">Loading results...</p>
        ) : filteredResults.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No results found for your students.
          </p>
        ) : (
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Exam</th>
                  <th className="text-left p-4">Subject</th>
                  <th className="text-left p-4">Marks</th>
                  <th className="text-left p-4">Percentage</th>
                  <th className="text-left p-4">Grade</th>
				  <th className="text-left p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => (
                  <tr
                    key={result._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4">{result.studentName}</td>
                    <td className="p-4">{result.examName}</td>
                    <td className="p-4">{result.subjectName}</td>
                    <td className="p-4">
                      {result.obtainedMarks} / {result.totalMarks}
                    </td>
                    <td className="p-4">
                      {result.percentage}%
                    </td>
                    <td className="p-4">
                      {result.grade || "-"}
                    </td>
					<td className="p-4">
					 <div className="flex gap-3">
					  <button
					    title="Edit"
						  onClick={() => {
							setEditingResult(result);

							setFormData({
							  studentId: result.studentId,
							  examId: result.examId,
							  obtainedMarks: result.obtainedMarks,
							  remarks: result.remarks || "",
							});

							setShowAddForm(true);
						  }}
						className="text-green-600 hover:bg-green-100 font-medium">
						<Pencil size={17} />
					  </button>
					  
					  <button
					      title="Delete"
						  onClick={() => setDeleteId(result._id)}
						  className="text-red-600 hover:text-red-800 font-medium"
						>
						  <Trash2 size={17} />
						</button>
					  </div>
					</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
		
		{showAddForm && (
		  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<div className="bg-white w-full max-w-lg rounded-xl p-6">
			  <div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold text-gray-800">
				  {editingResult ? "Edit Result" : "Add Result"}
				</h2>

				<button
				  onClick={() => {
					setShowAddForm(false);
					setEditingResult(null);

					setFormData({
					  studentId: "",
					  examId: "",
					  obtainedMarks: "",
					  remarks: "",
					});
				  }}
				  className="text-gray-500 hover:text-gray-800"
				>
				  ✕
				</button>
			  </div>

			 <div className="space-y-4">
			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Student
				</label>

				<select
				  value={formData.studentId}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  studentId: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				>
				  <option value="">Select Student</option>

				  {students.map((student) => (
					<option key={student._id} value={student._id}>
					  {student.name} - {student.className} {student.section}
					</option>
				  ))}
				</select>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Exam
				</label>

				<select
				  value={formData.examId}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  examId: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				>
				  <option value="">Select Exam</option>

				  {exams.map((exam) => (
					<option key={exam._id} value={exam._id}>
					  {exam.examName} - {exam.subjectName}
					</option>
				  ))}
				</select>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Obtained Marks
				</label>

				<input
				  type="number"
				  value={formData.obtainedMarks}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  obtainedMarks: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				  placeholder="Enter marks"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Remarks
				</label>

				<textarea
				  value={formData.remarks}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  remarks: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				  placeholder="Enter remarks"
				/>
			  </div>

			  <button
				  onClick={handleSaveResult}
				  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
				>
				  {editingResult ? "Update Result" : "Save Result"}
				</button>
			</div>
			</div>
		  </div>
		)}
		
		{deleteId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-800">
        Delete Result
      </h2>

      <p className="mt-2 text-gray-600">
        Are you sure you want to delete this result?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setDeleteId(null)}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={() => handleDeleteResult(deleteId)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
  
}

export default TeacherResults;