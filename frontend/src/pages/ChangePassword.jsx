import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";

import apiRequest from "../utils/api";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error(
        "Please fill all password fields"
      );
      return;
    }

    // ========================================
    // PASSWORD SECURITY VALIDATION
    // ========================================

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (
      !passwordPattern.test(
        formData.newPassword
      )
    ) {
      toast.error(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
      );
      return;
    }

    // ========================================
    // CONFIRM PASSWORD
    // ========================================

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      toast.error(
        "New password and confirm password do not match"
      );
      return;
    }

    // ========================================
    // PREVENT SAME PASSWORD
    // Frontend check is not possible securely
    // because current password is hashed on server.
    // Backend handles this validation.
    // ========================================

    try {
      setSaving(true);

      const response =
        await apiRequest(
          "/auth/change-password",
          {
            method: "PUT",

            body: JSON.stringify({
              currentPassword:
                formData.currentPassword,

              newPassword:
                formData.newPassword,

              confirmPassword:
                formData.confirmPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password"
        );
      }

      // ========================================
      // PASSWORD CHANGED SUCCESSFULLY
      // ========================================
      /*
        Backend increments tokenVersion after
        password change.

        Therefore the current JWT is now
        intentionally invalid.

        Clear old authentication data and force
        a fresh login.
      */

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      toast.success(
        "Password changed successfully. Please login with your new password."
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to change password"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-lg">
        {/* Header */}

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <KeyRound className="h-7 w-7 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Change Your Password
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            You are using a temporary
            password. Create a new password
            before continuing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* CURRENT PASSWORD */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Temporary Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  formData.currentPassword
                }
                onChange={handleChange}
                placeholder="Enter temporary password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label={
                  showCurrent
                    ? "Hide temporary password"
                    : "Show temporary password"
                }
              >
                {showCurrent ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={
                  formData.newPassword
                }
                onChange={handleChange}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label={
                  showNew
                    ? "Hide new password"
                    : "Show new password"
                }
              >
                {showNew ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            <p className="mt-1.5 text-xs leading-5 text-gray-500">
              Minimum 8 characters with
              uppercase, lowercase, number
              and special character.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Enter new password again"
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Changing Password..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;