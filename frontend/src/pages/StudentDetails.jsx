import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiRequest from "../utils/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  GraduationCap,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  RefreshCw,
} from "lucide-react";


import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
       const response = await apiRequest("/students");

        const data = await response.json();

        if (data.success) {
          const foundStudent = data.data.find(
            (item) => item._id === id
          );

          setStudent(foundStudent);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);
  
  
  
  const generateAIInsight = async () => {
	  try {
		setAiLoading(true);
		setAiError("");

		const response = await apiRequest(
		  `/ai/student-performance/${id}`,
		  {
			method: "POST",
		  }
		);

		const data = await response.json();

		if (!data.success) {
		  setAiError(
			data.message ||
			  "Unable to generate AI insight"
		  );
		  return;
		}

		setAiInsight(data.data);
	  } catch (error) {
		console.error(
		  "Generate AI insight error:",
		  error
		);

		setAiError(
		  "Something went wrong while generating AI insight"
		);
	  } finally {
		setAiLoading(false);
	  }
	};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        Loading student...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-bold">
          Student not found
        </h1>

        <button
          onClick={() => navigate("/admin/students")}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <Topbar />

      <main className="ml-64 pt-20">
        <div className="p-6">

          {/* Header */}
          <div className="mb-6 flex items-center gap-4">

            <button
              onClick={() => navigate("/admin/students")}
              className="rounded-lg border bg-white p-2 hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Student Profile
              </h1>

              <p className="text-sm text-gray-500">
                View student information
              </p>
            </div>

          </div>

          {/* Profile Header */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <User
                  size={40}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {student.name}
                </h2>

                <p className="mt-1 text-gray-500">
                  {student.className || "Class not assigned"}
                  {" • "}
                  {student.section || "Section not assigned"}
                </p>

                <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  {student.isActive ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

          </div>

          {/* Information */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Personal Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <User size={20} />
                Personal Information
              </h2>

              <div className="space-y-5">

                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <p className="text-sm font-medium">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <p className="text-sm font-medium">
                      {student.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-gray-400" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Date of Birth
                    </p>

                    <p className="text-sm font-medium">
                      {student.dateOfBirth
                        ? new Date(
                            student.dateOfBirth
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="text-gray-400" size={20} />

                  <div>
                    <p className="text-xs text-gray-500">
                      Address
                    </p>

                    <p className="text-sm font-medium">
                      {student.address || "-"}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Academic Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <GraduationCap size={20} />
                Academic Information
              </h2>

              <div className="space-y-5">

                <div>
                  <p className="text-xs text-gray-500">
                    Class
                  </p>

                  <p className="text-sm font-medium">
                    {student.className || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Section
                  </p>

                  <p className="text-sm font-medium">
                    {student.section || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Roll Number
                  </p>

                  <p className="text-sm font-medium">
                    {student.rollNumber || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Admission Date
                  </p>

                  <p className="text-sm font-medium">
                    {student.admissionDate
                      ? new Date(
                          student.admissionDate
                        ).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

              </div>
            </div>

            {/* Parent Information */}
            <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">

              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Users size={20} />
                Parent Information
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <p className="text-xs text-gray-500">
                    Parent Name
                  </p>

                  <p className="text-sm font-medium">
                    {student.parentName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Parent Phone
                  </p>

                  <p className="text-sm font-medium">
                    {student.parentPhone || "-"}
                  </p>
                </div>

              </div>
            </div>
			
			{/* AI Performance Insight */}
				<div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">

				  {/* Header */}
				  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

					<div>
					  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
						<Sparkles
						  size={21}
						  className="text-blue-600"
						/>
						AI Performance Insight
					  </h2>

					  <p className="mt-1 text-sm text-gray-500">
						AI analysis based on this student's results and attendance records.
					  </p>
					</div>

					<button
					  type="button"
					  onClick={generateAIInsight}
					  disabled={aiLoading}
					  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
					>
					  {aiLoading ? (
						<>
						  <RefreshCw
							size={17}
							className="animate-spin"
						  />
						  Analyzing...
						</>
					  ) : (
						<>
						  <Sparkles size={17} />
						  {aiInsight
							? "Regenerate Insight"
							: "Generate AI Insight"}
						</>
					  )}
					</button>

				  </div>

				  {/* Error */}
				  {aiError && (
					<div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					  {aiError}
					</div>
				  )}

				  {/* Initial State */}
				  {!aiInsight &&
					!aiLoading &&
					!aiError && (
					  <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

						<Sparkles
						  size={32}
						  className="mx-auto mb-3 text-gray-400"
						/>

						<p className="font-medium text-gray-700">
						  No AI analysis generated yet
						</p>

						<p className="mt-1 text-sm text-gray-500">
						  Generate an insight to analyze academic performance and attendance.
						</p>

					  </div>
					)}

				  {/* Loading */}
				  {aiLoading && (
					<div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center">

					  <RefreshCw
						size={30}
						className="mx-auto mb-3 animate-spin text-blue-600"
					  />

					  <p className="font-medium text-gray-700">
						Analyzing student data...
					  </p>

					  <p className="mt-1 text-sm text-gray-500">
						Reviewing results and attendance records.
					  </p>

					</div>
				  )}

				  {/* AI Result */}
				  {aiInsight && !aiLoading && (
					<div className="mt-6">

					  {/* Statistics */}
					  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

						<div className="rounded-xl border bg-blue-50 p-4">
						  <p className="text-sm text-gray-500">
							Average Result
						  </p>

						  <p className="mt-1 text-2xl font-bold text-blue-700">
							{aiInsight.statistics
							  ?.averagePercentage !== null &&
							aiInsight.statistics
							  ?.averagePercentage !== undefined
							  ? `${aiInsight.statistics.averagePercentage}%`
							  : "-"}
						  </p>
						</div>

						<div className="rounded-xl border bg-green-50 p-4">
						  <p className="text-sm text-gray-500">
							Attendance
						  </p>

						  <p className="mt-1 text-2xl font-bold text-green-700">
							{aiInsight.statistics
							  ?.attendancePercentage !== null &&
							aiInsight.statistics
							  ?.attendancePercentage !== undefined
							  ? `${aiInsight.statistics.attendancePercentage}%`
							  : "-"}
						  </p>
						</div>

						<div className="rounded-xl border bg-purple-50 p-4">
						  <p className="text-sm text-gray-500">
							Results Analyzed
						  </p>

						  <p className="mt-1 text-2xl font-bold text-purple-700">
							{aiInsight.statistics
							  ?.resultCount ?? 0}
						  </p>
						</div>

					  </div>

					  {/* Attendance Details */}
					  {aiInsight.statistics
						?.attendanceStats && (
						<div className="mt-5 rounded-xl border p-5">

						  <h3 className="mb-4 font-semibold text-gray-800">
							Attendance Summary
						  </h3>

						  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">

							<div>
							  <p className="text-xs text-gray-500">
								Total
							  </p>

							  <p className="font-semibold">
								{aiInsight.statistics
								  .attendanceStats.total}
							  </p>
							</div>

							<div>
							  <p className="text-xs text-gray-500">
								Present
							  </p>

							  <p className="font-semibold text-green-600">
								{aiInsight.statistics
								  .attendanceStats.present}
							  </p>
							</div>

							<div>
							  <p className="text-xs text-gray-500">
								Absent
							  </p>

							  <p className="font-semibold text-red-600">
								{aiInsight.statistics
								  .attendanceStats.absent}
							  </p>
							</div>

							<div>
							  <p className="text-xs text-gray-500">
								Late
							  </p>

							  <p className="font-semibold text-orange-600">
								{aiInsight.statistics
								  .attendanceStats.late}
							  </p>
							</div>

							<div>
							  <p className="text-xs text-gray-500">
								Leave
							  </p>

							  <p className="font-semibold text-gray-700">
								{aiInsight.statistics
								  .attendanceStats.leave}
							  </p>
							</div>

						  </div>

						</div>
					  )}

					  {/* Generated Analysis */}
					  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-5">

						<div className="mb-4 flex items-center gap-2">
						  <Sparkles
							size={19}
							className="text-blue-600"
						  />

						  <h3 className="font-semibold text-gray-800">
							AI Analysis
						  </h3>
						</div>

						<div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
						  {aiInsight.insight}
						</div>

					  </div>

					  <p className="mt-3 text-xs text-gray-400">
						AI-generated analysis should be reviewed by school staff before making academic decisions.
					  </p>

					</div>
				  )}

				</div>
			

          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDetails;