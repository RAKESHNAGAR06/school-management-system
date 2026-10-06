import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import apiRequest from "../utils/api";

function AddStudent() {
  const navigate = useNavigate();

  const [parents, setParents] =
    useState([]);

  const [loadingParents, setLoadingParents] =
    useState(true);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      gender: "male",
      dateOfBirth: "",
      className: "",
      section: "",
      rollNumber: "",
      address: "",
      parentId: "",
    });

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const response =
          await apiRequest(
            "/parents"
          );

        const data =
          await response.json();

        if (data.success) {
          setParents(
            (data.data || []).filter(
              (parent) =>
                parent.isActive &&
                !parent.studentId
            )
          );
        }
      } catch (error) {
        console.error(
          "Parent fetch error:",
          error
        );

        setMessage(
          "Failed to load parents"
        );
      } finally {
        setLoadingParents(false);
      }
    };

    fetchParents();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  const selectedParent =
    parents.find(
      (parent) =>
        parent._id ===
        formData.parentId
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response =
        await apiRequest(
          "/students",
          {
            method: "POST",

            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        setMessage(
          "Student added successfully!"
        );

        setTimeout(() => {
          navigate(
            "/admin/students"
          );
        }, 800);
      } else {
        setMessage(
          data.message ||
            "Failed to add student"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">

        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Add New Student
        </h1>

        <p className="mb-6 text-gray-500">
          Enter student information
          and select an existing parent
        </p>

        {message && (
          <div className="mb-5 rounded-lg bg-gray-100 p-3 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-5 md:grid-cols-2"
        >

          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="male">
              Male
            </option>

            <option value="female">
              Female
            </option>

            <option value="other">
              Other
            </option>
          </select>

          <input
            type="date"
            name="dateOfBirth"
            value={
              formData.dateOfBirth
            }
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <select
            name="className"
            value={
              formData.className
            }
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">
              Select Class
            </option>

            {[
              "Nursery",
              "LKG",
              "UKG",
              "1st",
              "2nd",
              "3rd",
              "4th",
              "5th",
              "6th",
              "7th",
              "8th",
              "9th",
              "10th",
              "11th",
              "12th",
            ].map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">
              Select Section
            </option>

            {["A", "B", "C", "D"].map(
              (section) => (
                <option
                  key={section}
                  value={section}
                >
                  {section}
                </option>
              )
            )}
          </select>

          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            value={
              formData.rollNumber
            }
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          {/* Parent dropdown */}

          <div>
            <select
              name="parentId"
              value={
                formData.parentId
              }
              onChange={handleChange}
              disabled={loadingParents}
              className="w-full rounded-lg border p-3"
            >
              <option value="">
                {loadingParents
                  ? "Loading parents..."
                  : "Select Parent (Optional)"}
              </option>

              {parents.map(
                (parent) => (
                  <option
                    key={parent._id}
                    value={parent._id}
                  >
                    {parent.name} -{" "}
                    {parent.relation} -{" "}
                    {parent.phone}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Selected parent info */}

          {selectedParent && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">

              <p className="font-semibold text-gray-800">
                {
                  selectedParent.name
                }
              </p>

              <p className="text-gray-600 capitalize">
                {
                  selectedParent.relation
                }
              </p>

              <p className="text-gray-600">
                {
                  selectedParent.phone
                }
              </p>

            </div>
          )}

          <textarea
            name="address"
            placeholder="Address"
            value={
              formData.address
            }
            onChange={handleChange}
            className="rounded-lg border p-3 md:col-span-2"
            rows="3"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
          >
            {loading
              ? "Adding Student..."
              : "Add Student"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddStudent;