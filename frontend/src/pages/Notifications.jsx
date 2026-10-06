import { useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
} from "lucide-react";
import apiRequest from "../utils/api";

import Sidebar from "../components/Sidebar";
import TeacherSidebar from "../components/TeacherSidebar";
import StudentSidebar from "../components/StudentSidebar";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await apiRequest(
        "/notifications/my"
      );

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const notification = notifications.find(
      (item) => item._id === id
    );

    if (!notification || notification.isRead) {
      return;
    }

    try {
      const response = await apiRequest(
        `/notifications/${id}/read`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications((previous) =>
          previous.map((item) =>
            item._id === id
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
    } catch (error) {
      console.error(
        "Mark notification error:",
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
        "Mark all error:",
        error
      );
    }
  };

  const renderSidebar = () => {
    switch (user.role) {
      case "teacher":
        return <TeacherSidebar />;

      case "student":
        return <StudentSidebar />;

      case "parent":
        return <ParentSidebar />;

      default:
        return <Sidebar />;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case "exam":
        return "bg-purple-100 text-purple-700";

      case "result":
        return "bg-green-100 text-green-700";

      case "fee":
        return "bg-orange-100 text-orange-700";

      case "attendance":
        return "bg-red-100 text-red-700";

      case "homework":
        return "bg-blue-100 text-blue-700";

      case "holiday":
        return "bg-pink-100 text-pink-700";

      case "event":
        return "bg-indigo-100 text-indigo-700";

      case "emergency":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderSidebar()}
      <Topbar />

      <main className="ml-64 p-6 pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <BellRing
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  My Notifications
                </h1>

                <p className="text-sm text-gray-500">
                  {unreadCount} unread notification
                  {unreadCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <CheckCheck size={18} />
                Mark All as Read
              </button>
            )}
          </div>

          {loading ? (
            <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <Bell
                size={42}
                className="mx-auto mb-3 text-gray-300"
              />

              <h3 className="font-semibold text-gray-700">
                No notifications
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                New school notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() =>
                    markAsRead(item._id)
                  }
                  className={`w-full rounded-xl border p-5 text-left shadow-sm transition hover:shadow-md ${
                    item.isRead
                      ? "bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className={`mt-1 rounded-full p-2 ${
                        item.isRead
                          ? "bg-gray-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <Bell
                        size={18}
                        className={
                          item.isRead
                            ? "text-gray-500"
                            : "text-blue-600"
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-semibold ${
                            item.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getTypeStyle(
                            item.type
                          )}`}
                        >
                          {item.type}
                        </span>

                        {!item.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {item.message}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                        {item.createdBy?.name && (
                          <span>
                            By {item.createdBy.name}
                          </span>
                        )}

                        <span>
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Notifications;