export const vehicleTrackingData = {};

export const fallbackData = {
  vehicleNumber: "Unknown",
  driverName: "Unknown",
  driverPhone: "---",
  status: "Idle",
  shipmentId: "---",
  dealerName: "---",
  dealerLocation: "---",
  warehouseLocation: "Mumbai Warehouse",
  departedTime: "---",
  estimatedDelivery: "---",
  totalDistance: 0,
  distanceCovered: 0,
  remainingDistance: 0,
  eta: "---",
  percentComplete: 0,
  currentLocation: { area: "Unknown", lat: "---", lng: "---", lastUpdated: "---" },
  averageSpeed: "---",
  currentSpeed: "---",
  delay: null,
  timeline: [],
};

export const statusStyles = {
  Moving: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  Idle:   { bg: "bg-amber-50 border-amber-200",     text: "text-amber-700",   dot: "bg-amber-500"   },
  Stopped:{ bg: "bg-red-50 border-red-200",         text: "text-red-700",     dot: "bg-red-500"     },
};
