import { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function StudentProfile() {
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
			  const response = await apiRequest("/students/profile");
			  const data = await response.json();

			  if (data.success) {
				setProfile(data.data);
			  }
			} catch (error) {
			  console.error("Student profile error:", error);
			} finally {
			  setLoading(false);
			}
		  };

		  fetchProfile();
		}, []);
		
		
	const handleChangePassword = async () => {
	  if (
		!passwordData.currentPassword ||
		!passwordData.newPassword ||
		!passwordData.confirmPassword
	  ) {
		toast.error("Please fill all password fields");
		return;
	  }

	  if (passwordData.newPassword !== passwordData.confirmPassword) {
		toast.error("New password and confirm password do not match");
		return;
	  }

	  try {
		const response = await apiRequest("/students/change-password", {
		  method: "PUT",
		  body: JSON.stringify(passwordData),
		});

		const data = await response.json();

		if (data.success) {
		  toast.success("Password changed successfully");

		  setShowPasswordForm(false);

		  setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		  });
		} else {
		  toast.error(data.message || "Failed to change password");
		}
	  } catch (error) {
		console.error("Change password error:", error);
		toast.error("Something went wrong");
	  }
	};	
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
	  <ToastContainer position="top-right" autoClose={2500} />
        <h1 className="text-2xl font-bold text-gray-800">
          My Profile
        </h1>

        <p className="mt-2 text-gray-500">
          View your personal and academic details here.
        </p>
		
		<button
		  onClick={() => setShowPasswordForm(true)}
		  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
		  Change Password
		</button>
		
		
		{loading ? (
		  <p className="mt-6 text-gray-500">Loading profile...</p>
		) : profile ? (
		  <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
			  <div>
				<p className="text-sm text-gray-500">Name</p>
				<p className="font-semibold text-gray-800">
				  {profile.name || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Email</p>
				<p className="font-semibold text-gray-800">
				  {profile.email || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Phone</p>
				<p className="font-semibold text-gray-800">
				  {profile.phone || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Gender</p>
				<p className="font-semibold text-gray-800 capitalize">
				  {profile.gender || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Class</p>
				<p className="font-semibold text-gray-800">
				  {profile.className || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Section</p>
				<p className="font-semibold text-gray-800">
				  {profile.section || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Roll Number</p>
				<p className="font-semibold text-gray-800">
				  {profile.rollNumber || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Parent Name</p>
				<p className="font-semibold text-gray-800">
				  {profile.parentName || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Parent Phone</p>
				<p className="font-semibold text-gray-800">
				  {profile.parentPhone || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Role</p>
				<p className="font-semibold text-gray-800 capitalize">
				  {profile.role || "-"}
				</p>
			  </div>
			</div>

			<div className="mt-5">
			  <p className="text-sm text-gray-500">Address</p>
			  <p className="font-semibold text-gray-800">
				{profile.address || "-"}
			  </p>
			</div>
		  </div>
		) : (
		  <p className="mt-6 text-red-500">
			Unable to load profile.
		  </p>
		)}
		

		
		{showPasswordForm && (
		  <div className="mt-6 bg-white border rounded-xl p-6 shadow-sm">
			<h2 className="text-lg font-bold text-gray-800 mb-4">
			  Change Password
			</h2>

			<div className="space-y-4">
			  <input
				type="password"
				placeholder="Current Password"
				value={passwordData.currentPassword}
				onChange={(e) =>
				  setPasswordData({
					...passwordData,
					currentPassword: e.target.value,
				  })
				}
				className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			  />

			  <input
				type="password"
				placeholder="New Password"
				value={passwordData.newPassword}
				onChange={(e) =>
				  setPasswordData({
					...passwordData,
					newPassword: e.target.value,
				  })
				}
				className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			  />

			  <input
				type="password"
				placeholder="Confirm New Password"
				value={passwordData.confirmPassword}
				onChange={(e) =>
				  setPasswordData({
					...passwordData,
					confirmPassword: e.target.value,
				  })
				}
				className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
			  />
			</div>

			<div className="mt-5 flex gap-3">
			  <button
				onClick={handleChangePassword}
				className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
			  >
				Update Password
			  </button>

			  <button
				onClick={() => {
				  setShowPasswordForm(false);
				  setPasswordData({
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				  });
				}}
				className="border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
				Cancel
			  </button>
			</div>
		  </div>
		)}
      </main>
    </div>
  );
}

export default StudentProfile;