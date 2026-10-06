import { useEffect, useState } from "react";
import TeacherSidebar from "../components/TeacherSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
	  phone: "",
	  qualification: "",
	  experience: "",
	  address: "",
	});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
	  currentPassword: "",
	  newPassword: "",
	  confirmPassword: "",
	});	

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/teachers/profile");
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
        }
      } catch (error) {
        console.error("Teacher profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  
 const handleUpdateProfile = async () => {
  try {
    const response = await apiRequest("/teachers/profile", {
      method: "PUT",
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Profile updated successfully");

      setProfile((prev) => ({
        ...prev,
        ...data.data,
      }));

      setIsEditing(false);
    } else {
      toast.error(data.message || "Failed to update profile");
    }
  } catch (error) {
    console.error("Profile update error:", error);
    toast.error("Something went wrong");
  }
};


const handleChangePassword = async () => {
  try {
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

    const response = await apiRequest("/teachers/change-password", {
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
      <TeacherSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
	  <ToastContainer
		  position="top-right"
		  autoClose={2500}
		/>
		
		<div className="flex items-center justify-between pb-3">
		  <h1 className="text-2xl font-bold text-gray-800">
			My Profile
		  </h1>
		</div>
		
        <div className="flex items-center gap-3">
		  <button
		  onClick={() => {
			  setFormData({
				phone: profile.phone || "",
				qualification: profile.qualification || "",
				experience: profile.experience || "",
				address: profile.address || "",
			  });

			  setIsEditing(true);
			}}
		  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
		>
		  Edit Profile
		</button>
		
		<button
		  onClick={() => setShowPasswordForm(true)}
		  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg">
		  Change Password
		</button>
		</div>

        {loading ? (
          <p className="mt-4 text-gray-500">Loading profile...</p>
        ) : !profile ? (
          <p className="mt-4 text-red-500">
            Profile not found.
          </p>
        ) : (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{profile.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">
                  {profile.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">
                  {profile.gender || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Subject</p>
                <p className="font-medium">
                  {profile.subject || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Qualification</p>
                <p className="font-medium">
                  {profile.qualification || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">
                  {profile.experience || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium capitalize">
                  {profile.role}
                </p>
              </div>

            </div>
          </div>
        )}
		
		{isEditing && profile && (
		  <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">
			  Edit Profile
			</h2>

			<div className="space-y-4">
			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Phone
				</label>

				<input
				  type="text"
				  value={formData.phone}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  phone: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Qualification
				</label>

				<input
				  type="text"
				  value={formData.qualification}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  qualification: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Experience
				</label>

				<input
				  type="text"
				  value={formData.experience}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  experience: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				/>
			  </div>

			  <div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
				  Address
				</label>

				<textarea
				  value={formData.address}
				  onChange={(e) =>
					setFormData({
					  ...formData,
					  address: e.target.value,
					})
				  }
				  className="w-full border rounded-lg px-3 py-2"
				/>
			  </div>

			  <div className="flex gap-3">
				<button
				  onClick={handleUpdateProfile}
				  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
				>
				  Save Changes
				</button>

				<button
				  onClick={() => setIsEditing(false)}
				  className="px-4 py-2 border rounded-lg"
				>
				  Cancel
				</button>
			  </div>
			</div>
		  </div>
		)}
		
		{showPasswordForm && (
		  <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
			<h2 className="text-xl font-bold text-gray-800 mb-4">
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
				className="w-full border rounded-lg px-3 py-2"
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
				className="w-full border rounded-lg px-3 py-2"
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
				className="w-full border rounded-lg px-3 py-2"
			  />

			  <div className="flex gap-3">
				<button
				  onClick={handleChangePassword}
				  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
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
				  className="px-4 py-2 border rounded-lg"
				>
				  Cancel
				</button>
			  </div>
			</div>
		  </div>
		)}
      </main>
    </div>
  );
}

export default TeacherProfile;