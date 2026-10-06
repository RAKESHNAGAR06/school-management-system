import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

import apiRequest from "../utils/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const emptyForm = {
  title: "",
  description: "",
  type: "event",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  targetType: "all",
  targetRoles: [],
  className: "",
  section: "",
};

function EventsHolidays() {
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const fetchEvents = async () => {
    try {
      const response =
        await apiRequest("/events");

      const data =
        await response.json();

      if (data.success) {
        setEvents(data.data || []);
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

  const fetchClasses = async () => {
    try {
      const response =
        await apiRequest("/classes");

      const data =
        await response.json();

      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error(
        "Fetch classes error:",
        error
      );
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchClasses();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const exists =
        prev.targetRoles.includes(role);

      return {
        ...prev,

        targetRoles: exists
          ? prev.targetRoles.filter(
              (item) => item !== role
            )
          : [
              ...prev.targetRoles,
              role,
            ],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert(
        "Title, start date and end date are required"
      );
      return;
    }

    if (
      new Date(formData.endDate) <
      new Date(formData.startDate)
    ) {
      alert(
        "End date cannot be before start date"
      );
      return;
    }

    if (
      formData.startDate ===
        formData.endDate &&
      formData.startTime &&
      formData.endTime &&
      formData.startTime >=
        formData.endTime
    ) {
      alert(
        "End time must be greater than start time"
      );
      return;
    }

    if (
      formData.targetType ===
        "role" &&
      formData.targetRoles.length === 0
    ) {
      alert(
        "Select at least one role"
      );
      return;
    }

    if (
      formData.targetType ===
        "class" &&
      !formData.className
    ) {
      alert("Please select a class");
      return;
    }

    try {
      const endpoint =
        editingEvent
          ? `/events/${editingEvent._id}`
          : "/events";

      const method =
        editingEvent
          ? "PUT"
          : "POST";

      const response =
        await apiRequest(endpoint, {
          method,
          body: JSON.stringify(
            formData
          ),
        });

      const data =
        await response.json();

      if (!data.success) {
        alert(
          data.message ||
            "Unable to save"
        );
        return;
      }

      await fetchEvents();
      resetForm();

      alert(
        editingEvent
          ? "Event/Holiday updated successfully"
          : "Event/Holiday added successfully"
      );
    } catch (error) {
      console.error(
        "Save event error:",
        error
      );

      alert("Something went wrong");
    }
  };

  const handleEdit = (item) => {
    setEditingEvent(item);

    setFormData({
      title: item.title || "",
      description:
        item.description || "",
      type: item.type || "event",

      startDate:
        item.startDate
          ? item.startDate.slice(
              0,
              10
            )
          : "",

      endDate:
        item.endDate
          ? item.endDate.slice(
              0,
              10
            )
          : "",

      startTime:
        item.startTime || "",

      endTime:
        item.endTime || "",

      location:
        item.location || "",

      targetType:
        item.targetType || "all",

      targetRoles:
        item.targetRoles || [],

      className:
        item.className || "",

      section:
        item.section || "",
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this event/holiday? A cancellation notification will be sent."
      );

    if (!confirmed) return;

    try {
      const response =
        await apiRequest(
          `/events/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (data.success) {
        setEvents((prev) =>
          prev.filter(
            (item) =>
              item._id !== id
          )
        );
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(
        "Delete event error:",
        error
      );

      alert("Something went wrong");
    }
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
          .includes(search) ||
        item.className
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

  const getAudience = (item) => {
    if (
      item.targetType === "all"
    ) {
      return "Whole School";
    }

    if (
      item.targetType === "role"
    ) {
      return (
        item.targetRoles
          ?.map(
            (role) =>
              role
                .charAt(0)
                .toUpperCase() +
              role.slice(1)
          )
          .join(", ") || "-"
      );
    }

    if (
      item.targetType === "class"
    ) {
      return `${item.className}${
        item.section
          ? ` - ${item.section}`
          : ""
      }`;
    }

    return "-";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={28}
                className="text-blue-600"
              />

              <h1 className="text-2xl font-bold text-gray-800">
                Events & Holidays
              </h1>
            </div>

            <p className="text-gray-500 mt-1">
              Total Announcements:{" "}
              {events.length}
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setEditingEvent(null);
                setFormData(
                  emptyForm
                );
                setShowForm(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />

            {showForm
              ? "Close Form"
              : "Add Event / Holiday"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={
              handleSubmit
            }
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {editingEvent
                ? "Edit Event / Holiday"
                : "Add Event / Holiday"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={
                  formData.title
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title:
                      e.target
                        .value,
                  })
                }
                className="border rounded-lg px-3 py-2"
              />

              <select
                value={
                  formData.type
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type:
                      e.target
                        .value,
                  })
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="event">
                  Event
                </option>

                <option value="holiday">
                  Holiday
                </option>
              </select>

              <div>
                <label className="text-sm text-gray-600">
                  Start Date
                </label>

                <input
                  type="date"
                  value={
                    formData.startDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  End Date
                </label>

                <input
                  type="date"
                  value={
                    formData.endDate
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate:
                        e.target
                          .value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
              </div>

              {formData.type ===
                "event" && (
                <>
                  <div>
                    <label className="text-sm text-gray-600">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={
                        formData.startTime
                      }
                      onChange={(
                        e
                      ) =>
                        setFormData({
                          ...formData,
                          startTime:
                            e.target
                              .value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={
                        formData.endTime
                      }
                      onChange={(
                        e
                      ) =>
                        setFormData({
                          ...formData,
                          endTime:
                            e.target
                              .value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2 mt-1"
                    />
                  </div>
                </>
              )}

              <input
                type="text"
                placeholder="Location"
                value={
                  formData.location
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location:
                      e.target
                        .value,
                  })
                }
                className="border rounded-lg px-3 py-2"
              />

              <select
                value={
                  formData.targetType
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    targetType:
                      e.target
                        .value,

                    targetRoles:
                      [],

                    className:
                      "",

                    section:
                      "",
                  })
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">
                  Whole School
                </option>

                <option value="role">
                  Selected Roles
                </option>

                <option value="class">
                  Specific Class
                </option>
              </select>

              {formData.targetType ===
                "role" && (
                <div className="md:col-span-2 border rounded-lg p-4">
                  <p className="font-medium text-gray-700 mb-3">
                    Select Roles
                  </p>

                  <div className="flex flex-wrap gap-5">
                    {[
                      "teacher",
                      "student",
                      "parent",
                    ].map(
                      (role) => (
                        <label
                          key={
                            role
                          }
                          className="flex items-center gap-2 capitalize cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.targetRoles.includes(
                              role
                            )}
                            onChange={() =>
                              handleRoleChange(
                                role
                              )
                            }
                          />

                          {role}
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}

              {formData.targetType ===
                "class" && (
                <>
                  <select
                    value={`${formData.className}|||${formData.section}`}
                    onChange={(
                      e
                    ) => {
                      const [
                        selectedClass,
                        selectedSection,
                      ] =
                        e.target.value.split(
                          "|||"
                        );

                      setFormData({
                        ...formData,

                        className:
                          selectedClass ||
                          "",

                        section:
                          selectedSection ||
                          "",
                      });
                    }}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="|||">
                      Select Class
                    </option>

                    {classes.map(
                      (item) => (
                        <option
                          key={
                            item._id
                          }
                          value={`${item.className}|||${item.section || ""}`}
                        >
                          {
                            item.className
                          }
                          {item.section
                            ? ` - ${item.section}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  <input
                    type="text"
                    value={
                      formData.section
                    }
                    readOnly
                    placeholder="Section"
                    className="border rounded-lg px-3 py-2 bg-gray-100"
                  />
                </>
              )}

              <textarea
                rows="4"
                placeholder="Description / Details"
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    description:
                      e.target
                        .value,
                  })
                }
                className="border rounded-lg px-3 py-2 md:col-span-2 resize-none"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingEvent
                  ? "Update"
                  : "Save"}
              </button>

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="border px-5 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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
                placeholder="Search events or holidays..."
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
                All Types
              </option>

              <option value="event">
                Events
              </option>

              <option value="holiday">
                Holidays
              </option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter(
                  "all"
                );
              }}
              className="border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <p className="text-gray-500">
              Loading events...
            </p>
          ) : filteredEvents.length ===
            0 ? (
            <p className="text-center text-gray-500 py-8">
              No events or holidays found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3">
                      Title
                    </th>

                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Date
                    </th>

                    <th className="px-4 py-3">
                      Location
                    </th>

                    <th className="px-4 py-3">
                      Audience
                    </th>

                    <th className="px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map(
                    (item) => (
                      <tr
                        key={
                          item._id
                        }
                        className="border-t"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {
                              item.title
                            }
                          </p>

                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                              {
                                item.description
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
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
                        </td>

                        <td className="px-4 py-3 text-sm">
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
                              ) && (
                              <>
                                {" "}
                                -{" "}
                                {formatDate(
                                  item.endDate
                                )}
                              </>
                            )}

                          {item.startTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              {
                                item.startTime
                              }
                              {item.endTime
                                ? ` - ${item.endTime}`
                                : ""}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {item.location ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {getAudience(
                            item
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Pencil
                                size={
                                  18
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  item._id
                                )
                              }
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2
                                size={
                                  18
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EventsHolidays;