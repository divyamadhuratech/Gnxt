// Pure data — no JSX. Icons are rendered by the component using iconName.

export const stats = [
  { title: "Active Shipments",   value: "32",  trendUp: true,  iconName: "Truck",        iconColor: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"   },
  { title: "Pending PODs / LRs", value: "18",  trendUp: true,  iconName: "FileWarning",  iconColor: "text-yellow-600",  bg: "bg-yellow-50",  border: "border-yellow-100" },
  { title: "Pending Dispatch",   value: "18",  trendUp: true,  iconName: "Clock",        iconColor: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"  },
  { title: "Cancelled Dispatch", value: "18",  trendUp: false, iconName: "XCircle",      iconColor: "text-red-600",     bg: "bg-red-50",     border: "border-red-100"    },
  { title: "Pending Delivery",   value: "18",  trendUp: true,  iconName: "Truck",        iconColor: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"   },
  { title: "Deliveries Today",   value: "124", trendUp: true,  iconName: "CheckCircle2", iconColor: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100"},
  { title: "Vehicles on Trip",   value: "45",  trendUp: true,  iconName: "MapPin",       iconColor: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
];

export const weeklyData = [
  { name: "Mon", dispatches: 42, deliveries: 38 },
  { name: "Tue", dispatches: 55, deliveries: 45 },
  { name: "Wed", dispatches: 60, deliveries: 58 },
  { name: "Thu", dispatches: 48, deliveries: 52 },
  { name: "Fri", dispatches: 75, deliveries: 65 },
  { name: "Sat", dispatches: 82, deliveries: 78 },
  { name: "Sun", dispatches: 30, deliveries: 40 },
];

export const currentShipments = [
  { id: "SHP-2026-00142", vehicle: "MH12 CD 5678", driver: "Ramesh Yadav",  destination: "Nagpur, MH",     status: "In Transit", progress: 65,  eta: "Today, 4:30 PM",      items: "120 Tyres" },
  { id: "SHP-2026-00141", vehicle: "MH04 EF 9012", driver: "Suresh Patel",  destination: "Pune, MH",       status: "Delayed",    progress: 40,  eta: "Today, 8:00 PM",      items: "85 Tyres"  },
  { id: "SHP-2026-00140", vehicle: "MH14 GH 3456", driver: "Amit Sharma",   destination: "Nashik, MH",     status: "Unloading",  progress: 95,  eta: "Today, 1:15 PM",      items: "200 Tyres" },
  { id: "SHP-2026-00139", vehicle: "MH31 KL 2345", driver: "Vikram Singh",  destination: "Aurangabad, MH", status: "In Transit", progress: 20,  eta: "Tomorrow, 10:00 AM",  items: "150 Tyres" },
];

export const historicalShipments = [
  { id: "SHP-2026-00101", vehicle: "MH12 CD 5678", driver: "Ramesh Yadav", destination: "Nagpur, MH", status: "Completed", progress: 100, eta: "Today, 10:30 AM",    items: "120 Tyres", podStatus: "Signed" },
  { id: "SHP-2026-00098", vehicle: "MH01 AB 1234", driver: "Kisan Rao",    destination: "Mumbai, MH", status: "Completed", progress: 100, eta: "Yesterday, 2:00 PM", items: "500 Tyres", podStatus: "Signed" },
  { id: "SHP-2026-00097", vehicle: "MH12 CD 5678", driver: "Ramesh Yadav", destination: "Nagpur, MH", status: "Completed", progress: 100, eta: "Yesterday, 10:30 AM",items: "120 Tyres", podStatus: "Signed" },
  { id: "SHP-2026-00095", vehicle: "MH04 EF 9012", driver: "Suresh Patel", destination: "Pune, MH",   status: "Completed", progress: 100, eta: "Mar 10, 4:00 PM",    items: "85 Tyres",  podStatus: "Signed" },
];

export const pendingPODs = [
  { id: "INV-2026-0892", dealer: "Patel Tyre House", date: "Mar 12, 2026", shipmentId: "SHP-2026-00130", status: "Awaiting Upload"      },
  { id: "INV-2026-0890", dealer: "Sharma Motors",    date: "Mar 12, 2026", shipmentId: "SHP-2026-00128", status: "Verification Pending" },
  { id: "INV-2026-0885", dealer: "Ganesh Traders",   date: "Mar 11, 2026", shipmentId: "SHP-2026-00125", status: "Awaiting Upload"      },
];
