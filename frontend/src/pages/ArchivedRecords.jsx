import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Search,
  RotateCcw,
  Loader2,
  Users,
  UserRound,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "../utils/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tabs = [
  {
    key: "students",
    label: "Students",
    icon: GraduationCap,
  },
  {
    key: "parents",
    label: "Parents",
    icon: Users,
  },
  {
    key: "teachers",
    label: "Teachers",
    icon: UserRound,
  },
];

const ArchivedRecords = () => {
  const [activeTab, setActiveTab] =
    useState("students");

  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [restoringId, setRestoringId] =
    useState(null);

  // ==========================================
  // FETCH ARCHIVED RECORDS
  // ==========================================

  const fetchArchivedRecords = async () => {
    try {
      setLoading(true);

      const response = await apiRequest(
        `/${activeTab}/archived`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to fetch archived records"
        );
      }

      setRecords(
        Array.isArray(data.data)
          ? data.data
          : []
      );
    } catch (error) {
      console.error(
        "Fetch archived records error:",
        error
      );

      setRecords([]);

      toast.error(
        error.message ||
          "Unable to fetch archived records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearch("");
    fetchArchivedRecords();
  }, [activeTab]);

  // ==========================================
  // RESTORE
  // ==========================================

  const handleRestore = async (record) => {
    const confirmed = window.confirm(
      `Restore ${record.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setRestoringId(record._id);

      const response = await apiRequest(
        `/${activeTab}/${record._id}/restore`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to restore record"
        );
      }

      toast.success(
        data.message ||
          "Record restored successfully"
      );

      /*
        Remove restored record immediately
        instead of waiting for another request.
      */

      setRecords((current) =>
        current.filter(
          (item) =>
            item._id !== record._id
        )
      );
    } catch (error) {
      console.error(
        "Restore error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to restore record"
      );
    } finally {
      setRestoringId(null);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredRecords = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) {
      return records;
    }

    return records.filter((record) => {
      const searchableValues = [
        record.name,
        record.email,
        record.phone,
        record.className,
        record.section,
        record.rollNumber,
        record.subject,
        record.relation,
      ];

      return searchableValues.some(
        (item) =>
          String(item || "")
            .toLowerCase()
            .includes(value)
      );
    });
  }, [records, search]);

  // ==========================================
  // EXTRA INFORMATION
  // ==========================================

  const getDetails = (record) => {
    if (activeTab === "students") {
      const classText = [
        record.className,
        record.section,
      ]
        .filter(Boolean)
        .join(" - ");

      return classText || "—";
    }

    if (activeTab === "teachers") {
      return record.subject || "—";
    }

    if (activeTab === "parents") {
      return record.relation || "—";
    }

    return "—";
  };

  const getDetailsHeading = () => {
    if (activeTab === "students") {
      return "Class";
    }

    if (activeTab === "teachers") {
      return "Subject";
    }

    return "Relation";
  };

    return (
  <>
    <Sidebar />
    <Topbar />

    <main className="ml-64 pt-20 p-6 min-h-screen bg-gray-50">
      <div className="space-y-6">
      {/* HEADER */}

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-100 p-3">
            <Archive
              size={24}
              className="text-gray-700"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Archived Records
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and restore archived
              students, parents and teachers.
            </p>
          </div>
        </div>
      </div>

      {/* TABS */}

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            const active =
              activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setActiveTab(tab.key)
                }
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={17} />

                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH */}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={`Search archived ${activeTab}...`}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-gray-500"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-gray-500"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading archived records...
              </p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-6">
            <div className="text-center">
              <Archive
                size={42}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-3 font-semibold text-gray-700">
                No archived records
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {search
                  ? "No records match your search."
                  : `There are no archived ${activeTab}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {getDetailsHeading()}
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredRecords.map(
                  (record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {record.name ||
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.email ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {record.phone ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {getDetails(
                          record
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Archived
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={
                            restoringId ===
                            record._id
                          }
                          onClick={() =>
                            handleRestore(
                              record
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {restoringId ===
                          record._id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <RotateCcw
                              size={16}
                            />
                          )}

                          Restore
                        </button>
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

    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
    />
  </>
);
};

export default ArchivedRecords;