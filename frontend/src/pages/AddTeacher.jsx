import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";
import apiRequest from "../utils/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AddTeacher() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
  gender: "male",
  subject: "",
  qualification: "",
  experience: "",
  address: "",
  joiningDate: "",
  password: "",
});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiRequest("/teachers", {
  method: "POST",
  body: JSON.stringify(formData),
});

      const data = await response.json();

      if (data.success) {
        alert("Teacher added successfully!");
        navigate("/admin/teachers");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add Teacher
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new teacher to your school
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/teachers")}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <UserPlus className="text-blue-600" size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-800">
                Teacher Information
              </h2>
              <p className="text-sm text-gray-500">
                Enter teacher details below
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter teacher name"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="teacher@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
			{/* password */}
			<div>
			  <label className="block text-sm font-medium text-gray-700 mb-1">
				Login Password
			  </label>

			  <input
				type="password"
				name="password"
				value={formData.password}
				onChange={handleChange}
				placeholder="Enter teacher login password"
				required
				className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
			  />
			</div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. M.Sc, B.Ed"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Experience
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 5 Years"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter teacher address"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-5">
            <button
              type="button"
              onClick={() => navigate("/admin/teachers")}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Teacher
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AddTeacher;