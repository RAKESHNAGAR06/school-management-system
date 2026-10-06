import {
  Navigate,
  useLocation,
} from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const location = useLocation();

  const token =
    localStorage.getItem("token");

  let user = null;

  try {
    const storedUser =
      localStorage.getItem("user");

    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "Invalid stored user:",
      error
    );

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ==========================================
  // FORCE PASSWORD CHANGE
  // ==========================================

  if (
    user.mustChangePassword === true &&
    location.pathname !==
      "/change-password"
  ) {
    return (
      <Navigate
        to="/change-password"
        replace
      />
    );
  }

  // ==========================================
  // PREVENT RETURNING TO CHANGE PASSWORD
  // ==========================================

  if (
    user.mustChangePassword !== true &&
    location.pathname ===
      "/change-password"
  ) {
    const roleRoutes = {
      admin: "/admin/dashboard",
      teacher: "/teacher/dashboard",
      student: "/student/dashboard",
      parent: "/parent/dashboard",
    };

    return (
      <Navigate
        to={
          roleRoutes[user.role] ||
          "/unauthorized"
        }
        replace
      />
    );
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;