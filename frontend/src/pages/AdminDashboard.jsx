import {
  Users,
  UserRound,
  GraduationCap,
  School,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useEffect, useState } from "react";
import apiRequest from "../utils/api";

function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    studentChange: "+0%",
    totalTeachers: 0,
    teacherChange: "+0%",
    totalParents: 0,
    parentChange: "+0%",
    totalClasses: 0,
    classChange: "+0%",
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await apiRequest("/dashboard/stats");

        const data = await response.json();

        if (data.success) {
          setStatsData({
            totalStudents: data.data.totalStudents || 0,
            studentChange: data.data.studentChange || "+0%",
            totalTeachers: data.data.totalTeachers || 0,
            teacherChange: data.data.teacherChange || "+0%",
            totalParents: data.data.totalParents || 0,
            parentChange: data.data.parentChange || "+0%",
            totalClasses: data.data.totalClasses || 0,
            classChange: data.data.classChange || "+0%",
          });
        }
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: statsData.totalStudents.toLocaleString("en-IN"),
      change: statsData.studentChange,
      icon: Users,
    },
    {
      title: "Total Teachers",
      value: statsData.totalTeachers.toLocaleString("en-IN"),
      change: statsData.teacherChange,
      icon: UserRound,
    },
    {
      title: "Total Parents",
      value: statsData.totalParents.toLocaleString("en-IN"),
      change: statsData.parentChange,
      icon: GraduationCap,
    },
    {
      title: "Total Classes",
      value: statsData.totalClasses.toLocaleString("en-IN"),
      change: statsData.classChange,
      icon: School,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-16 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening in your school.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isNegative = stat.change.startsWith("-");
            const TrendIcon = isNegative ? TrendingDown : TrendingUp;

            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-2">
                      {stat.value}
                    </h2>

                    <div
                      className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                        isNegative ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      <TrendIcon size={15} />
                      {stat.change}
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800">Attendance Overview</h2>

            <div className="h-64 flex items-center justify-center text-gray-400">
              Attendance Chart
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800">Recent Activities</h2>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-gray-600">New student registered</p>
              <p className="text-sm text-gray-600">Teacher added a new homework</p>
              <p className="text-sm text-gray-600">Fee payment received</p>
              <p className="text-sm text-gray-600">New exam schedule published</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;