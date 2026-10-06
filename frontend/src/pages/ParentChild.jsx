import { useEffect, useState } from "react";
import ParentSidebar from "../components/ParentSidebar";
import Topbar from "../components/Topbar";
import apiRequest from "../utils/api";

function ParentChild() {
	const [child, setChild] = useState(null);
    const [loading, setLoading] = useState(true);
	
	useEffect(() => {
	  const fetchChild = async () => {
		try {
		  const response = await apiRequest("/parents/my-child");
		  const data = await response.json();

		  if (data.success) {
			setChild(data.data);
		  }
		} catch (error) {
		  console.error("Parent child error:", error);
		} finally {
		  setLoading(false);
		}
	  };

	  fetchChild();
	}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <ParentSidebar />
      <Topbar />

      <main className="ml-64 pt-20 p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Child
        </h1>

        <p className="mt-2 text-gray-500">
          View your child&apos;s personal and academic details here.
        </p>
		
		{loading ? (
		  <p className="mt-6 text-gray-500">Loading child details...</p>
		) : child ? (
		  <div className="mt-6 bg-white rounded-xl border shadow-sm p-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
			  <div>
				<p className="text-sm text-gray-500">Name</p>
				<p className="font-semibold text-gray-800">
				  {child.name || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Email</p>
				<p className="font-semibold text-gray-800">
				  {child.email || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Phone</p>
				<p className="font-semibold text-gray-800">
				  {child.phone || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Gender</p>
				<p className="font-semibold text-gray-800 capitalize">
				  {child.gender || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Class</p>
				<p className="font-semibold text-gray-800">
				  {child.className || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Section</p>
				<p className="font-semibold text-gray-800">
				  {child.section || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Roll Number</p>
				<p className="font-semibold text-gray-800">
				  {child.rollNumber || "-"}
				</p>
			  </div>

			  <div>
				<p className="text-sm text-gray-500">Date of Birth</p>
				<p className="font-semibold text-gray-800">
				  {child.dateOfBirth
					? new Date(child.dateOfBirth).toLocaleDateString()
					: "-"}
				</p>
			  </div>
			</div>

			<div className="mt-5">
			  <p className="text-sm text-gray-500">Address</p>
			  <p className="font-semibold text-gray-800">
				{child.address || "-"}
			  </p>
			</div>
		  </div>
		) : (
		  <p className="mt-6 text-red-500">
			Unable to load child details.
		  </p>
		)}
      </main>
    </div>
  );
}

export default ParentChild;