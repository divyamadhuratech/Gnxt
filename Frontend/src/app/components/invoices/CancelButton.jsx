import { useState } from "react";
import { Loader2, Ban } from "lucide-react";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export function CancelButton({ plantNumber, currentStatus, onStatusUpdated }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (currentStatus === "Cancelled") return;

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel the invoices under Plant No. ${plantNumber}?`
    );

    if (!confirmCancel) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/invoices/${plantNumber}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Cancelled" }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Cancellation failed");
      }

      if (onStatusUpdated) {
        onStatusUpdated(plantNumber, "Cancelled");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === "Cancelled") {
    return (
      <span className="text-slate-300 cursor-not-allowed" title="Already Cancelled">
        <Ban className="w-4 h-4 opacity-50" />
      </span>
    );
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-amber-500 hover:text-red-600 transition-colors"
      title="Cancel Invoice Group"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Ban className="w-4 h-4" />
      )}
    </button>
  );
}

export default CancelButton;
