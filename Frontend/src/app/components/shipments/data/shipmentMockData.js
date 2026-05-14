/* ── MOCK DATA ─────────────────────────────────── */

export const dealers = [
  { id: "dl1", name: "Patel Tyre House",    location: "Pune, Maharashtra",       distance: 165, estimatedTime: "3h 20m" },
  { id: "dl2", name: "Krishna Auto Spares", location: "Nagpur, Maharashtra",      distance: 780, estimatedTime: "12h 30m" },
  { id: "dl3", name: "Sharma Motors",       location: "Nashik, Maharashtra",      distance: 185, estimatedTime: "3h 45m" },
  { id: "dl4", name: "Jai Bhavani Tyres",   location: "Aurangabad, Maharashtra",  distance: 335, estimatedTime: "5h 50m" },
  { id: "dl5", name: "Ganesh Traders",      location: "Kolhapur, Maharashtra",    distance: 395, estimatedTime: "6h 40m" },
  { id: "dl6", name: "Sai Auto Parts",      location: "Ahmednagar, Maharashtra",  distance: 260, estimatedTime: "4h 20m" },
];

export const vehicles = [
  { id: "v1", number: "MH04AB1234", type: "Own",    capacity: 800,  isAssigned: false },
  { id: "v2", number: "MH12CD5678", type: "Rented", capacity: 1200, isAssigned: true  },
  { id: "v3", number: "MH04EF9012", type: "Own",    capacity: 600,  isAssigned: false },
  { id: "v4", number: "MH14GH3456", type: "Rented", capacity: 1000, isAssigned: false },
  { id: "v5", number: "MH31KL2345", type: "Rented", capacity: 900,  isAssigned: false },
  { id: "v6", number: "MH04MN6789", type: "Own",    capacity: 750,  isAssigned: false },
];

export const drivers = [
  { id: "d1", name: "Suresh Patel",  type: "Own",    phone: "+91 98765 43210", isOnTrip: false },
  { id: "d2", name: "Ramesh Yadav",  type: "Rented", phone: "+91 87654 32109", isOnTrip: true  },
  { id: "d3", name: "Vikram Singh",  type: "Own",    phone: "+91 76543 21098", isOnTrip: false },
  { id: "d4", name: "Amit Sharma",   type: "Rented", phone: "+91 65432 10987", isOnTrip: false },
  { id: "d5", name: "Deepak Kumar",  type: "Own",    phone: "+91 54321 09876", isOnTrip: false },
];

export const tyreModels = [
  { id: "t1", name: "MRF ZVTS 185/65R15",           unitWeight: 12 },
  { id: "t2", name: "CEAT Milaze X3 195/55R16",      unitWeight: 14 },
  { id: "t3", name: "Apollo Alnac 4G 205/60R16",     unitWeight: 15 },
  { id: "t4", name: "JK Tyre Ranger 265/70R16",      unitWeight: 22 },
  { id: "t5", name: "Bridgestone Ecopia 175/65R14",  unitWeight: 10 },
  { id: "t6", name: "Michelin XM2+ 185/60R15",       unitWeight: 13 },
  { id: "t7", name: "Goodyear Assurance 205/65R15",  unitWeight: 16 },
];

export const mockInvoices = [
  { id: "1", plantNumber: "PL-001", lrNumber: "LR-2026-10042", invoiceNumbers: ["INV-2026-00142", "INV-2026-00143"], invoiceDate: "2026-03-24", customerName: "Patel Tyre House",      amount: 145000, status: "Completed" },
  { id: "2", plantNumber: "PL-002", lrNumber: "LR-2026-10043", invoiceNumbers: ["INV-2026-00144"],                   invoiceDate: "2026-03-23", customerName: "Krishna Auto Spares",   amount: 89000,  status: "Pending"   },
  { id: "3", plantNumber: "PL-003", lrNumber: "LR-2026-10044", invoiceNumbers: ["INV-2026-00145", "INV-2026-00146", "INV-2026-00147"], invoiceDate: "2026-03-22", customerName: "Sharma Wheels", amount: 210000, status: "Completed" },
  { id: "4", plantNumber: "PL-004", lrNumber: "LR-2026-10045", invoiceNumbers: ["INV-2026-00148"],                   invoiceDate: "2026-03-21", customerName: "Metro Tyres Ltd",       amount: 450000, status: "Delayed"   },
  { id: "5", plantNumber: "PL-005", lrNumber: "LR-2026-10046", invoiceNumbers: ["INV-2026-00149", "INV-2026-00150"], invoiceDate: "2026-03-20", customerName: "Highway Auto Traders",  amount: 32000,  status: "Completed" },
  { id: "6", plantNumber: "PL-006", lrNumber: "LR-2026-10047", invoiceNumbers: ["INV-2026-00151"],                   invoiceDate: "2026-03-19", customerName: "Sai Motors",            amount: 76500,  status: "Pending"   },
  { id: "7", plantNumber: "PL-007", lrNumber: "LR-2026-10048", invoiceNumbers: ["INV-2026-00152", "INV-2026-00153"], invoiceDate: "2026-03-18", customerName: "Royal Tyre Care",       amount: 125000, status: "Completed" },
];

