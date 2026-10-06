import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentProfile() {
	const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
	const [showPasswordForm, setShowPasswordForm] = useState(false);

	const [passwordData, setPasswordData] = useState({
	  currentPassword: "",
	  newPassword: "",
	  confirmPassword: "",
	});
		
	useEffect(() => {
		  const fetchProfile = async () => {
			try {
			  const response = await apiRequest("/parents/profile");
			  const data = await response.json();

			  if (data.success) {
				setProfile(data.data);
			  }
			} catch (error) {
			  console.error("Parent profile error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchProfile();
		}, []);
		
		const handlePasswordChange = async (e) => {
			  e.preventDefault();

			  try {
				const response = await apiRequest("/parents/change-password", {
				  method: "PUT",
				  body: JSON.stringify(passwordData),
				});

				const data = await response.json();

				if (data.success) {
				  alert(data.message);

				  setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				  });

				  setShowPasswordForm(false);
				} else {
				  alert(data.message);
				}
			  } catch (error) {
				console.error("Change password error:", error);
				alert("Something went wrong");
			  }
			};


  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="mt-2 text-gray-500">
          View your personal and account details here.
        </p>
		
		<button
			onClick={() => setShowPasswordForm(!showPasswordForm)}
			className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
		  >
			Change Password
		  </button>
		
		{loading ? (
		  <p className="text-gray-500">Loading profile...</p>
		) : !profile ? (
		  <p className="text-red-500">Profile not found.</p>
		) : (
		  <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			  <div>
				<p className="text-sm text-gray-500">Name</p>
				<p className="font-medium text-gray-800">{profile.name || "-"}</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Email</p>
				<p className="font-medium text-gray-800">{profile.email || "-"}</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Phone</p>
				<p className="font-medium text-gray-800">{profile.phone || "-"}</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Relation</p>
				<p className="font-medium text-gray-800 capitalize">
				  {profile.relation || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Occupation</p>
				<p className="font-medium text-gray-800">
				  {profile.occupation || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Child Name</p>
				<p className="font-medium text-gray-800">
				  {profile.childName || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Role</p>
				<p className="font-medium text-gray-800 capitalize">
				  {profile.role || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Status</p>
				<p
				  className={`font-medium ${
					profile.isActive ? "text-green-600" : "text-red-600"
				  }`}
				>
				  {profile.isActive ? "Active" : "Inactive"}
				</p>
			  </div>

			  <div className="md:col-span-2">
				<p className="text-sm text-gray-500">Address</p>
				<p className="font-medium text-gray-800">
				  {profile.address || "-"}
				</p>
			  </div>
			</div>
		  </div>
		)}
		
		  

		  {showPasswordForm && (
		<div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
			<form onSubmit={handlePasswordChange} className="mt-5 space-y-4 max-w-md">
			  <div>
				<label className="block text-sm text-gray-600 mb-1">
				  Current Password
				</label>

				<input
				  type="password"
				  value={passwordData.currentPassword}
				  onChange={(e) =>
					setPasswordData({
					  ...passwordData,
					  currentPassword: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				  required
				/>
			  </div>

			  <div>
				<label className="block text-sm text-gray-600 mb-1">
				  New Password
				</label>

				<input
				  type="password"
				  value={passwordData.newPassword}
				  onChange={(e) =>
					setPasswordData({
					  ...passwordData,
					  newPassword: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				  required
				/>
			  </div>

			  <div>
				<label className="block text-sm text-gray-600 mb-1">
				  Confirm Password
				</label>

				<input
				  type="password"
				  value={passwordData.confirmPassword}
				  onChange={(e) =>
					setPasswordData({
					  ...passwordData,
					  confirmPassword: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				  required
				/>
			  </div>

			  <div className="flex gap-3">
				<button
				  type="submit"
				  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
				>
				  Update Password
				</button>

				<button
				  type="button"
				  onClick={() => {
					setShowPasswordForm(false);

					setPasswordData({
					  currentPassword: "",
					  newPassword: "",
					  confirmPassword: "",
					});
				  }}
				  className="border px-4 py-2 rounded-lg"
				>
				  Cancel
				</button>
			  </div>
			</form>
			</div>
		  )}
      </main>
    </div>
  );
}

export default ParentProfile;