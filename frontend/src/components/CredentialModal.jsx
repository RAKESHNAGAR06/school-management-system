import {
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

function CredentialModal({
  isOpen,
  onClose,
  credential,
}) {
  if (!isOpen || !credential) {
    return null;
  }

  const {
    name,
    email,
    role,
    temporaryPassword,
    credentialDelivery,
  } = credential;

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(
        temporaryPassword
      );

      toast.success(
        "Temporary password copied"
      );
    } catch (error) {
      console.error(
        "Copy password error:",
        error
      );

      toast.error(
        "Unable to copy password"
      );
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        overflow-y-auto
        bg-black/50
        px-4 py-6
      "
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="
            my-auto
            w-full max-w-lg
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          "
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Temporary Login Credentials
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                New temporary password has
                been generated.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            <div className="space-y-5">
              {/* User Information */}
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">
                      Name
                    </p>

                    <p className="font-semibold text-gray-900">
                      {name}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Role
                    </p>

                    <p className="font-semibold capitalize text-gray-900">
                      {role}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500">
                      Login Email
                    </p>

                    <p className="break-all font-semibold text-gray-900">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Temporary Password */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Temporary Password
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1 break-all rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono font-semibold text-gray-900">
                    {temporaryPassword}
                  </div>

                  <button
                    type="button"
                    onClick={copyPassword}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
                  >
                    <Copy size={18} />
                    Copy
                  </button>
                </div>
              </div>

              {/* Delivery Status */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Credential Delivery
                </p>

                {/* Email */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Mail
                      size={19}
                      className="text-gray-500"
                    />

                    <span className="text-sm font-medium">
                      Email
                    </span>
                  </div>

                  {credentialDelivery?.email
                    ?.success ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle2
                        size={17}
                      />
                      Sent
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-600">
                      Not Sent
                    </span>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle
                      size={19}
                      className="text-gray-500"
                    />

                    <span className="text-sm font-medium">
                      WhatsApp
                    </span>
                  </div>

                  {credentialDelivery
                    ?.whatsapp?.success ? (
                    <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                      <CheckCircle2
                        size={17}
                      />
                      Sent
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-red-600">
                      Not Sent
                    </span>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                The user must change this
                temporary password after the
                next login.
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end border-t bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CredentialModal;