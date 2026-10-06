import {
  useEffect,
  useState,
} from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import apiRequest from "../utils/api";

function EditStudent() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [parents, setParents] =
    useState([]);

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
	  isActive: true,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          studentResponse,
          parentResponse,
        ] = await Promise.all([
          apiRequest("/students"),
          apiRequest("/parents"),
        ]);

        const studentData =
          await studentResponse.json();

        const parentData =
          await parentResponse.json();

        if (!studentData.success) {
          setMessage(
            "Failed to load student"
          );

          return;
        }

        const student =
          studentData.data.find(
            (item) =>
              item._id === id
          );

        if (!student) {
          setMessage(
            "Student not found"
          );

          return;
        }

        const currentParentId =
          student.parentId?._id ||
          student.parentId ||
          "";

        if (parentData.success) {
          const availableParents =
            (
              parentData.data || []
            ).filter((parent) => {
              if (!parent.isActive) {
                return false;
              }

              const linkedStudentId =
                parent.studentId?._id ||
                parent.studentId;

              return (
                !linkedStudentId ||
                linkedStudentId === id
              );
            });

          setParents(
            availableParents
          );
        }

        setFormData({
          name:
            student.name || "",

          email:
            student.email || "",

          phone:
            student.phone || "",

          gender:
            student.gender ||
            "male",

          dateOfBirth:
            student.dateOfBirth
              ? student.dateOfBirth.substring(
                  0,
                  10
                )
              : "",

          className:
            student.className || "",

          section:
            student.section || "",

          rollNumber:
            student.rollNumber || "",

          address:
            student.address || "",

          parentId:
            currentParentId,
			
		  isActive:
            student.isActive !== false,
        });
      } catch (error) {
        console.error(error);

        setMessage(
          "Failed to load student"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
  const {
    name,
    value,
    type,
    checked,
  } = e.target;

  setFormData((prev) => ({
    ...prev,

    [name]:
      type === "checkbox"
        ? checked
        : value,
  }));
};

  const selectedParent =
    parents.find(
      (parent) =>
        parent._id ===
        formData.parentId
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response =
        await apiRequest(
          `/students/${id}`,
          {
            method: "PUT",

            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        await response.json();

      if (data.success) {
        setMessage(
          "Student updated successfully!"
        );

        setTimeout(() => {
          navigate(
            "/admin/students"
          );
        }, 800);
      } else {
        setMessage(
          data.message ||
            "Failed to update student"
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="rounded-xl bg-white p-6">
          Loading student...
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-100">
    <Sidebar />
    <Topbar />

    <main className="ml-64 pt-20">
      <div className="p-6">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">

        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          Edit Student
        </h1>

        <p className="mb-6 text-gray-500">
          Update student information
          and linked parent
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
            className="rounded-lg border p-3"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-lg border p-3"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="rounded-lg border p-3"
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

          <select
            name="parentId"
            value={
              formData.parentId
            }
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">
              No Parent Assigned
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

          {selectedParent && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm">

              <p className="font-semibold">
                {
                  selectedParent.name
                }
              </p>

              <p className="capitalize text-gray-600">
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
            rows="3"
            className="rounded-lg border p-3 md:col-span-2"
          />
		  
		  <div className="flex items-center gap-3 rounded-lg border bg-gray-50 p-4 md:col-span-2">
		  <input
			type="checkbox"
			id="isActive"
			name="isActive"
			checked={formData.isActive}
			onChange={handleChange}
			className="h-5 w-5 cursor-pointer"
		  />

		  <div>
			<label
			  htmlFor="isActive"
			  className="cursor-pointer font-semibold text-gray-800"
			>
			  Active Student
			</label>

			<p className="text-sm text-gray-500">
			  Uncheck this to deactivate
			  the student and disable login.
			</p>
		  </div>
		</div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-2"
          >
            {saving
              ? "Updating..."
              : "Update Student"}
          </button>

        </form>
      </div>
    </div>
	 </main>
  </div>
  );
}

export default EditStudent;