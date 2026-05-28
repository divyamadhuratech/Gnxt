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

export function getPODConfig(status, podStatus) {
  // podStatus here is the computed aggregate across all destinations
  if (podStatus === "Submitted") {
    return {
      label: "Signed",
      icon: true,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }
  if (podStatus === "Partial") {
    return {
      label: "Partial",
      icon: false,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }
  if (podStatus === "Pending" || status === "In Transit") {
    return {
      label: "Pending",
      icon: false,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    label: "Not Generated",
    icon: false,
    className: "bg-gray-50 text-gray-500 border-gray-200",
  };
}

/**
 * Compute aggregate POD status across all destinations of a shipment.
 * - "Submitted"  → all destinations have podStatus "Submitted"
 * - "Partial"    → some submitted, some not
 * - "Pending"    → at least one delivered but no POD submitted yet
 * - "Not Generated" → no delivery confirmed yet
 */
export function getAggregatePodStatus(shipment) {
  const dests = shipment?.destinations ?? [];
  if (dests.length === 0) return "Not Generated";

  const submitted = dests.filter(d => d.podStatus === "Submitted").length;
  const delivered = dests.filter(d => d.isDelivered).length;

  if (submitted === dests.length) return "Submitted";
  if (submitted > 0) return "Partial";
  if (delivered > 0) return "Pending";
  return "Not Generated";
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