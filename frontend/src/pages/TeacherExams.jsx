import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  X,
  FileQuestion,
} from "lucide-react";

function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAI, setShowAI] = useState(false);
  const [selectedExamId, setSelectedExamId] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  const [questionPaper, setQuestionPaper] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [aiForm, setAiForm] = useState({
    topic: "",
    difficulty: "medium",
    questionType: "mixed",
    questionCount: 10,
    additionalInstructions: "",
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response =
          await apiRequest(
            "/teachers/my-exams"
          );

        const data =
          await response.json();

        if (data.success) {
          setExams(data.data);
        }
      } catch (error) {
        console.error(
          "Teacher exams error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const selectedExam = exams.find(
    (exam) =>
      exam._id === selectedExamId
  );

  const resetAIGenerator = () => {
    setSelectedExamId("");

    setAiForm({
      topic: "",
      difficulty: "medium",
      questionType: "mixed",
      questionCount: 10,
      additionalInstructions: "",
    });

    setQuestionPaper("");
    setAiError("");
    setCopied(false);
  };

  const handleCloseAI = () => {
    setShowAI(false);
    resetAIGenerator();
  };

  const handleGenerateQuestionPaper =
    async () => {
      if (!selectedExam) {
        setAiError(
          "Please select an exam."
        );
        return;
      }

      if (!aiForm.topic.trim()) {
        setAiError(
          "Please enter a topic."
        );
        return;
      }

      try {
        setAiLoading(true);
        setAiError("");
        setCopied(false);

        const response =
          await apiRequest(
            "/ai/generate-exam-questions",
            {
              method: "POST",
              body: JSON.stringify({
				  examId: selectedExam._id,
				  topic: aiForm.topic,
				  difficulty: aiForm.difficulty,
				  questionCount:
					Number(aiForm.questionCount),
				  questionType:
					aiForm.questionType,
				  additionalInstructions:
					aiForm.additionalInstructions,
				}),
            }
          );

        const data =
          await response.json();

        if (!data.success) {
          setAiError(
            data.message ||
              "Unable to generate question paper"
          );
          return;
        }

        setQuestionPaper(
          data.data.questionPaper
        );
      } catch (error) {
        console.error(
          "AI question paper error:",
          error
        );

        setAiError(
          "Something went wrong while generating the question paper."
        );
      } finally {
        setAiLoading(false);
      }
    };

  const handleCopy = async () => {
    if (!questionPaper) return;

    try {
      await navigator.clipboard.writeText(
        questionPaper
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Exams
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View assigned exams and generate
              AI-powered question paper drafts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAI((prev) => !prev);

              if (showAI) {
                resetAIGenerator();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700"
          >
            <Sparkles size={18} />

            AI Question Generator
          </button>

        </div>

        {/* AI Generator */}
        {showAI && (
          <div className="mt-6 rounded-xl border border-purple-200 bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <FileQuestion
                    size={21}
                    className="text-purple-600"
                  />

                  AI Question Paper Generator
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select an assigned exam and
                  generate a draft question
                  paper using AI.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseAI}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

              {/* Exam */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Select Exam
                </label>

                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(
                      e.target.value
                    );

                    setQuestionPaper("");
                    setAiError("");
                  }}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="">
                    Select assigned exam
                  </option>

                  {exams.map((exam) => (
                    <option
                      key={exam._id}
                      value={exam._id}
                    >
                      {exam.examName}
                      {" - "}
                      {exam.className}

                      {exam.section
                        ? ` ${exam.section}`
                        : ""}

                      {" - "}
                      {exam.subjectName}
                    </option>
                  ))}

                </select>
              </div>

              {/* Selected exam info */}
              {selectedExam && (
                <div className="md:col-span-2 rounded-lg border bg-gray-50 p-4">

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                    <div>
                      <p className="text-xs text-gray-500">
                        Class
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedExam.className}
                        {selectedExam.section
                          ? ` - ${selectedExam.section}`
                          : ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Subject
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedExam.subjectName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Total Marks
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedExam.totalMarks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Exam Date
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedExam.examDate
                          ? new Date(
                              selectedExam.examDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* Topic */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Topic / Syllabus
                </label>

                <textarea
                  rows="3"
                  placeholder="Example: Indian National Movement, chapters 3 and 4..."
                  value={aiForm.topic}
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      topic: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Difficulty
                </label>

                <select
                  value={
                    aiForm.difficulty
                  }
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      difficulty:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
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

              {/* Question type */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Question Type
                </label>

                <select
                  value={
                    aiForm.questionType
                  }
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      questionType:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="mixed">
                    Mixed
                  </option>

                  <option value="mcq">
                    MCQ
                  </option>

                  <option value="short">
                    Short Answer
                  </option>

                  <option value="long">
                    Long Answer
                  </option>
                </select>
              </div>

              {/* Count */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Number of Questions
                </label>

                <input
                  type="number"
                  min="1"
                  max="50"
                  value={
                    aiForm.questionCount
                  }
                  onChange={(e) =>
                    setAiForm({
                      ...aiForm,
                      questionCount:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              {/* Total marks */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Total Marks
                </label>

                <input
                  type="number"
                  value={
                    selectedExam?.totalMarks ||
                    ""
                  }
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border bg-gray-100 px-3 py-2"
                />
              </div>

              {/* Additional */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Additional Instructions
                </label>

                <textarea
                  rows="3"
                  placeholder="Optional: Include 5 MCQs, focus more on chapter 4, add internal choice..."
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
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

            </div>

            {aiError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {aiError}
              </div>
            )}

            <div className="mt-5">

              <button
                type="button"
                onClick={
                  handleGenerateQuestionPaper
                }
                disabled={
                  aiLoading ||
                  !selectedExamId
                }
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />

                    Generating Question Paper...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Question Paper
                  </>
                )}
              </button>

            </div>

            {/* Generated paper */}
            {questionPaper &&
              !aiLoading && (
                <div className="mt-6 border-t pt-6">

                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Generated Question Paper
                      </h3>

                      <p className="text-sm text-gray-500">
                        Review and edit the AI
                        draft before using it.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      {copied ? (
                        <>
                          <Check
                            size={17}
                            className="text-green-600"
                          />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={17} />
                          Copy
                        </>
                      )}
                    </button>

                  </div>

                  <textarea
                    value={questionPaper}
                    onChange={(e) =>
                      setQuestionPaper(
                        e.target.value
                      )
                    }
                    rows="22"
                    className="w-full rounded-xl border bg-gray-50 p-5 font-mono text-sm leading-7 text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />

                  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    AI-generated questions are
                    drafts. The teacher should
                    verify syllabus coverage,
                    marks distribution and
                    correctness before using
                    the paper.
                  </div>

                </div>
              )}

          </div>
        )}

        {/* Exams table */}
        {loading ? (
          <p className="mt-6 text-gray-500">
            Loading exams...
          </p>
        ) : exams.length === 0 ? (
          <div className="mt-6 rounded-xl border bg-white p-6 text-gray-500 shadow-sm">
            No exams found for your assigned
            classes.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">

            <table className="w-full">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">
                    Exam
                  </th>

                  <th className="p-4 text-left">
                    Class
                  </th>

                  <th className="p-4 text-left">
                    Section
                  </th>

                  <th className="p-4 text-left">
                    Subject
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-left">
                    Total Marks
                  </th>

                  <th className="p-4 text-left">
                    AI
                  </th>
                </tr>
              </thead>

              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {exam.examName}
                    </td>

                    <td className="p-4">
                      {exam.className}
                    </td>

                    <td className="p-4">
                      {exam.section || "-"}
                    </td>

                    <td className="p-4">
                      {exam.subjectName}
                    </td>

                    <td className="p-4">
                      {exam.examDate
                        ? new Date(
                            exam.examDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-4">
                      {exam.totalMarks}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExamId(
                            exam._id
                          );

                          setQuestionPaper("");
                          setAiError("");
                          setShowAI(true);

                          window.scrollTo({
                            top: 0,
                            behavior:
                              "smooth",
                          });
                        }}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                      >
                        <Sparkles
                          size={16}
                        />
                        Generate
                      </button>
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

export default TeacherExams;