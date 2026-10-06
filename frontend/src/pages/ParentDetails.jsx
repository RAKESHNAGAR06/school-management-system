import { useEffect, useState } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);


  const fetchParent = async () => {
    try {
     const response = await apiRequest(`/parents/${id}`);

      const data = await response.json();

      if (data.success) {
        setParent(data.data);
      } else {
        alert(data.message || "Parent not found");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="text-center py-20 text-gray-500">
            Loading parent details...
          </div>
        </main>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Topbar />

        <main className="ml-64 pt-20 p-6">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Parent not found
            </h2>

            <button
              onClick={() => navigate("/admin/parents")}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Parents
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Parent Details
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View complete parent information
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/parents")}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>

          {/* Profile Card */}
          <div className="rounded-xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <User className="text-blue-600" size={38} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {parent.name}
                </h2>

                <p className="mt-1 text-sm capitalize text-gray-500">
                  {parent.relation}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    parent.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {parent.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Information */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Mail className="text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-400">
                      Email
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {parent.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Phone className="text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-400">
                      Phone
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {parent.phone || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-400">
                      Occupation
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {parent.occupation || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <User className="text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-400">
                      Relation
                    </p>

                    <p className="mt-1 font-medium capitalize text-gray-700">
                      {parent.relation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 md:col-span-2">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-gray-400">
                      Address
                    </p>

                    <p className="mt-1 font-medium text-gray-700">
                      {parent.address || "-"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Edit Button */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <button
                onClick={() =>
                  navigate(`/admin/parents/edit/${parent._id}`)
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Edit Parent
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default ParentDetails;