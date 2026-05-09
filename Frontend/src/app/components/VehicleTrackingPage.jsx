import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Truck,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Eye,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Building2,
  Calendar,
  Route,
  Target,
  Timer,
  RefreshCw,
  Fuel,
  Droplets,
  TrendingDown,
  Gauge,
  Check,
} from "lucide-react";
import { Button } from "./ui/button";

/* ── TYPES ─────────────────────────────────────── */

/* ── MOCK DATA ─────────────────────────────────── */

const vehicleTrackingData = {
  MH04AB1234: {
    vehicleNumber: "MH04AB1234",
    driverName: "Suresh Patel",
    driverPhone: "+91 98765 43210",
    status: "Moving",
    shipmentId: "SHP-2026-00142",
    dealerName: "Patel Tyre House",
    dealerLocation: "Pune, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "08:30 AM, 24 Feb 2026",
    estimatedDelivery: "11:50 AM, 24 Feb 2026",
    totalDistance: 165,
    distanceCovered: 120,
    remainingDistance: 45,
    eta: "45 min",
    percentComplete: 73,
    currentLocation: {
      area: "Lonavala, Mumbai-Pune Expressway",
      lat: "18.7546",
      lng: "73.4062",
      lastUpdated: "11:42 AM, 24 Feb 2026",
    },
    averageSpeed: "58 km/h",
    currentSpeed: "62 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "07:15 AM, 24 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Suresh Patel",
        timestamp: "07:45 AM, 24 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "08:30 AM, 24 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Panvel Checkpoint",
        timestamp: "09:15 AM, 24 Feb",
        completed: true,
        active: false,
        detail: "53 km covered",
      },
      {
        step: "Passed Lonavala Toll",
        timestamp: "10:20 AM, 24 Feb",
        completed: true,
        active: false,
        detail: "95 km covered",
      },
      {
        step: "Currently near Lonavala",
        timestamp: "11:42 AM, 24 Feb",
        completed: true,
        active: true,
        detail: "120 km covered",
      },
      {
        step: "Arriving at Pune (Dealer)",
        timestamp: "~12:30 PM",
        completed: false,
        active: false,
      },
    ],
  },
  MH14GH3456: {
    vehicleNumber: "MH14GH3456",
    driverName: "Amit Sharma",
    driverPhone: "+91 65432 10987",
    status: "Moving",
    shipmentId: "SHP-2026-00139",
    dealerName: "Jai Bhavani Tyres",
    dealerLocation: "Aurangabad, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "06:00 AM, 23 Feb 2026",
    estimatedDelivery: "12:30 PM, 23 Feb 2026",
    totalDistance: 340,
    distanceCovered: 260,
    remainingDistance: 80,
    eta: "1h 20m",
    percentComplete: 76,
    currentLocation: {
      area: "Ahmednagar, NH-222",
      lat: "19.0948",
      lng: "74.7480",
      lastUpdated: "11:38 AM, 24 Feb 2026",
    },
    averageSpeed: "52 km/h",
    currentSpeed: "55 km/h",
    delay: "Running 45 minutes behind schedule",
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "04:30 PM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Amit Sharma",
        timestamp: "05:15 PM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "06:00 AM, 23 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Nashik Highway Junction",
        timestamp: "08:45 AM, 23 Feb",
        completed: true,
        active: false,
        detail: "140 km covered",
      },
      {
        step: "Currently near Ahmednagar",
        timestamp: "11:38 AM, 24 Feb",
        completed: true,
        active: true,
        detail: "260 km covered - Delayed",
      },
      {
        step: "Arriving at Aurangabad (Dealer)",
        timestamp: "~01:15 PM",
        completed: false,
        active: false,
      },
    ],
  },
  MH15TU9012: {
    vehicleNumber: "MH15TU9012",
    driverName: "Nilesh Deshmukh",
    driverPhone: "+91 09876 54321",
    status: "Stopped",
    shipmentId: "SHP-2026-00133",
    dealerName: "Vithal Rubber Industries",
    dealerLocation: "Jalgaon, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "05:30 AM, 20 Feb 2026",
    estimatedDelivery: "02:00 PM, 20 Feb 2026",
    totalDistance: 420,
    distanceCovered: 310,
    remainingDistance: 110,
    eta: "2h 15m",
    percentComplete: 74,
    currentLocation: {
      area: "Dhule Rest Stop, NH-3",
      lat: "20.9042",
      lng: "74.7749",
      lastUpdated: "10:15 AM, 24 Feb 2026",
    },
    averageSpeed: "48 km/h",
    currentSpeed: "0 km/h",
    delay: "Vehicle stopped for 35 minutes",
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "03:00 PM, 19 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Nilesh Deshmukh",
        timestamp: "04:00 PM, 19 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "05:30 AM, 20 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Nashik Toll",
        timestamp: "08:20 AM, 20 Feb",
        completed: true,
        active: false,
        detail: "180 km covered",
      },
      {
        step: "Vehicle Stopped at Dhule Rest Stop",
        timestamp: "10:15 AM, 20 Feb",
        completed: true,
        active: true,
        detail: "310 km - Stopped",
      },
      {
        step: "Arriving at Jalgaon (Dealer)",
        timestamp: "---",
        completed: false,
        active: false,
      },
    ],
  },
  MH12CD5678: {
    vehicleNumber: "MH12CD5678",
    driverName: "Ramesh Yadav",
    driverPhone: "+91 87654 32109",
    status: "Idle",
    shipmentId: "SHP-2026-00141",
    dealerName: "Krishna Auto Spares",
    dealerLocation: "Nagpur, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "---",
    estimatedDelivery: "06:00 PM, 25 Feb 2026",
    totalDistance: 780,
    distanceCovered: 0,
    remainingDistance: 780,
    eta: "12h 30m",
    percentComplete: 0,
    currentLocation: {
      area: "Mumbai Warehouse, Bhiwandi",
      lat: "19.2813",
      lng: "73.0482",
      lastUpdated: "11:00 AM, 24 Feb 2026",
    },
    averageSpeed: "0 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "10:20 AM, 24 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Ramesh Yadav",
        timestamp: "11:00 AM, 24 Feb",
        completed: true,
        active: true,
      },
      {
        step: "Departed from Warehouse",
        timestamp: "---",
        completed: false,
        active: false,
      },
      { step: "In Transit", timestamp: "---", completed: false, active: false },
      {
        step: "Arriving at Nagpur (Dealer)",
        timestamp: "---",
        completed: false,
        active: false,
      },
    ],
  },
  MH20PQ1234: {
    vehicleNumber: "MH20PQ1234",
    driverName: "Prakash Jadhav",
    driverPhone: "+91 21098 76543",
    status: "Idle",
    shipmentId: "SHP-2026-00135",
    dealerName: "Sai Auto Parts",
    dealerLocation: "Ahmednagar, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "---",
    estimatedDelivery: "25 Feb 2026, 04:00 PM",
    totalDistance: 265,
    distanceCovered: 0,
    remainingDistance: 265,
    eta: "5h 30m",
    percentComplete: 0,
    currentLocation: {
      area: "Mumbai Warehouse, Bhiwandi",
      lat: "19.2813",
      lng: "73.0482",
      lastUpdated: "09:00 AM, 24 Feb 2026",
    },
    averageSpeed: "0 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "10:00 AM, 21 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Prakash Jadhav",
        timestamp: "11:00 AM, 21 Feb",
        completed: true,
        active: true,
      },
      {
        step: "Departed from Warehouse",
        timestamp: "---",
        completed: false,
        active: false,
      },
      { step: "In Transit", timestamp: "---", completed: false, active: false },
      {
        step: "Arriving at Ahmednagar (Dealer)",
        timestamp: "---",
        completed: false,
        active: false,
      },
    ],
  },
  MH04EF9012: {
    vehicleNumber: "MH04EF9012",
    driverName: "Vikram Singh",
    driverPhone: "+91 76543 21098",
    status: "Stopped",
    shipmentId: "SHP-2026-00140",
    dealerName: "Sharma Motors",
    dealerLocation: "Nashik, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "06:00 AM, 23 Feb 2026",
    estimatedDelivery: "09:45 AM, 23 Feb 2026",
    totalDistance: 185,
    distanceCovered: 185,
    remainingDistance: 0,
    eta: "Delivered",
    percentComplete: 100,
    currentLocation: {
      area: "Sharma Motors, Nashik",
      lat: "19.9975",
      lng: "73.7898",
      lastUpdated: "09:32 AM, 23 Feb 2026",
    },
    averageSpeed: "52 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "04:30 PM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Vikram Singh",
        timestamp: "05:15 PM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "06:00 AM, 23 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Thane Checkpoint",
        timestamp: "06:50 AM, 23 Feb",
        completed: true,
        active: false,
        detail: "35 km covered",
      },
      {
        step: "Passed Igatpuri Ghat Section",
        timestamp: "08:10 AM, 23 Feb",
        completed: true,
        active: false,
        detail: "120 km covered",
      },
      {
        step: "Delivered at Sharma Motors, Nashik",
        timestamp: "09:32 AM, 23 Feb",
        completed: true,
        active: false,
        detail: "185 km - Delivered",
      },
    ],
  },
  MH04IJ7890: {
    vehicleNumber: "MH04IJ7890",
    driverName: "Deepak Kumar",
    driverPhone: "+91 54321 09876",
    status: "Stopped",
    shipmentId: "SHP-2026-00138",
    dealerName: "Ganesh Traders",
    dealerLocation: "Kolhapur, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "05:00 AM, 22 Feb 2026",
    estimatedDelivery: "01:30 PM, 22 Feb 2026",
    totalDistance: 395,
    distanceCovered: 395,
    remainingDistance: 0,
    eta: "Delivered",
    percentComplete: 100,
    currentLocation: {
      area: "Ganesh Traders, Kolhapur",
      lat: "16.7050",
      lng: "74.2433",
      lastUpdated: "01:22 PM, 22 Feb 2026",
    },
    averageSpeed: "47 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "03:30 PM, 21 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Deepak Kumar",
        timestamp: "04:15 PM, 21 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "05:00 AM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Pune Bypass",
        timestamp: "08:45 AM, 22 Feb",
        completed: true,
        active: false,
        detail: "165 km covered",
      },
      {
        step: "Passed Satara Toll",
        timestamp: "10:30 AM, 22 Feb",
        completed: true,
        active: false,
        detail: "270 km covered",
      },
      {
        step: "Delivered at Ganesh Traders, Kolhapur",
        timestamp: "01:22 PM, 22 Feb",
        completed: true,
        active: false,
        detail: "395 km - Delivered",
      },
    ],
  },
  MH04MN6789: {
    vehicleNumber: "MH04MN6789",
    driverName: "Rajendra More",
    driverPhone: "+91 32109 87654",
    status: "Stopped",
    shipmentId: "SHP-2026-00136",
    dealerName: "Rajendra Tyre Service",
    dealerLocation: "Sangli, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "04:30 AM, 21 Feb 2026",
    estimatedDelivery: "12:00 PM, 21 Feb 2026",
    totalDistance: 380,
    distanceCovered: 380,
    remainingDistance: 0,
    eta: "Delivered",
    percentComplete: 100,
    currentLocation: {
      area: "Rajendra Tyre Service, Sangli",
      lat: "16.8524",
      lng: "74.5815",
      lastUpdated: "11:48 AM, 21 Feb 2026",
    },
    averageSpeed: "51 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "02:00 PM, 20 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Rajendra More",
        timestamp: "03:00 PM, 20 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "04:30 AM, 21 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Pune Expressway Exit",
        timestamp: "07:15 AM, 21 Feb",
        completed: true,
        active: false,
        detail: "150 km covered",
      },
      {
        step: "Passed Karad Junction",
        timestamp: "09:40 AM, 21 Feb",
        completed: true,
        active: false,
        detail: "280 km covered",
      },
      {
        step: "Delivered at Rajendra Tyre Service",
        timestamp: "11:48 AM, 21 Feb",
        completed: true,
        active: false,
        detail: "380 km - Delivered",
      },
    ],
  },
  MH24RS5678: {
    vehicleNumber: "MH24RS5678",
    driverName: "Sanjay Patil",
    driverPhone: "+91 10987 65432",
    status: "Stopped",
    shipmentId: "SHP-2026-00134",
    dealerName: "Balaji Tyre World",
    dealerLocation: "Latur, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "03:00 AM, 20 Feb 2026",
    estimatedDelivery: "01:00 PM, 20 Feb 2026",
    totalDistance: 490,
    distanceCovered: 490,
    remainingDistance: 0,
    eta: "Delivered",
    percentComplete: 100,
    currentLocation: {
      area: "Balaji Tyre World, Latur",
      lat: "18.3916",
      lng: "76.5604",
      lastUpdated: "12:45 PM, 20 Feb 2026",
    },
    averageSpeed: "49 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "04:00 PM, 19 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Sanjay Patil",
        timestamp: "05:00 PM, 19 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Departed from Mumbai Warehouse",
        timestamp: "03:00 AM, 20 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Crossed Solapur Highway",
        timestamp: "08:00 AM, 20 Feb",
        completed: true,
        active: false,
        detail: "290 km covered",
      },
      {
        step: "Passed Osmanabad Checkpoint",
        timestamp: "10:30 AM, 20 Feb",
        completed: true,
        active: false,
        detail: "390 km covered",
      },
      {
        step: "Delivered at Balaji Tyre World, Latur",
        timestamp: "12:45 PM, 20 Feb",
        completed: true,
        active: false,
        detail: "490 km - Delivered",
      },
    ],
  },
  MH31KL2345: {
    vehicleNumber: "MH31KL2345",
    driverName: "Manoj Tiwari",
    driverPhone: "+91 43210 98765",
    status: "Stopped",
    shipmentId: "SHP-2026-00137",
    dealerName: "Mahalakshmi Rubber Co.",
    dealerLocation: "Solapur, Maharashtra",
    warehouseLocation: "Mumbai Warehouse, Bhiwandi",
    departedTime: "---",
    estimatedDelivery: "---",
    totalDistance: 0,
    distanceCovered: 0,
    remainingDistance: 0,
    eta: "Cancelled",
    percentComplete: 0,
    currentLocation: {
      area: "Mumbai Warehouse, Bhiwandi",
      lat: "19.2813",
      lng: "73.0482",
      lastUpdated: "---",
    },
    averageSpeed: "0 km/h",
    currentSpeed: "0 km/h",
    delay: null,
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "09:00 AM, 22 Feb",
        completed: true,
        active: false,
      },
      {
        step: "Shipment Cancelled",
        timestamp: "09:30 AM, 22 Feb",
        completed: true,
        active: true,
      },
    ],
  },
};

