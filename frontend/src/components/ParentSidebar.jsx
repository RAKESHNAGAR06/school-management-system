import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  CalendarCheck,
  ClipboardList,
  FileText,
  Wallet,
  NotebookPen,
  CalendarDays,
  Bell,
  LogOut,
  Bot,
} from "lucide-react";

function ParentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/parent/dashboard",
    },
	{
	  name: "AI Assistant",
	  icon: Bot,
	  path: "/parent/ai-assistant",
	},
    {
      name: "My Child",
      icon: UserRound,
      path: "/parent/child",
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/parent/attendance",
    },
    {
      name: "Exams",
      icon: ClipboardList,
      path: "/parent/exams",
    },
    {
      name: "Results",
      icon: FileText,
      path: "/parent/results",
    },
	{
	  name: "Homework",
	  path: "/parent/homework",
	  icon: NotebookPen,
	},
    {
      name: "Fees",
      icon: Wallet,
      path: "/parent/fees",
    },
	{
	  name: "Timetable",
	  icon: CalendarDays,
	  path: "/parent/timetable",
	},
	{
	  name: "Events & Holidays",
	  icon: CalendarDays,
	  path: "/parent/events",
	},
	{
	  name: "Notifications",
	  icon: Bell,
	  path: "/parent/notifications",
	},
    {
      name: "Profile",
      icon: UserRound,
      path: "/parent/profile",
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
        Parent Portal
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

export default ParentSidebar;