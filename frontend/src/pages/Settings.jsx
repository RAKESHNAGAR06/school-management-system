import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { School, Save, User } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "../utils/api";
import { getFileUrl } from "../utils/api";

function Settings() {
  const [formData, setFormData] = useState({
	  schoolName: "",
	  address: "",
	  phone: "",
	  email: "",
	  website: "",
	  principalName: "",
	  academicSession: "",
	  schoolCode: "",
	  affiliationNumber: "",
	});
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest("/settings");

        const data = await response.json();

        if (data.success) {
          setFormData({
			  schoolName: data.data.schoolName || "",
			  address: data.data.address || "",
			  phone: data.data.phone || "",
			  email: data.data.email || "",
			  website: data.data.website || "",
			  principalName: data.data.principalName || "",
			  academicSession: data.data.academicSession || "",
			  schoolCode: data.data.schoolCode || "",
			  affiliationNumber: data.data.affiliationNumber || "",
			});
          if (data.data.logo) {
            setLogoPreview(getFileUrl(data.data.logo));
          }
        }

		const adminResponse = await apiRequest(
  "/settings/admin-profile"
);
        const adminResult = await adminResponse.json();

        if (adminResult.success) {
          setAdminData({
            name: adminResult.data.name || "",
            email: adminResult.data.email || "",
            phone: adminResult.data.phone || "",
          });
        }
      } catch (error) {
        console.error("Settings fetch error:", error);
        toast.error("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
     const response = await apiRequest(
  "/settings/change-password",
  {
    method: "PUT",
    body: JSON.stringify(passwordData),
  }
);

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Password changed successfully");

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Unable to connect to server");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a logo first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await apiRequest(
  "/settings/logo",
  {
    method: "POST",
    body: formData,
  }
);

      const data = await response.json();

      if (data.success) {
        setLogoPreview(getFileUrl(data.data.logo));
        setLogoFile(null);
        toast.success(data.message || "School logo uploaded successfully");
      } else {
        toast.error(data.message || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Unable to connect to server");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
    const checkResponse = await apiRequest("/settings");
      const checkData = await checkResponse.json();

      let response;

      if (checkData.success) {
        response = await apiRequest("/settings", {
  method: "PUT",
  body: JSON.stringify(formData),
});
      } else {
        response = await apiRequest("/settings", {
  method: "POST",
  body: JSON.stringify(formData),
});
      }

      const data = await response.json();

      if (data.success) {
        setFormData({
		  schoolName: data.data.schoolName || "",
		  address: data.data.address || "",
		  phone: data.data.phone || "",
		  email: data.data.email || "",
		  website: data.data.website || "",
		  principalName: data.data.principalName || "",
		  academicSession: data.data.academicSession || "",
		  schoolCode: data.data.schoolCode || "",
		  affiliationNumber: data.data.affiliationNumber || "",
		});

        toast.success(
          data.message || "School settings saved successfully"
        );
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      toast.error("Unable to connect to server");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    try {
     const response = await apiRequest(
  "/settings/admin-profile",
  {
    method: "PUT",
    body: JSON.stringify(adminData),
  }
);

      const data = await response.json();

      if (data.success) {
        setAdminData({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
        });

        toast.success(data.message || "Admin profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update admin profile");
      }
    } catch (error) {
      console.error("Admin profile update error:", error);
      toast.error("Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <School className="text-blue-600" size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Settings
              </h1>

              <p className="text-sm text-gray-500">
                Manage your school information and settings
              </p>
            </div>
          </div>

          {/* School Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-bold text-gray-800">
              School Information
            </h2>
            <div className="mb-6 rounded-lg border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                School Logo
              </h3>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="School Logo"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-gray-50 text-xs text-gray-400">
                    No Logo
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="block text-sm text-gray-600"
                  />

                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    className="w-fit rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Upload Logo
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500">
                Loading settings...
              </p>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* School Name */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      School Name
                    </label>

                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Enter school name"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Enter school address"
                    ></textarea>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                      placeholder="Enter school email"
                    />
                  </div>

                  {/* Website */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Website
                    </label>

                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
				  
				  {/* Principal Name */}
					<div>
					  <label className="mb-2 block text-sm font-medium text-gray-700">
						Principal Name
					  </label>

					  <input
						type="text"
						name="principalName"
						value={formData.principalName}
						onChange={handleChange}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
						placeholder="Enter principal name"
					  />
					</div>

					{/* Academic Session */}
					<div>
					  <label className="mb-2 block text-sm font-medium text-gray-700">
						Academic Session
					  </label>

					  <input
						type="text"
						name="academicSession"
						value={formData.academicSession}
						onChange={handleChange}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
						placeholder="2026-27"
					  />
					</div>

					{/* School Code */}
					<div>
					  <label className="mb-2 block text-sm font-medium text-gray-700">
						School Code
					  </label>

					  <input
						type="text"
						name="schoolCode"
						value={formData.schoolCode}
						onChange={handleChange}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
						placeholder="Enter school code"
					  />
					</div>

					{/* Affiliation Number */}
					<div>
					  <label className="mb-2 block text-sm font-medium text-gray-700">
						Affiliation Number
					  </label>

					  <input
						type="text"
						name="affiliationNumber"
						value={formData.affiliationNumber}
						onChange={handleChange}
						className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
						placeholder="Enter affiliation number"
					  />
					</div>

                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={18} />

                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3">
              <User className="text-purple-600" size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Admin Profile
              </h2>
              <p className="text-sm text-gray-500">
                Manage administrator account information
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={adminData.name}
                  onChange={handleAdminChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  placeholder="Enter admin name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={adminData.email}
                  onChange={handleAdminChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={adminData.phone}
                  onChange={handleAdminChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Save size={18} />
              Update Profile
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-800">
            Change Password
          </h2>

          <p className="mb-6 text-sm text-gray-500">
            Update your administrator account password
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Current Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  minLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  minLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-black"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Save size={18} />
              Change Password
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}

export default Settings;