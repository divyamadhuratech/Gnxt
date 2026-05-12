export const createdByOptions = ["Admin", "Manager", "Operator"];

export const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "In Transit": {
    label: "In Transit",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function getPODConfig(status) {
  switch (status) {
    case "Delivered":
      return {
        label: "Signed",
        icon: true,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "In Transit":
      return {
        label: "Pending",
        icon: false,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "Pending":
      return {
        label: "Not Generated",
        icon: false,
        className: "bg-gray-50 text-gray-500 border-gray-200",
      };
    default:
      return {
        label: "N/A",
        icon: false,
        className: "bg-gray-50 text-gray-400 border-gray-200",
      };
  }
}

export function isWithinDateRange(date, filter) {
  if (!date) return false;
  const shipmentDate = new Date(date);
  const now = new Date();

  switch (filter) {
    case "today":
      return shipmentDate.toDateString() === now.toDateString();
    case "week": {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return shipmentDate >= weekAgo;
    }
    case "month":
      return (
        shipmentDate.getMonth() === now.getMonth() &&
        shipmentDate.getFullYear() === now.getFullYear()
      );
    default:
      return true;
  }
}