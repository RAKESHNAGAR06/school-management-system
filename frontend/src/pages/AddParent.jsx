import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/api";

function AddParent() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      relation: "father",
      occupation: "",
      address: "",
      isActive: true,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response =
        await apiRequest(
          "/parents",
          {
            method: "POST",
            body: JSON.stringify(
              formData
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add parent"
        );
      }

      alert(
        "Parent added successfully! Now you can select this parent while adding a student."
      );

      navigate("/admin/parents");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add Parent
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create parent first.
              Parent can then be assigned
              from the Student form.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/parents"
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>

        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Parent Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email *
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Relation
              </label>

              <select
                name="relation"
                value={
                  formData.relation
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5"
              >
                <option value="father">
                  Father
                </option>

                <option value="mother">
                  Mother
                </option>

                <option value="guardian">
                  Guardian
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Occupation
              </label>

              <input
                type="text"
                name="occupation"
                value={
                  formData.occupation
                }
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="isActive"
                value={String(
                  formData.isActive
                )}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    isActive:
                      e.target.value ===
                      "true",
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5"
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Address
              </label>

              <textarea
                name="address"
                value={
                  formData.address
                }
                onChange={handleChange}
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5"
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/parents"
                )
              }
              className="rounded-lg border px-5 py-2.5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Adding..."
                : "Add Parent"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddParent;