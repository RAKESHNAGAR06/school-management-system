import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  X,
  Search,
  MailWarning,
  MessageCircleWarning,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiForm, setAiForm] =
	 useState({
	 purpose: "",
	 tone: "professional",
	 importantDetails: "",
	});

  // Failed deliveries
  const [showFailedDeliveries, setShowFailedDeliveries] =
    useState(false);

  const [failedEmails, setFailedEmails] = useState([]);
  const [failedWhatsApps, setFailedWhatsApps] = useState([]);

  const [loadingFailedEmails, setLoadingFailedEmails] =
    useState(false);

  const [
    loadingFailedWhatsApps,
    setLoadingFailedWhatsApps,
  ] = useState(false);

  const [retryingEmailId, setRetryingEmailId] =
    useState(null);

  const [retryingWhatsAppId, setRetryingWhatsAppId] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    targetType: "all",
    targetRoles: [],
    className: "",
    section: "",
    channels: {
      inApp: true,
      email: false,
      whatsapp: false,
    },
  });

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await apiRequest("/notifications");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data || []);
      } else {
        toast.error(
          data.message || "Failed to load notifications"
        );
      }
    } catch (error) {
      console.error("Notification fetch error:", error);

      toast.error("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH CLASSES
  // ==========================================

  const fetchClasses = async () => {
    try {
      const response = await apiRequest("/classes");
      const data = await response.json();

      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error("Class fetch error:", error);
    }
  };

  // ==========================================
  // FAILED EMAILS
  // ==========================================

  const fetchFailedEmails = async () => {
    try {
      setLoadingFailedEmails(true);

      const response = await apiRequest(
        "/notifications/failed-emails"
      );

      const data = await response.json();

      if (data.success) {
        setFailedEmails(
          data.data || data.deliveries || []
        );
      } else {
        toast.error(
          data.message ||
            "Failed email deliveries load nahi hui"
        );
      }
    } catch (error) {
      console.error(
        "Failed emails fetch error:",
        error
      );

      toast.error(
        "Failed email deliveries load nahi hui"
      );
    } finally {
      setLoadingFailedEmails(false);
    }
  };

  // ==========================================
  // FAILED WHATSAPP
  // ==========================================

  const fetchFailedWhatsApps = async () => {
    try {
      setLoadingFailedWhatsApps(true);

      const response = await apiRequest(
        "/notifications/failed-whatsapp"
      );

      const data = await response.json();

      if (data.success) {
        setFailedWhatsApps(
          data.deliveries || data.data || []
        );
      } else {
        toast.error(
          data.message ||
            "Failed WhatsApp deliveries load nahi hui"
        );
      }
    } catch (error) {
      console.error(
        "Failed WhatsApp fetch error:",
        error
      );

      toast.error(
        "Failed WhatsApp deliveries load nahi hui"
      );
    } finally {
      setLoadingFailedWhatsApps(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchNotifications();
    fetchClasses();
  }, []);

  // ==========================================
  // OPEN FAILED DELIVERIES
  // ==========================================

  const openFailedDeliveries = async () => {
    setShowFailedDeliveries(true);

    await Promise.all([
      fetchFailedEmails(),
      fetchFailedWhatsApps(),
    ]);
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "general",
      targetType: "all",
      targetRoles: [],
      className: "",
      section: "",
      channels: {
        inApp: true,
        email: false,
        whatsapp: false,
      },
    });
	  setShowAI(false);
	  setAiError("");

	  setAiForm({
		purpose: "",
		tone: "professional",
		importantDetails: "",
	 });
  };

  // ==========================================
  // ROLE CHANGE
  // ==========================================

  const handleRoleChange = (role) => {
    setFormData((previous) => {
      const exists =
        previous.targetRoles.includes(role);

      return {
        ...previous,

        targetRoles: exists
          ? previous.targetRoles.filter(
              (item) => item !== role
            )
          : [...previous.targetRoles, role],
      };
    });
  };
  
  // ==========================================
  // getAIAudience
  // ==========================================
  
  const getAIAudience = () => {
	  if (formData.targetType === "all") {
		return "Entire school community";
	  }

	  if (formData.targetType === "role") {
		if (
		  formData.targetRoles.length === 0
		) {
		  return "Selected school roles";
		}

		return formData.targetRoles
		  .map(
			(role) =>
			  role.charAt(0).toUpperCase() +
			  role.slice(1)
		  )
		  .join(", ");
	  }

	  if (
		formData.targetType === "class"
	  ) {
		if (!formData.className) {
		  return "Students and parents of a selected class";
		}

		return `${
		  formData.className
		}${
		  formData.section
			? ` - ${formData.section}`
			: " - All Sections"
		} students and parents`;
	  }

	  return "School community";
	};

  // ==========================================
  // handleGenerateAIDraft 
  // ==========================================
  
  const handleGenerateAIDraft =
	  async () => {
		if (!aiForm.purpose.trim()) {
		  setAiError(
			"Please enter the notification purpose."
		  );

		  return;
		}

		try {
		  setAiLoading(true);
		  setAiError("");

		  const response =
			await apiRequest(
			  "/ai/notification-draft",
			  {
				method: "POST",

				body: JSON.stringify({
				  purpose:
					aiForm.purpose,

				  type:
					formData.type,

				  tone:
					aiForm.tone,

				  audience:
					getAIAudience(),

				  importantDetails:
					aiForm.importantDetails,
				}),
			  }
			);

		  const data =
			await response.json();

		  if (!data.success) {
			setAiError(
			  data.message ||
				"Unable to generate notification draft"
			);

			return;
		  }

		  setFormData((previous) => ({
			...previous,

			title:
			  data.data.title,

			message:
			  data.data.message,
		  }));

		  setShowAI(false);

		  toast.success(
			"AI draft generated. Review it before sending."
		  );
		} catch (error) {
		  console.error(
			"AI notification draft error:",
			error
		  );

		  setAiError(
			"Unable to generate notification draft."
		  );
		} finally {
		  setAiLoading(false);
		}
	  };


  // ==========================================
  // CREATE NOTIFICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.message.trim()
    ) {
      toast.error(
        "Title and message are required"
      );

      return;
    }

    if (
      !formData.channels.inApp &&
      !formData.channels.email &&
      !formData.channels.whatsapp
    ) {
      toast.error(
        "Select at least one delivery channel"
      );

      return;
    }

    if (
      formData.targetType === "role" &&
      formData.targetRoles.length === 0
    ) {
      toast.error("Select at least one role");

      return;
    }

    if (
      formData.targetType === "class" &&
      !formData.className
    ) {
      toast.error("Please select a class");

      return;
    }

    try {
      setSaving(true);

      const response = await apiRequest(
        "/notifications",
        {
          method: "POST",

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error(
          data.message ||
            "Failed to create notification"
        );

        return;
      }

      const emailDelivery =
        data.delivery?.email;

      const whatsappDelivery =
        data.delivery?.whatsapp;

      // ======================================
      // EMAIL + WHATSAPP
      // ======================================

      if (
        formData.channels.email &&
        formData.channels.whatsapp
      ) {
        const emailSent =
          emailDelivery?.sent || 0;

        const emailFailed =
          emailDelivery?.failed || 0;

        const whatsappAccepted =
          whatsappDelivery?.sent || 0;

        const whatsappFailed =
          whatsappDelivery?.failed || 0;

        const whatsappSkipped =
          whatsappDelivery?.skipped || 0;

        if (
          emailFailed === 0 &&
          whatsappFailed === 0 &&
          (emailSent > 0 ||
            whatsappAccepted > 0)
        ) {
          toast.success(
            `Notification created. Email: ${emailSent} sent | WhatsApp: ${whatsappAccepted} accepted`
          );
        } else {
          toast.warning(
            `Notification created. Email: ${emailSent} sent, ${emailFailed} failed | WhatsApp: ${whatsappAccepted} accepted, ${whatsappFailed} failed, ${whatsappSkipped} skipped`
          );
        }
      }

      // ======================================
      // EMAIL ONLY
      // ======================================

      else if (
        formData.channels.email &&
        emailDelivery
      ) {
        if (
          emailDelivery.sent > 0 &&
          emailDelivery.failed === 0
        ) {
          toast.success(
            `Notification created. ${emailDelivery.sent} email(s) sent.`
          );
        } else if (
          emailDelivery.failed > 0
        ) {
          toast.warning(
            `Notification created. Email sent: ${emailDelivery.sent}, Failed: ${emailDelivery.failed}`
          );
        } else {
          toast.warning(
            "Notification created, but no email recipients were found."
          );
        }
      }

      // ======================================
      // WHATSAPP ONLY
      // ======================================

      else if (
        formData.channels.whatsapp &&
        whatsappDelivery
      ) {
        const accepted =
          whatsappDelivery.sent || 0;

        const failed =
          whatsappDelivery.failed || 0;

        const skipped =
          whatsappDelivery.skipped || 0;

        if (
          accepted > 0 &&
          failed === 0
        ) {
          toast.success(
            `Notification created. ${accepted} WhatsApp message(s) accepted by Meta.`
          );
        } else if (failed > 0) {
          toast.warning(
            `Notification created. WhatsApp accepted: ${accepted}, Failed: ${failed}, Skipped: ${skipped}`
          );
        } else {
          toast.warning(
            `Notification created, but no WhatsApp messages were accepted. Skipped: ${skipped}`
          );
        }
      }

      // ======================================
      // IN-APP ONLY
      // ======================================

      else {
        toast.success(
          "Notification created successfully"
        );
      }

      resetForm();

      setShowForm(false);

      await fetchNotifications();

    } catch (error) {
      console.error(
        "Create notification error:",
        error
      );

      toast.error(
        "Unable to create notification"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE NOTIFICATION
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Remove this notification?"
    );

    if (!confirmed) return;

    try {
      const response = await apiRequest(
        `/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Notification removed");

        setNotifications((previous) =>
          previous.filter(
            (item) => item._id !== id
          )
        );
      } else {
        toast.error(
          data.message ||
            "Failed to remove notification"
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      toast.error(
        "Unable to remove notification"
      );
    }
  };

  // ==========================================
  // RETRY EMAIL
  // ==========================================

  const handleRetryEmail = async (
    deliveryId
  ) => {
    try {
      setRetryingEmailId(deliveryId);

      const response = await apiRequest(
        `/notifications/failed-emails/${deliveryId}/retry`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Email successfully resent"
        );

        await fetchFailedEmails();
      } else {
        toast.error(
          data.message ||
            "Email retry failed"
        );
      }
    } catch (error) {
      console.error(
        "Retry email error:",
        error
      );

      toast.error(
        error.message ||
          "Email retry failed"
      );
    } finally {
      setRetryingEmailId(null);
    }
  };

  // ==========================================
  // RETRY WHATSAPP
  // ==========================================

  const handleRetryWhatsApp = async (
    deliveryId
  ) => {
    try {
      setRetryingWhatsAppId(deliveryId);

      const response = await apiRequest(
        `/notifications/failed-whatsapp/${deliveryId}/retry`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "WhatsApp retry accepted by Meta"
        );

        await fetchFailedWhatsApps();
      } else {
        toast.error(
          data.message ||
            "WhatsApp retry failed"
        );
      }
    } catch (error) {
      console.error(
        "WhatsApp retry error:",
        error
      );

      toast.error(
        error.message ||
          "WhatsApp retry failed"
      );
    } finally {
      setRetryingWhatsAppId(null);
    }
  };

  // ==========================================
  // CLASS OPTIONS
  // ==========================================

  const classNames = [
    ...new Set(
      classes
        .map((item) => item.className)
        .filter(Boolean)
    ),
  ];

  const sections = [
    ...new Set(
      classes
        .filter(
          (item) =>
            item.className ===
            formData.className
        )
        .map((item) => item.section)
        .filter(Boolean)
    ),
  ];

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredNotifications =
    notifications.filter((item) => {
      const keyword =
        search.toLowerCase().trim();

      return (
        item.title
          ?.toLowerCase()
          .includes(keyword) ||
        item.message
          ?.toLowerCase()
          .includes(keyword) ||
        item.type
          ?.toLowerCase()
          .includes(keyword)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-7xl">

          {/* ================= HEADER ================= */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-100 p-3">
                <Bell
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Notifications
                </h1>

                <p className="text-sm text-gray-500">
                  Create and manage school
                  notifications
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus size={18} />

                Create Notification
              </button>

              <button
                type="button"
                onClick={openFailedDeliveries}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                Failed Deliveries
              </button>

            </div>
          </div>

          {/* ================= SEARCH ================= */}

          <div className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">

            <Search
              size={19}
              className="text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notifications..."
              className="w-full outline-none"
            />

          </div>

          {/* ================= CREATE FORM ================= */}

          {showForm && (
            <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">

              <div className="mb-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

				  <h2 className="text-xl font-bold">
					Create Notification
				  </h2>

				  <button
					type="button"
					onClick={() => {
					  setShowAI(
						(previous) => !previous
					  );

					  setAiError("");
					}}
					className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
				  >
					<Sparkles size={16} />

					Draft with AI
				  </button>

				</div>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  <X size={22} />
                </button>

              </div>

              <form onSubmit={handleSubmit}>
			  
			  {showAI && (
				  <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50/40 p-5">

					<div>
					  <h3 className="flex items-center gap-2 font-semibold text-gray-800">
						<Sparkles
						  size={18}
						  className="text-purple-600"
						/>

						AI Notification Draft
					  </h3>

					  <p className="mt-1 text-sm text-gray-500">
						Describe what you want to communicate. AI will draft the title and message.
					  </p>
					</div>

					<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

					  {/* Purpose */}

					  <div className="md:col-span-2">

						<label className="mb-1 block text-sm font-medium text-gray-700">
						  Purpose / Topic
						</label>

						<input
						  type="text"
						  value={aiForm.purpose}
						  onChange={(e) =>
							setAiForm({
							  ...aiForm,

							  purpose:
								e.target.value,
							})
						  }
						  placeholder="Example: Inform parents about school closure due to heavy rain"
						  className="w-full rounded-lg border bg-white px-3 py-2.5"
						/>

					  </div>

					  {/* Tone */}

					  <div>

						<label className="mb-1 block text-sm font-medium text-gray-700">
						  Tone
						</label>

						<select
						  value={aiForm.tone}
						  onChange={(e) =>
							setAiForm({
							  ...aiForm,

							  tone:
								e.target.value,
							})
						  }
						  className="w-full rounded-lg border bg-white px-3 py-2.5"
						>
						  <option value="professional">
							Professional
						  </option>

						  <option value="formal">
							Formal
						  </option>

						  <option value="friendly">
							Friendly
						  </option>

						  <option value="urgent">
							Urgent
						  </option>

						</select>

					  </div>

					  {/* Current category */}

					  <div>

						<label className="mb-1 block text-sm font-medium text-gray-700">
						  Category
						</label>

						<div className="rounded-lg border bg-gray-100 px-3 py-2.5 capitalize text-gray-700">
						  {formData.type}
						</div>

					  </div>

					  {/* Details */}

					  <div className="md:col-span-2">

						<label className="mb-1 block text-sm font-medium text-gray-700">
						  Important Details
						</label>

						<textarea
						  rows="3"
						  value={
							aiForm.importantDetails
						  }
						  onChange={(e) =>
							setAiForm({
							  ...aiForm,

							  importantDetails:
								e.target.value,
							})
						  }
						  placeholder="Example: School closed on 21 September 2026. Classes resume on 22 September."
						  className="w-full rounded-lg border bg-white px-3 py-2.5"
						/>

						<p className="mt-1 text-xs text-gray-500">
						  Add exact dates, times, amounts or other facts here. AI will not invent missing details.
						</p>

					  </div>

					</div>

					<div className="mt-4 rounded-lg border bg-white p-3 text-sm text-gray-600">
					  <span className="font-medium">
						Audience:
					  </span>{" "}
					  {getAIAudience()}
					</div>

					{aiError && (
					  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
						{aiError}
					  </div>
					)}

					<div className="mt-4 flex flex-wrap gap-3">

					  <button
						type="button"
						onClick={
						  handleGenerateAIDraft
						}
						disabled={aiLoading}
						className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
					  >
						{aiLoading ? (
						  <>
							<RefreshCw
							  size={17}
							  className="animate-spin"
							/>

							Generating...
						  </>
						) : (
						  <>
							<Sparkles size={17} />

							Generate Draft
						  </>
						)}
					  </button>

					  <button
						type="button"
						onClick={() => {
						  setShowAI(false);
						  setAiError("");
						}}
						className="rounded-lg border bg-white px-4 py-2.5 text-sm"
					  >
						Close
					  </button>

					</div>

				  </div>
				)}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* TITLE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Title
                    </label>

                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          title:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-lg border px-4 py-2.5"
                      placeholder="Notification title"
                    />
                  </div>

                  {/* CATEGORY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category
                    </label>

                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-lg border px-4 py-2.5"
                    >
                      <option value="general">
                        General
                      </option>

                      <option value="exam">
                        Exam
                      </option>

                      <option value="result">
                        Result
                      </option>

                      <option value="homework">
                        Homework
                      </option>

                      <option value="fee">
                        Fee
                      </option>

                      <option value="attendance">
                        Attendance
                      </option>

                      <option value="timetable">
                        Timetable
                      </option>

                      <option value="event">
                        Event
                      </option>

                      <option value="holiday">
                        Holiday
                      </option>

                      <option value="emergency">
                        Emergency
                      </option>
                    </select>
                  </div>

                  {/* MESSAGE */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium">
                      Message
                    </label>

                    <textarea
                      rows="4"
                      value={
                        formData.message
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          message:
                            e.target.value,
                        })
                      }
                      className="w-full rounded-lg border px-4 py-2.5"
                      placeholder="Enter notification message..."
                    />

                  </div>

                  {/* SEND TO */}

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Send To
                    </label>

                    <select
                      value={
                        formData.targetType
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          targetType:
                            e.target.value,

                          targetRoles: [],

                          className: "",

                          section: "",
                        })
                      }
                      className="w-full rounded-lg border px-4 py-2.5"
                    >
                      <option value="all">
                        Everyone
                      </option>

                      <option value="role">
                        Selected Roles
                      </option>

                      <option value="class">
                        Class / Section
                      </option>
                    </select>
                  </div>

                  {/* CLASS */}

                  {formData.targetType ===
                    "class" && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Class
                        </label>

                        <select
                          value={
                            formData.className
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,

                              className:
                                e.target.value,

                              section: "",
                            })
                          }
                          className="w-full rounded-lg border px-4 py-2.5"
                        >
                          <option value="">
                            Select Class
                          </option>

                          {classNames.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Section
                        </label>

                        <select
                          value={
                            formData.section
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,

                              section:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-lg border px-4 py-2.5"
                        >
                          <option value="">
                            All Sections
                          </option>

                          {sections.map(
                            (section) => (
                              <option
                                key={section}
                                value={
                                  section
                                }
                              >
                                {section}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </>
                  )}

                </div>

                {/* ================= ROLES ================= */}

                {formData.targetType ===
                  "role" && (
                  <div className="mt-5">

                    <p className="mb-3 text-sm font-medium">
                      Target Roles
                    </p>

                    <div className="flex flex-wrap gap-5">

                      {[
                        "admin",
                        "teacher",
                        "student",
                        "parent",
                      ].map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 capitalize"
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
                      ))}

                    </div>
                  </div>
                )}

                {/* ================= CHANNELS ================= */}

                <div className="mt-6 rounded-lg border bg-gray-50 p-4">

                  <p className="mb-3 text-sm font-semibold">
                    Delivery Channels
                  </p>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.channels
                          .inApp
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          channels: {
                            ...formData.channels,

                            inApp:
                              e.target
                                .checked,
                          },
                        })
                      }
                    />

                    In-App Notification
                  </label>

                  <label className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.channels
                          .email
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          channels: {
                            ...formData.channels,

                            email:
                              e.target
                                .checked,
                          },
                        })
                      }
                    />

                    Email Notification
                  </label>

                  <label className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.channels
                          .whatsapp
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,

                          channels: {
                            ...formData.channels,

                            whatsapp:
                              e.target
                                .checked,
                          },
                        })
                      }
                    />

                    WhatsApp Notification
                  </label>

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Send Notification"}
                </button>

              </form>
            </div>
          )}

          {/* ================= LIST ================= */}

          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            {loading ? (
              <p className="p-8 text-center text-gray-500">
                Loading notifications...
              </p>
            ) : filteredNotifications.length ===
              0 ? (
              <p className="p-8 text-center text-gray-500">
                No notifications found
              </p>
            ) : (
              <div className="divide-y">

                {filteredNotifications.map(
                  (item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-5"
                    >

                      <div className="mt-1">
                        <Bell
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-gray-800">
                            {item.title}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs capitalize text-blue-700">
                            {item.type}
                          </span>

                          {!item.isActive && (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-600">
                              Removed
                            </span>
                          )}

                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {item.message}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">

                          <span>
                            Target:{" "}
                            {item.targetType}
                          </span>

                          {item.className && (
                            <span>
                              {
                                item.className
                              }

                              {item.section
                                ? ` - ${item.section}`
                                : " - All Sections"}
                            </span>
                          )}

                          <span>
                            {new Date(
                              item.createdAt
                            ).toLocaleString()}
                          </span>

                        </div>
                      </div>

                      {item.isActive && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item._id
                            )
                          }
                          className="h-fit rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Remove notification"
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </div>

        {/* ==========================================
            FAILED DELIVERIES MODAL
        ========================================== */}

        {showFailedDeliveries && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="max-h-[85vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">

                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Failed Deliveries
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Retry failed Email and
                    WhatsApp notifications
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowFailedDeliveries(
                      false
                    )
                  }
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={22} />
                </button>

              </div>

              <div className="space-y-8 p-5">

                {/* =================================
                    FAILED EMAILS
                ================================= */}

                <section>

                  <div className="mb-4 flex items-center gap-2">

                    <MailWarning
                      size={21}
                      className="text-red-500"
                    />

                    <h3 className="text-lg font-semibold text-gray-800">
                      Failed Emails
                    </h3>

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      {failedEmails.length}
                    </span>

                  </div>

                  {loadingFailedEmails ? (
                    <div className="rounded-lg border p-6 text-center text-gray-500">
                      Loading failed emails...
                    </div>
                  ) : failedEmails.length ===
                    0 ? (
                    <div className="rounded-lg border p-6 text-center text-gray-500">
                      No failed email
                      deliveries.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">

                      <table className="w-full text-sm">

                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left">
                              User
                            </th>

                            <th className="p-3 text-left">
                              Email
                            </th>

                            <th className="p-3 text-left">
                              Notification
                            </th>

                            <th className="p-3 text-left">
                              Attempts
                            </th>

                            <th className="p-3 text-left">
                              Error
                            </th>

                            <th className="p-3 text-left">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {failedEmails.map(
                            (delivery) => (
                              <tr
                                key={
                                  delivery._id
                                }
                                className="border-t"
                              >

                                <td className="p-3">
                                  <p className="font-medium">
                                    {delivery
                                      .userId
                                      ?.name ||
                                      "Unknown User"}
                                  </p>

                                  <p className="text-xs capitalize text-gray-400">
                                    {delivery
                                      .userId
                                      ?.role ||
                                      "-"}
                                  </p>
                                </td>

                                <td className="p-3">
                                  {delivery.recipient ||
                                    "-"}
                                </td>

                                <td className="p-3">
                                  {delivery
                                    .notificationId
                                    ?.title ||
                                    "Notification removed"}
                                </td>

                                <td className="p-3">
                                  {delivery.attempts ||
                                    0}
                                </td>

                                <td className="max-w-xs p-3">
                                  <p
                                    className="break-words text-xs text-red-600"
                                    title={
                                      delivery.error
                                    }
                                  >
                                    {delivery.error ||
                                      "Unknown error"}
                                  </p>
                                </td>

                                <td className="p-3">
                                  <button
                                    type="button"
                                    disabled={
                                      retryingEmailId ===
                                        delivery._id ||
                                      !delivery.notificationId
                                    }
                                    onClick={() =>
                                      handleRetryEmail(
                                        delivery._id
                                      )
                                    }
                                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {retryingEmailId ===
                                    delivery._id
                                      ? "Retrying..."
                                      : "Retry Email"}
                                  </button>
                                </td>

                              </tr>
                            )
                          )}
                        </tbody>

                      </table>
                    </div>
                  )}

                </section>

                {/* =================================
                    FAILED WHATSAPP
                ================================= */}

                <section>

                  <div className="mb-4 flex items-center gap-2">

                    <MessageCircleWarning
                      size={21}
                      className="text-green-600"
                    />

                    <h3 className="text-lg font-semibold text-gray-800">
                      Failed WhatsApp
                    </h3>

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      {
                        failedWhatsApps.length
                      }
                    </span>

                  </div>

                  {loadingFailedWhatsApps ? (
                    <div className="rounded-lg border p-6 text-center text-gray-500">
                      Loading failed WhatsApp
                      deliveries...
                    </div>
                  ) : failedWhatsApps.length ===
                    0 ? (
                    <div className="rounded-lg border p-6 text-center text-gray-500">
                      No failed WhatsApp
                      deliveries.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border">

                      <table className="w-full text-sm">

                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left">
                              User
                            </th>

                            <th className="p-3 text-left">
                              Phone
                            </th>

                            <th className="p-3 text-left">
                              Notification
                            </th>

                            <th className="p-3 text-left">
                              Attempts
                            </th>

                            <th className="p-3 text-left">
                              Error
                            </th>

                            <th className="p-3 text-left">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {failedWhatsApps.map(
                            (delivery) => (
                              <tr
                                key={
                                  delivery._id
                                }
                                className="border-t"
                              >

                                <td className="p-3">
                                  <p className="font-medium">
                                    {delivery
                                      .userId
                                      ?.name ||
                                      "Unknown User"}
                                  </p>

                                  <p className="text-xs capitalize text-gray-400">
                                    {delivery
                                      .userId
                                      ?.role ||
                                      "-"}
                                  </p>
                                </td>

                                <td className="p-3">
                                  {delivery.recipient ||
                                    "-"}
                                </td>

                                <td className="p-3">
                                  {delivery
                                    .notificationId
                                    ?.title ||
                                    "Notification removed"}
                                </td>

                                <td className="p-3">
                                  {delivery.attempts ||
                                    0}
                                </td>

                                <td className="max-w-xs p-3">
                                  <p
                                    className="break-words text-xs text-red-600"
                                    title={
                                      delivery.error
                                    }
                                  >
                                    {delivery.error ||
                                      "Unknown error"}
                                  </p>
                                </td>

                                <td className="p-3">
                                  <button
                                    type="button"
                                    disabled={
                                      retryingWhatsAppId ===
                                        delivery._id ||
                                      !delivery.notificationId
                                    }
                                    onClick={() =>
                                      handleRetryWhatsApp(
                                        delivery._id
                                      )
                                    }
                                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {retryingWhatsAppId ===
                                    delivery._id
                                      ? "Retrying..."
                                      : "Retry WhatsApp"}
                                  </button>
                                </td>

                              </tr>
                            )
                          )}
                        </tbody>

                      </table>
                    </div>
                  )}

                </section>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminNotifications;