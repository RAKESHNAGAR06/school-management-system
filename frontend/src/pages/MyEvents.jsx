import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar";
import StudentSidebar from "../components/StudentSidebar";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";

import apiRequest from "../utils/api";

function MyEvents() {
	const user = JSON.parse(
		  localStorage.getItem("user") || "{}"
		);

		const renderSidebar = () => {
		  if (user.role === "teacher") {
			return <TeacherSidebar />;
		  }

		  if (user.role === "student") {
			return <StudentSidebar />;
		  }

		  if (user.role === "parent") {
			return <ParentSidebar />;
		  }

		  return null;
		};
	
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response =
          await apiRequest(
            "/events/my-events"
          );

        const data =
          await response.json();

        if (data.success) {
          setEvents(
            data.data || []
          );
        }
      } catch (error) {
        console.error(
          "Fetch events error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const filteredEvents =
    events.filter((item) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        item.title
          ?.toLowerCase()
          .includes(search) ||
        item.description
          ?.toLowerCase()
          .includes(search) ||
        item.location
          ?.toLowerCase()
          .includes(search);

      const matchesType =
        typeFilter === "all" ||
        item.type === typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });

  return (
    <div className="min-h-screen bg-gray-100">
	  {renderSidebar()}
	  <Topbar />

	  <main className="ml-64 pt-20 p-6">
		<div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays
              className="text-blue-600"
            />

            <h1 className="text-2xl font-bold text-gray-800">
              Events & Holidays
            </h1>
          </div>

          <p className="text-gray-500 mt-1">
            School events, holidays and announcements
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search..."
                className="w-full border rounded-lg pl-10 pr-3 py-2"
              />
            </div>

            <select
              value={
                typeFilter
              }
              onChange={(e) =>
                setTypeFilter(
                  e.target.value
                )
              }
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">
                All
              </option>

              <option value="event">
                Events
              </option>

              <option value="holiday">
                Holidays
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-6">
            <p className="text-gray-500">
              Loading...
            </p>
          </div>
        ) : filteredEvents.length ===
          0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-500">
            No events or holidays found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEvents.map(
              (item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.title}
                      </h2>

                      <span
                        className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.type ===
                          "holiday"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {item.type ===
                        "holiday"
                          ? "Holiday"
                          : "Event"}
                      </span>
                    </div>

                    <CalendarDays
                      className={
                        item.type ===
                        "holiday"
                          ? "text-orange-500"
                          : "text-blue-500"
                      }
                    />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <CalendarDays
                        size={17}
                      />

                      <span>
                        {formatDate(
                          item.startDate
                        )}

                        {item.endDate &&
                          item.endDate.slice(
                            0,
                            10
                          ) !==
                            item.startDate.slice(
                              0,
                              10
                            ) &&
                          ` - ${formatDate(
                            item.endDate
                          )}`}
                      </span>
                    </div>

                    {item.startTime && (
                      <div className="flex gap-2">
                        <Clock
                          size={17}
                        />

                        <span>
                          {
                            item.startTime
                          }

                          {item.endTime
                            ? ` - ${item.endTime}`
                            : ""}
                        </span>
                      </div>
                    )}

                    {item.location && (
                      <div className="flex gap-2">
                        <MapPin
                          size={17}
                        />

                        <span>
                          {
                            item.location
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  {item.description && (
                    <p className="mt-4 pt-4 border-t text-sm text-gray-600 whitespace-pre-line">
                      {
                        item.description
                      }
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
	  </main>
    </div>
  );
}

export default MyEvents;