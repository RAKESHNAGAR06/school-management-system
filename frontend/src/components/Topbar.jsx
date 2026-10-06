import { Bell, Search, CheckCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/api";

function Topbar() {
	//const user = JSON.parse(localStorage.getItem("user"));
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [showNotifications, setShowNotifications] = useState(false);

	const notificationRef = useRef(null);

	const user = JSON.parse(
	  localStorage.getItem("user") || "{}"
	);
	
	const fetchNotifications = async () => {
	  try {
		const response = await apiRequest(
		  "/notifications/my"
		);

		const data = await response.json();

		if (data.success) {
		  setNotifications(
			(data.data || []).slice(0, 5)
		  );

		  setUnreadCount(
			data.unreadCount || 0
		  );
		}
	  } catch (error) {
		console.error(
		  "Topbar notification error:",
		  error
		);
	  }
	};
	
	useEffect(() => {
	  fetchNotifications();
	}, []);
	
	useEffect(() => {
	  const handleOutsideClick = (event) => {
		if (
		  notificationRef.current &&
		  !notificationRef.current.contains(event.target)
		) {
		  setShowNotifications(false);
		}
	  };

	  document.addEventListener(
		"mousedown",
		handleOutsideClick
	  );

	  return () => {
		document.removeEventListener(
		  "mousedown",
		  handleOutsideClick
		);
	  };
	}, []);
	
	const openNotificationPage = () => {
	  setShowNotifications(false);

	  switch (user.role) {
		case "admin":
		  navigate("/admin/notifications");
		  break;

		case "teacher":
		  navigate("/teacher/notifications");
		  break;

		case "student":
		  navigate("/student/notifications");
		  break;

		case "parent":
		  navigate("/parent/notifications");
		  break;

		default:
		  break;
	  }
	};
	
	
	const markNotificationAsRead = async (
	  notification
	) => {
	  try {
		if (!notification.isRead) {
		  const response = await apiRequest(
			`/notifications/${notification._id}/read`,
			{
			  method: "PUT",
			}
		  );

		  const data = await response.json();

		  if (data.success) {
			setNotifications((previous) =>
			  previous.map((item) =>
				item._id === notification._id
				  ? {
					  ...item,
					  isRead: true,
					}
				  : item
			  )
			);

			setUnreadCount((previous) =>
			  Math.max(previous - 1, 0)
			);
		  }
		}
	  } catch (error) {
		console.error(
		  "Notification read error:",
		  error
		);
	  }
	};
	
	
	const markAllAsRead = async () => {
	  try {
		const response = await apiRequest(
		  "/notifications/read-all",
		  {
			method: "PUT",
		  }
		);

		const data = await response.json();

		if (data.success) {
		  setNotifications((previous) =>
			previous.map((item) => ({
			  ...item,
			  isRead: true,
			}))
		  );

		  setUnreadCount(0);
		}
	  } catch (error) {
		console.error(
		  "Mark all notification error:",
		  error
		);
	  }
	};

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      
      {/* Search */}
      <div className="flex items-center w-80 bg-gray-50 rounded-lg px-3">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent outline-none px-3 py-2 text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        <div
		  ref={notificationRef}
		  className="relative">
		  <button
			type="button"
			onClick={() => {
			  setShowNotifications(
				(previous) => !previous
			  );

			  if (!showNotifications) {
				fetchNotifications();
			  }
			}}
			className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100">
			<Bell size={22} />

			{unreadCount > 0 && (
			  <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
				{unreadCount > 99
				  ? "99+"
				  : unreadCount}
			  </span>
			)}
		  </button>

		  {showNotifications && (
			<div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-xl border bg-white shadow-xl">
			  {/* Header */}
			  <div className="flex items-center justify-between border-b px-4 py-3">
				<div>
				  <h3 className="font-semibold text-gray-800">
					Notifications
				  </h3>

				  <p className="text-xs text-gray-500">
					{unreadCount} unread
				  </p>
				</div>

				{unreadCount > 0 && (
				  <button
					type="button"
					onClick={markAllAsRead}
					className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
					<CheckCheck size={15} />
					Read All
				  </button>
				)}
			  </div>

			  {/* Notification Preview */}
			  <div className="max-h-96 overflow-y-auto">
				{notifications.length === 0 ? (
				  <div className="px-4 py-10 text-center">
					<Bell
					  size={30}
					  className="mx-auto mb-2 text-gray-300"/>

					<p className="text-sm text-gray-500">
					  No notifications
					</p>
				  </div>
				) : (
				  notifications.map((item) => (
					<button
					  key={item._id}
					  type="button"
					  onClick={() =>
						markNotificationAsRead(item)
					  }
					  className={`block w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
						!item.isRead
						  ? "bg-blue-50"
						  : "bg-white"
					  }`}>
					  <div className="flex gap-3">
						<div className="pt-1">
						  <span
							className={`block h-2 w-2 rounded-full ${
							  item.isRead
								? "bg-gray-300"
								: "bg-blue-600"
							}`}
						  />
						</div>

						<div className="min-w-0 flex-1">
						  <p
							className={`truncate text-sm ${
							  item.isRead
								? "font-medium text-gray-700"
								: "font-semibold text-gray-900"
							}`}>
							{item.title}
						  </p>

						  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
							{item.message}
						  </p>

						  <p className="mt-2 text-[11px] text-gray-400">
							{new Date(
							  item.createdAt
							).toLocaleString()}
						  </p>
						</div>
					  </div>
					</button>
				  ))
				)}
			  </div>

			  {/* Footer */}
			  <button
				type="button"
				onClick={openNotificationPage}
				className="w-full border-t px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50"
			  >
				View All Notifications
			  </button>
			</div>
		  )}
		</div>																													

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-800">
              {user?.name || "Admin"}
            </p>

            <p className="text-xs text-gray-400">
              {user?.role || "Admin"}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Topbar;