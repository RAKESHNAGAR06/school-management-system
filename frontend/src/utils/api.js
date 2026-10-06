const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const apiRequest = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem("token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...options.headers,
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

    // ========================================
    // INVALID / EXPIRED SESSION
    // ========================================

    if (response.status === 401) {
      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      if (
        window.location.pathname !==
        "/login"
      ) {
        window.location.replace(
          "/login"
        );
      }

      throw new Error(
        "Session expired. Please login again."
      );
    }

    /*
      IMPORTANT:

      403 ko yahan redirect nahi karna.

      403 may mean:
      - PASSWORD_CHANGE_REQUIRED
      - inactive account
      - role permission denied

      Individual page / ProtectedRoute
      correct behavior handle karega.
    */

    return response;
  } catch (error) {
    if (
      error.message ===
      "Session expired. Please login again."
    ) {
      throw error;
    }

    console.error(
      "API request error:",
      error
    );

    throw new Error(
      "Unable to connect to server"
    );
  }
};

export default apiRequest;