export const shipmentDetails = {
  "SHP-2026-00142": {
    dispatchDate: "24 Feb 2026, 08:30 AM",
    estimatedDelivery: "24 Feb 2026, 11:50 AM",
    distance: 165,
    vehicleCapacity: 800,
    driverLicense: "MH-DL-2019-0045612",
    driverType: "Own",
    items: [
      { model: "MRF ZVTS 185/65R15",           type: "Tyre", quantity: 2, unitWeight: 12,  totalWeight: 24  },
      { model: "CEAT Milaze X3 195/55R16",      type: "Tyre", quantity: 1, unitWeight: 14,  totalWeight: 14  },
      { model: "Apollo Alnac 4G 205/60R16",     type: "Tyre", quantity: 1, unitWeight: 15,  totalWeight: 15  },
      { model: "JK Tyre Ranger 265/70R16",      type: "Tyre", quantity: 1, unitWeight: 22,  totalWeight: 22  },
      { model: "Bridgestone Ecopia 175/65R14",  type: "Tyre", quantity: 1, unitWeight: 10,  totalWeight: 10  },
      { model: "MRF Flap 185/65R15",            type: "Flap", quantity: 3, unitWeight: 1.2, totalWeight: 3.6 },
      { model: "CEAT Tube 195/55R16",           type: "Tube", quantity: 2, unitWeight: 2,   totalWeight: 4   },
      { model: "Apollo Tube 205/60R16",         type: "Tube", quantity: 1, unitWeight: 2.5, totalWeight: 2.5 },
    ],
    tracking: { currentLocation: "18.5204° N, 73.8567° E", lastUpdated: "11:42 AM, 24 Feb 2026", speed: "62 km/h", remainingDistance: 45, eta: "45 min" },
    timeline: [
      { step: "Shipment Created",  timestamp: "24 Feb, 07:15 AM", completed: true,  active: false },
      { step: "Assigned to Driver",timestamp: "24 Feb, 07:45 AM", completed: true,  active: false },
      { step: "Dispatched",        timestamp: "24 Feb, 08:30 AM", completed: true,  active: false },
      { step: "In Transit",        timestamp: "24 Feb, 08:35 AM", completed: true,  active: true  },
      { step: "Delivered",         timestamp: "—",                completed: false, active: false },
    ],
  },
  "SHP-2026-00141": {
    dispatchDate: "—",
    estimatedDelivery: "25 Feb 2026, 06:00 PM",
    distance: 780,
    vehicleCapacity: 1200,
    driverLicense: "MH-DL-2020-0078934",
    driverType: "Rented",
    items: [
      { model: "MRF ZVTS 185/65R15",          type: "Tyre", quantity: 4, unitWeight: 12,  totalWeight: 48  },
      { model: "CEAT Milaze X3 195/55R16",     type: "Tyre", quantity: 3, unitWeight: 14,  totalWeight: 42  },
      { model: "Goodyear Assurance 205/65R15", type: "Tyre", quantity: 3, unitWeight: 16,  totalWeight: 48  },
      { model: "Michelin XM2+ 185/60R15",      type: "Tyre", quantity: 2, unitWeight: 13,  totalWeight: 26  },
      { model: "MRF Flap 185/65R15",           type: "Flap", quantity: 4, unitWeight: 1.2, totalWeight: 4.8 },
      { model: "Goodyear Flap 205/65R15",      type: "Flap", quantity: 3, unitWeight: 1.5, totalWeight: 4.5 },
      { model: "CEAT Tube 195/55R16",          type: "Tube", quantity: 3, unitWeight: 2,   totalWeight: 6   },
    ],
    tracking: { currentLocation: "—", lastUpdated: "—", speed: "—", remainingDistance: 780, eta: "12h 30m" },
    timeline: [
      { step: "Shipment Created",  timestamp: "24 Feb, 10:20 AM", completed: true,  active: false },
      { step: "Assigned to Driver",timestamp: "24 Feb, 11:00 AM", completed: true,  active: true  },
      { step: "Dispatched",        timestamp: "—",                completed: false, active: false },
      { step: "In Transit",        timestamp: "—",                completed: false, active: false },
      { step: "Delivered",         timestamp: "—",                completed: false, active: false },
    ],
  },
  "SHP-2026-00140": {
    dispatchDate: "23 Feb 2026, 06:00 AM",
    estimatedDelivery: "23 Feb 2026, 09:45 AM",
    distance: 185,
    vehicleCapacity: 600,
    driverLicense: "MH-DL-2018-0032187",
    driverType: "Own",
    items: [
      { model: "Apollo Alnac 4G 205/60R16",    type: "Tyre", quantity: 2, unitWeight: 15,  totalWeight: 30  },
      { model: "Bridgestone Ecopia 175/65R14", type: "Tyre", quantity: 2, unitWeight: 10,  totalWeight: 20  },
      { model: "Apollo Flap 205/60R16",        type: "Flap", quantity: 2, unitWeight: 1.3, totalWeight: 2.6 },
      { model: "Bridgestone Tube 175/65R14",   type: "Tube", quantity: 2, unitWeight: 1.8, totalWeight: 3.6 },
    ],
    tracking: { currentLocation: "Nashik, Maharashtra", lastUpdated: "09:32 AM, 23 Feb 2026", speed: "0 km/h", remainingDistance: 0, eta: "Delivered" },
    timeline: [
      { step: "Shipment Created",  timestamp: "22 Feb, 04:30 PM", completed: true, active: false },
      { step: "Assigned to Driver",timestamp: "22 Feb, 05:15 PM", completed: true, active: false },
      { step: "Dispatched",        timestamp: "23 Feb, 06:00 AM", completed: true, active: false },
      { step: "In Transit",        timestamp: "23 Feb, 06:05 AM", completed: true, active: false },
      { step: "Delivered",         timestamp: "23 Feb, 09:32 AM", completed: true, active: false },
    ],
  },
};

