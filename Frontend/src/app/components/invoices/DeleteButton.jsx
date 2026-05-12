import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api";


export function DeleteButton({ invoiceId, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      onDeleted(invoiceId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

export default DeleteButton;