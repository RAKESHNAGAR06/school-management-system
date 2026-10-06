import {
  LayoutDashboard,
  Users,
  UserRound,
  GraduationCap,
  School,
  BookOpen,
  CalendarCheck,
  Wallet,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  FileCheck2,
  CalendarDays, 
  NotebookPen,
  Bell,
  Bot,
  Archive,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../utils/api";
import { API_BASE_URL, getFileUrl } from "../utils/api";


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Current active URL detect karne ke liye
  const [schoolInfo, setSchoolInfo] = useState({
		  schoolName: "",
		  logo: "",
		});
		
	useEffect(() => {
		  const fetchSchoolInfo = async () => {
			try {
			  const response = await fetch(
				`${API_BASE_URL}/settings`
			  );

			  const data = await response.json();

			  if (data.success) {
				setSchoolInfo({
				  schoolName: data.data.schoolName || "",
				  logo: data.data.logo || "",
				});
			  }
			} catch (error) {
			  console.error("School info fetch error:", error);
			}
		  };

		  fetchSchoolInfo();
		}, []);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
	{
	  name: "AI Assistant",
	  icon: Bot,
	  path: "/admin/ai-assistant",
	},
    {
      name: "Students",
      icon: Users,
      path: "/admin/students",
    },
    {
      name: "Teachers",
      icon: UserRound,
      path: "/admin/teachers",
    },
    {
      name: "Parents",
      icon: GraduationCap,
      path: "/admin/parents",
    },
    {
      name: "Classes",
      icon: School,
      path: "/admin/classes",
    },
    {
      name: "Subjects",
      icon: BookOpen,
      path: "/admin/subjects",
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/admin/attendance",
    },
    {
      name: "Fees",
      icon: Wallet,
      path: "/admin/fees",
    },
	{
	  name: "Timetable",
	  path: "/admin/timetable",
	  icon: CalendarDays,
	},
	{
	  name: "Events & Holidays",
	  icon: CalendarDays,
	  path: "/admin/events",
	},
	{
	  name: "Homework",
	  icon: NotebookPen,
	  path: "/admin/homework",
	},
    {
      name: "Exams",
      icon: ClipboardList,
      path: "/admin/exams",
    },
	{
      name: "Result",
      icon: FileCheck2,
      path: "/admin/results",
    },
    {
      name: "Reports",
      icon: FileText,
      path: "/admin/reports",
    },
	{
	  name: "Archived Records",
	  icon: Archive,
	  path: "/admin/archived",
	},
	{
	  name: "Notifications",
	  icon: Bell,
	  path: "/admin/notifications",
	},
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };
  
  
  const handleLogoutAllDevices =
  async () => {
    const confirmed =
      window.confirm(
        "Logout from all devices? You will need to login again on every device."
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await apiRequest(
          "/auth/logout-all",
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to logout from all devices"
        );
      }

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href =
        "/login";
    } catch (error) {
      console.error(
        "Logout all devices error:",
        error
      );

      /*
        If the token has already become
        invalid, clear local session anyway.
      */

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href =
        "/login";
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
     {/* School Logo */}
		<div className="h-16 flex items-center px-4 border-b border-gray-200">
		  {schoolInfo.logo ? (
			<img
			  src={getFileUrl(schoolInfo.logo)}
			  alt="School Logo"
			  className="w-10 h-10 rounded-lg border border-gray-200 object-cover"
			/>
		  ) : (
			<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
			  <School className="text-white" size={21} />
			</div>
		  )}

		  <div className="ml-3 min-w-0">
			<h1 className="font-bold text-gray-800 truncate">
			  {schoolInfo.schoolName || "School Management"}
			</h1>

			<p className="text-xs text-gray-400">
			  School Management
			</p>
		  </div>
		</div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-3">
          Main Menu
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          // Exact route ya nested sub-route matching check karne ke liye logic:
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm" // Active state me dark blue background
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => navigate("/admin/settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
            location.pathname === "/admin/settings"
              ? "bg-blue-600 text-white font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings size={19} />
          Settings
        </button>
		
		<button
		  onClick={handleLogoutAllDevices}
		  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-orange-600 hover:bg-orange-50"
		>
		  <LogOut size={19} />
		  Logout All Devices
		</button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;