export const defaultShipmentDetail = {
  dispatchDate: "22 Feb 2026, 07:00 AM",
  estimatedDelivery: "22 Feb 2026, 02:00 PM",
  distance: 340,
  vehicleCapacity: 900,
  driverLicense: "MH-DL-2021-0091234",
  driverType: "Own",
  items: [
    { model: "MRF ZVTS 185/65R15",       type: "Tyre", quantity: 3, unitWeight: 12,  totalWeight: 36  },
    { model: "CEAT Milaze X3 195/55R16",  type: "Tyre", quantity: 2, unitWeight: 14,  totalWeight: 28  },
    { model: "Apollo Alnac 4G 205/60R16", type: "Tyre", quantity: 2, unitWeight: 15,  totalWeight: 30  },
    { model: "MRF Flap 185/65R15",        type: "Flap", quantity: 3, unitWeight: 1.2, totalWeight: 3.6 },
    { model: "CEAT Tube 195/55R16",       type: "Tube", quantity: 2, unitWeight: 2,   totalWeight: 4   },
  ],
  tracking: { currentLocation: "19.0760° N, 72.8777° E", lastUpdated: "02:15 PM, 22 Feb 2026", speed: "0 km/h", remainingDistance: 0, eta: "Delivered" },
  timeline: [
    { step: "Shipment Created",  timestamp: "21 Feb, 03:00 PM", completed: true, active: false },
    { step: "Assigned to Driver",timestamp: "21 Feb, 04:00 PM", completed: true, active: false },
    { step: "Dispatched",        timestamp: "22 Feb, 07:00 AM", completed: true, active: false },
    { step: "In Transit",        timestamp: "22 Feb, 07:05 AM", completed: true, active: false },
    { step: "Delivered",         timestamp: "22 Feb, 01:48 PM", completed: true, active: false },
  ],
};
