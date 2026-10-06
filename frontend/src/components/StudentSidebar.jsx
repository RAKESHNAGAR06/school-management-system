import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FileText,
  UserRound,
  NotebookPen,
  CalendarDays,
  Bell,
  LogOut,
  Bot,
} from "lucide-react";

function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
	{
	  name: "AI Assistant",
	  icon: Bot,
	  path: "/student/ai-assistant",
	},
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/student/attendance",
    },
    {
      name: "Exams",
      icon: ClipboardList,
      path: "/student/exams",
    },
    {
      name: "Results",
      icon: FileText,
      path: "/student/results",
    },
	{
	  name: "Homework",
	  path: "/student/homework",
	  icon: NotebookPen,
	},
	{
	  name: "Timetable",
	  icon: CalendarDays,
	  path: "/student/timetable",
	},
	{
	  name: "Events & Holidays",
	  icon: CalendarDays,
	  path: "/student/events",
	},
	{
	  name: "Notifications",
	  icon: Bell,
	  path: "/student/notifications",
	},
    {
      name: "Profile",
      icon: UserRound,
      path: "/student/profile",
    },
  ];

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

  return (
  <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r z-50 flex flex-col">
    {/* Header */}
    <div className="shrink-0 p-6 border-b">
      <h2 className="text-xl font-bold text-gray-800">
        Student Portal
      </h2>
    </div>

    {/* Scrollable Menu */}
    <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
      {menuItems.map((item) => {
        const Icon = item.icon;

        const active =
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-left transition ${
              active
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon size={20} />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>

    {/* Logout */}
    <div className="shrink-0 border-t bg-white p-3">
	
		<button
		  onClick={handleLogoutAllDevices}
		  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-orange-600 hover:bg-orange-50"
		>
		  <LogOut size={19} />
		  Logout All Devices
		</button>
	
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  </aside>
);
}

export default StudentSidebar;