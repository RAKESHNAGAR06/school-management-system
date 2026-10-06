import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  CalendarCheck,
  ClipboardList,
  FileText,
  UserRound,
  NotebookPen,
  LogOut,
  CalendarDays,
  Bell,
  Bot,
} from "lucide-react";

function TeacherSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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

  const menuItems = [
    {
      name: "Dashboard",
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
	{
	  name: "AI Assistant",
	  icon: Bot,
	  path: "/teacher/ai-assistant",
	},
    {
      name: "My Classes",
      path: "/teacher/classes",
      icon: School,
    },
    {
      name: "Students",
      path: "/teacher/students",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/teacher/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Exams",
      path: "/teacher/exams",
      icon: ClipboardList,
    },
    {
      name: "Results",
      path: "/teacher/results",
      icon: FileText,
    },
	{
	  name: "Homework",
	  path: "/teacher/homework",
	  icon: NotebookPen,
	},
	{
	  name: "Timetable",
	  icon: CalendarDays,
	  path: "/teacher/timetable",
	},
	{
	  name: "Events & Holidays",
	  icon: CalendarDays,
	  path: "/teacher/events",
	},
	{
	  name: "Notifications",
	  icon: Bell,
	  path: "/teacher/notifications",
	},
    {
      name: "Profile",
      path: "/teacher/profile",
      icon: UserRound,
    },
  ];

  return (
  <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
    {/* Header */}
    <div className="h-20 shrink-0 flex items-center px-6 border-b">
      <h1 className="text-xl font-bold text-blue-600">
        Teacher Panel
      </h1>
    </div>

    {/* Scrollable Menu */}
    <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={19} />
            {item.name}
          </NavLink>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="shrink-0 border-t bg-white p-4">
	  <button
		  onClick={handleLogoutAllDevices}
		  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-orange-600 hover:bg-orange-50"
		>
		  <LogOut size={19} />
		  Logout All Devices
		</button>
	
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
      >
        <LogOut size={19} />
        Logout
      </button>
    </div>
  </aside>
);
}

export default TeacherSidebar;