const fallbackData = {
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
  currentLocation: {
    area: "Unknown",
    lat: "---",
    lng: "---",
    lastUpdated: "---",
  },
  averageSpeed: "---",
  currentSpeed: "---",
  delay: null,
  timeline: [],
};

/* ── STATUS CONFIG ─────────────────────────────── */

const statusStyles = {
  Moving: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Idle: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Stopped: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

/* ── COMPONENT ─────────────────────────────────── */

export function VehicleTrackingPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [dispatched, setDispatched] = useState(false);

  const data = vehicleTrackingData[vehicleId ?? ""] ?? {
    ...fallbackData,
    vehicleNumber: vehicleId ?? "Unknown",
  };
  const ss = statusStyles[data.status] ?? statusStyles.Idle;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/trips")}
            className="w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-foreground tracking-tight flex items-center gap-3">
              Vehicle Tracking
              <span className="text-[#1d4ed8]">- {data.vehicleNumber}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time tracking for shipment {data.shipmentId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-border text-muted-foreground hover:text-foreground h-9"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {dispatched ? (
            <Button
              variant="secondary"
              className="gap-2 h-9 cursor-default pointer-events-none bg-emerald-50 text-emerald-700 border border-emerald-200"
              disabled
            >
              <Check className="w-3.5 h-3.5" />
              Dispatched — Departed from Factory
            </Button>
          ) : (
            <Button
              className="gap-2 h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white"
              onClick={() => setDispatched(true)}
            >
              <Truck className="w-3.5 h-3.5" />
              Dispatch
            </Button>
          )}
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${ss.bg} ${ss.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${ss.dot} ${data.status === "Moving" ? "animate-pulse" : ""}`}
            />
            {data.status}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* LEFT CONTENT (3 cols) */}
          <div className="xl:col-span-3 space-y-6">
            {/* SECTION 1: KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <KpiCard
                icon={<Calendar className="w-4 h-4 text-[#1d4ed8]" />}
                label="Departed Time"
                value={data.departedTime}
              />
              <KpiCard
                icon={<Clock className="w-4 h-4 text-[#1d4ed8]" />}
                label="Est. Delivery Time"
                value={data.estimatedDelivery}
              />
              <KpiCard
                icon={<Route className="w-4 h-4 text-emerald-500" />}
                label="Distance Covered"
                value={`${data.distanceCovered} km`}
              />
              <KpiCard
                icon={<Navigation className="w-4 h-4 text-amber-500" />}
                label="Remaining Distance"
                value={`${data.remainingDistance} km`}
              />
              <KpiCard
                icon={<Timer className="w-4 h-4 text-violet-500" />}
                label="ETA (Arrival)"
                value={data.eta}
              />
              <div className="bg-white border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-[#1d4ed8]" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    % Completed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-foreground tabular-nums">
                    {data.percentComplete}%
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${data.percentComplete === 100 ? "bg-emerald-500" : "bg-[#1d4ed8]"}`}
                    style={{ width: `${data.percentComplete}%` }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Live Map Preview */}
            <div>
              <SectionTitle
                icon={<MapPin className="w-4 h-4" />}
                title="Live Map Preview"
              />
              <div className="mt-3 bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] border border-[#c7d7fe] rounded-xl min-h-[320px] p-6 relative overflow-hidden">
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* Route visualization */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[260px] gap-6">
                  <div className="flex items-center gap-3">
                    {/* Warehouse Pin */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-[#1d4ed8] flex items-center justify-center shadow-lg shadow-blue-200">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[10px] text-[#4338ca] max-w-[80px] text-center leading-tight">
                        {data.warehouseLocation.split(",")[0]}
                      </span>
                    </div>
                    {/* Route Line + Vehicle */}
                    <div className="flex items-center relative">
                      <div
                        className="h-1 bg-[#1d4ed8] rounded-l-full"
                        style={{
                          width: `${Math.max(data.percentComplete * 2, 20)}px`,
                        }}
                      />
                      {data.status !== "Idle" && (
                        <div className="relative mx-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                              data.status === "Moving"
                                ? "bg-[#1d4ed8] shadow-blue-300"
                                : "bg-red-500 shadow-red-200"
                            }`}
                          >
                            <Truck className="w-5 h-5 text-white" />
                          </div>
                          {data.status === "Moving" && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                          )}
                        </div>
                      )}
                      <div
                        className="h-1 bg-[#c7d7fe] rounded-r-full"
                        style={{
                          width: `${Math.max((100 - data.percentComplete) * 2, 20)}px`,
                        }}
                      />
                    </div>
                    {/* Dealer Pin */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                          data.percentComplete === 100
                            ? "bg-emerald-500 shadow-emerald-200"
                            : "bg-[#6366f1]/30 shadow-indigo-100"
                        }`}
                      >
                        <MapPin
                          className={`w-6 h-6 ${data.percentComplete === 100 ? "text-white" : "text-[#4338ca]"}`}
                        />
                      </div>
                      <span className="text-[10px] text-[#4338ca] max-w-[80px] text-center leading-tight">
                        {data.dealerLocation.split(",")[0]}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#6366f1]/70">
                    {data.distanceCovered} km of {data.totalDistance} km covered
                  </p>
                </div>
              </div>
              {/* Location Details below map */}
              <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Current Location
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {data.currentLocation.area}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Lat / Long
                    </p>
                    <p className="text-sm text-foreground mt-1 tabular-nums">
                      {data.currentLocation.lat} N, {data.currentLocation.lng} E
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Last Updated
                    </p>
                    <p className="text-sm text-foreground mt-1">
                      {data.currentLocation.lastUpdated}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: Fuel Information */}
            <div>
              <SectionTitle
                icon={<Fuel className="w-4 h-4" />}
                title="Fuel Information"
              />
              <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Parameter
                      </th>
                      <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Value
                      </th>
                      <th className="text-left text-[10px] text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <Fuel className="w-3.5 h-3.5 text-amber-600" />
                        Tank Capacity
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        200 L
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Full Tank
                        </span>
                      </td>
                    </tr>
                    {(() => {
                      const currentFuel =
                        data.distanceCovered > 0
                          ? Math.max(
                              200 - Math.round(data.distanceCovered / 3.8),
                              0,
                            )
                          : 200;
                      const fuelPercent = currentFuel / 200;
                      return (
                        <tr className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                            <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                            Current Fuel Level
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-foreground tabular-nums">
                                {currentFuel} L
                              </span>
                              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    fuelPercent < 0.25
                                      ? "bg-red-500"
                                      : fuelPercent < 0.5
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${fuelPercent * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {Math.round(fuelPercent * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                fuelPercent < 0.25
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : fuelPercent < 0.5
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {fuelPercent < 0.25
                                ? "Low"
                                : fuelPercent < 0.5
                                  ? "Moderate"
                                  : "Good"}
                            </span>
                          </td>
                        </tr>
                      );
                    })()}
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-[#1d4ed8]" />
                        Fuel Consumed
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {data.distanceCovered > 0
                          ? `${Math.round(data.distanceCovered / 3.8)} L`
                          : "0 L"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {data.distanceCovered > 0
                          ? `₹${(Math.round(data.distanceCovered / 3.8) * 89.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })} cost`
                          : "—"}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5 text-violet-600" />
                        Mileage (Avg)
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        3.8 km/L
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Standard
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <Fuel className="w-3.5 h-3.5 text-blue-500" />
                        Fuel at Departure
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        200 L (Full)
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Pre-trip filled
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <Route className="w-3.5 h-3.5 text-amber-500" />
                        Est. Fuel for Full Trip
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {data.totalDistance > 0
                          ? `${Math.round(data.totalDistance / 3.8)} L`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                        {data.totalDistance > 0
                          ? `₹${(Math.round(data.totalDistance / 3.8) * 89.5).toLocaleString("en-IN", { maximumFractionDigits: 0 })} est. total`
                          : "—"}
                      </td>
                    </tr>
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                        Est. Remaining Range
                      </td>
                      <td className="px-4 py-3 text-foreground tabular-nums">
                        {data.distanceCovered > 0
                          ? `${Math.max(Math.round((200 - data.distanceCovered / 3.8) * 3.8), 0)} km`
                          : "760 km"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {data.remainingDistance > 0
                          ? `${data.remainingDistance} km to destination`
                          : "Trip completed"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {(() => {
                const currentFuel = Math.max(
                  200 - Math.round(data.distanceCovered / 3.8),
                  0,
                );
                const fuelPercent = currentFuel / 200;
                if (fuelPercent < 0.25 && data.remainingDistance > 0) {
                  return (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-sm text-red-700">
                        Low fuel warning — estimated {currentFuel}L remaining.
                        Vehicle may need refueling before reaching destination.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* SECTION 4: Timeline of Movement */}
            <div>
              <SectionTitle
                icon={<Clock className="w-4 h-4" />}
                title="Timeline of Movement"
              />
              <div className="mt-3 bg-white border border-border rounded-xl p-6">
                <div className="space-y-0">
                  {data.timeline.map((step, idx) => {
                    const isLast = idx === data.timeline.length - 1;
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              step.completed
                                ? step.active
                                  ? "bg-[#1d4ed8] border-[#1d4ed8] shadow-md shadow-blue-200"
                                  : "bg-emerald-500 border-emerald-500"
                                : "bg-white border-border"
                            }`}
                          >
                            {step.completed ? (
                              step.active ? (
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )
                            ) : (
                              <Circle className="w-3 h-3 text-muted-foreground/40" />
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 h-12 ${
                                step.completed &&
                                data.timeline[idx + 1]?.completed
                                  ? "bg-emerald-300"
                                  : step.completed
                                    ? "bg-gradient-to-b from-emerald-300 to-border"
                                    : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                        <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                          <p
                            className={`text-sm ${
                              step.completed
                                ? step.active
                                  ? "text-[#1d4ed8]"
                                  : "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.step}
                            {step.active && (
                              <span className="ml-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {step.timestamp}
                          </p>
                          {step.detail && (
                            <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">
                              {step.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Quick Actions Panel (Right Side) */}
          <div className="xl:col-span-1">
            <div className="sticky top-0 space-y-4">
              <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 border-border h-10"
                  >
                    <Phone className="w-4 h-4 text-emerald-500" />
                    Call Driver
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2.5 border-border h-10"
                    onClick={() => navigate("/shipments")}
                  >
                    <Eye className="w-4 h-4 text-violet-500" />
                    View Shipment Details
                  </Button>
                  {data.status === "Moving" && (
                    <Button className="w-full justify-start gap-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white h-10">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
                  Driver Info
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Name
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {data.driverName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="text-sm text-foreground mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-500" />
                      {data.driverPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
                  Shipment Info
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Shipment ID
                    </p>
                    <p className="text-sm text-[#1d4ed8] mt-0.5">
                      {data.shipmentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Dealer
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {data.dealerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Destination
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {data.dealerLocation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────── */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#eef2ff] border border-[#c7d7fe] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-sm text-foreground">{title}</h3>
    </div>
  );
}

function KpiCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#f0f4ff] border border-[#dbe4ff] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function RouteInfoCell({ label, value, highlight }) {
  const colorMap = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="px-4 py-3.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm mt-1 tabular-nums ${highlight ? colorMap[highlight] : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
