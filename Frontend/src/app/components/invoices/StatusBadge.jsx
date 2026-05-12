import { STATUS_STYLES } from "./utils/invoiceStyles";

export function StatusBadge({ status }) {
  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </div>
  );
}

export default StatusBadge;