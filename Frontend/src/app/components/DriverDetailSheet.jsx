import { createPortal } from "react-dom";
import { useState } from "react";
import { X, Phone as PhoneIcon,Truck,MapPin,Clock,Gauge,Route,Package,Calendar,ShieldCheck,AlertTriangle,Timer,
  CheckCircle2,Eye,Edit,UserPlus,ExternalLink,IdCard,Navigation,ChevronLeft,ChevronRight,TrendingUp,TrendingDown,Zap,} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

/* ── TYPES ─────────────────────────────────────── */

/* ── EXTENDED MOCK DATA ────────────────────────── */

const driverExtendedInfo = {
  "DRV-001": {
    license: "MH-DL-2019-87432",
    licenseExpiry: "2027-03-15",
    experience: 8,
    address: "Pune, Maharashtra",
  },
  "DRV-002": {
    license: "MH-DL-2020-54321",
    licenseExpiry: "2028-06-20",
    experience: 5,
    address: "Nashik, Maharashtra",
  },
  "DRV-003": {
    license: "MH-DL-2018-11234",
    licenseExpiry: "2026-09-10",
    experience: 10,
    address: "Mumbai, Maharashtra",
  },
  "DRV-004": {
    license: "MH-DL-2021-66789",
    licenseExpiry: "2029-01-05",
    experience: 3,
    address: "Nagpur, Maharashtra",
  },
  "DRV-005": {
    license: "MH-DL-2017-99001",
    licenseExpiry: "2026-12-30",
    experience: 12,
    address: "Kolhapur, Maharashtra",
  },
  "DRV-006": {
    license: "MH-DL-2019-33456",
    licenseExpiry: "2027-08-18",
    experience: 7,
    address: "Aurangabad, Maharashtra",
  },
  "DRV-007": {
    license: "MH-DL-2020-22345",
    licenseExpiry: "2028-04-22",
    experience: 6,
    address: "Solapur, Maharashtra",
  },
  "DRV-008": {
    license: "MH-DL-2016-78900",
    licenseExpiry: "2026-07-14",
    experience: 14,
    address: "Satara, Maharashtra",
  },
  "DRV-009": {
    license: "MH-DL-2022-45678",
    licenseExpiry: "2030-02-28",
    experience: 2,
    address: "Thane, Maharashtra",
  },
  "DRV-010": {
    license: "MH-DL-2018-56790",
    licenseExpiry: "2026-11-09",
    experience: 9,
    address: "Sangli, Maharashtra",
  },
};

const activeTripData = {
  "DRV-001": {
    shipmentId: "SHP-2026-1847",
    departure: "08:30 AM, 24 Feb",
    eta: "02:45 PM, 24 Feb",
    currentLocation: "Lonavala, NH-48",
    currentSpeed: "62 km/h",
    distanceCovered: 85,
    remainingDistance: 65,
    totalDistance: 150,
    tripStatus: "In Transit",
  },
  "DRV-003": {
    shipmentId: "SHP-2026-1852",
    departure: "06:00 AM, 24 Feb",
    eta: "04:30 PM, 24 Feb",
    currentLocation: "Nashik, NH-3",
    currentSpeed: "58 km/h",
    distanceCovered: 120,
    remainingDistance: 200,
    totalDistance: 320,
    tripStatus: "In Transit",
  },
  "DRV-008": {
    shipmentId: "SHP-2026-1861",
    departure: "05:15 AM, 24 Feb",
    eta: "01:00 PM, 24 Feb",
    currentLocation: "Satara Bypass, NH-4",
    currentSpeed: "55 km/h",
    distanceCovered: 195,
    remainingDistance: 85,
    totalDistance: 280,
    tripStatus: "In Transit",
  },
};

const pastShipments = [
  {
    id: "SHP-2026-1801",
    dealer: "MRF Dealer – Pune",
    vehicle: "MH-12-AB-1234",
    distance: "142 km",
    deliveryDate: "22 Feb 2026",
    status: "Delivered",
    onTime: true,
  },
  {
    id: "SHP-2026-1789",
    dealer: "Apollo Tyres – Nashik",
    vehicle: "MH-04-CD-5678",
    distance: "218 km",
    deliveryDate: "20 Feb 2026",
    status: "Delivered",
    onTime: false,
  },
  {
    id: "SHP-2026-1776",
    dealer: "CEAT Dealer – Satara",
    vehicle: "MH-12-AB-1234",
    distance: "167 km",
    deliveryDate: "18 Feb 2026",
    status: "Delivered",
    onTime: true,
  },
  {
    id: "SHP-2026-1762",
    dealer: "JK Tyre – Kolhapur",
    vehicle: "MH-43-GH-3456",
    distance: "289 km",
    deliveryDate: "15 Feb 2026",
    status: "Delivered",
    onTime: true,
  },
  {
    id: "SHP-2026-1748",
    dealer: "Bridgestone – Mumbai",
    vehicle: "MH-04-CD-5678",
    distance: "152 km",
    deliveryDate: "12 Feb 2026",
    status: "Returned",
    onTime: false,
  },
  {
    id: "SHP-2026-1733",
    dealer: "Goodyear – Aurangabad",
    vehicle: "MH-12-AB-1234",
    distance: "312 km",
    deliveryDate: "09 Feb 2026",
    status: "Delivered",
    onTime: true,
  },
  {
    id: "SHP-2026-1720",
    dealer: "Continental – Nagpur",
    vehicle: "MH-14-EF-9012",
    distance: "456 km",
    deliveryDate: "06 Feb 2026",
    status: "Delivered",
    onTime: true,
  },
  {
    id: "SHP-2026-1708",
    dealer: "Yokohama – Thane",
    vehicle: "MH-09-KL-7890",
    distance: "98 km",
    deliveryDate: "03 Feb 2026",
    status: "Cancelled",
    onTime: false,
  },
];

const timelineEvents = [
  {
    time: "08:15 AM",
    title: "Assigned to Shipment",
    description: "SHP-2026-1847 assigned by dispatch",
    type: "assigned",
  },
  {
    time: "08:30 AM",
    title: "Departed Warehouse",
    description: "Left Pune Distribution Center",
    type: "departed",
  },
  {
    time: "09:45 AM",
    title: "Checkpoint: Khandala Toll",
    description: "Crossed toll plaza, no delays",
    type: "checkpoint",
  },
  {
    time: "10:30 AM",
    title: "Rest Stop",
    description: "15 min break at Lonavala",
    type: "event",
  },
  {
    time: "11:15 AM",
    title: "Checkpoint: Khopoli",
    description: "En route, steady speed",
    type: "checkpoint",
  },
];

const performanceMetrics = {
  totalShipments: 187,
  onTimePercent: 94.2,
  totalDistance: "42,850 km",
  avgDeliveryTime: "5.2 hrs",
  delays: 11,
  safetyScore: 96,
};

/* ── STATUS STYLES ─────────────────────────────── */

const tripStatusStyles = {
  Driving: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Idle: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600" },
  "On Leave": { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  Assigned: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  Completed: { bg: "bg-violet-50 border-violet-200", text: "text-violet-700" },
};

const driverTypeBadgeStyles = {
  Own: "bg-blue-50 text-blue-700 border-blue-200",
  Hired: "bg-purple-50 text-purple-700 border-purple-200",
  Contract: "bg-teal-50 text-teal-700 border-teal-200",
};

/* ── COMPONENT ─────────────────────────────────── */

export function DriverDetailSheet({ driver, open, onClose }) {
  const [historyPage, setHistoryPage] = useState(0);
  const pageSize = 5;

  if (!driver || !open) return null;

  const extInfo = driverExtendedInfo[driver.id] || {
    license: "N/A",
    licenseExpiry: "N/A",
    experience: 0,
    address: "N/A",
  };

  const activeTrip = activeTripData[driver.id];
  const tripProgress = activeTrip
    ? Math.round((activeTrip.distanceCovered / activeTrip.totalDistance) * 100)
    : 0;

  const statusStyle = tripStatusStyles[driver.tripStatus];
  const typeStyle = driverTypeBadgeStyles[driver.driverType];

  const totalPages = Math.ceil(pastShipments.length / pageSize);
  const pagedShipments = pastShipments.slice(
    historyPage * pageSize,
    (historyPage + 1) * pageSize,
  );

  const timelineDotColors = {
    assigned: "bg-blue-500",
    departed: "bg-emerald-500",
    checkpoint: "bg-amber-500",
    delivered: "bg-violet-500",
    event: "bg-slate-400",
  };

  const sheetContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="absolute inset-y-0 right-0 w-[80%] max-w-[1200px] bg-[#f5f6f8] shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-400">
        {/* ── HEADER ─── */}
        <div className="bg-white border-b border-border px-6 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center shrink-0">
                <span className="text-sm text-white">{driver.avatar}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-foreground text-lg">{driver.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.dot && (
                      <span className="relative flex h-2 w-2">
                        {driver.tripStatus === "Driving" && (
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.dot}`}
                          />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dot}`}
                        />
                      </span>
                    )}
                    {driver.tripStatus}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {driver.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border bg-white hover:bg-slate-50 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ─── */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {/* ── SECTION 1: BASIC INFO ─── */}
            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm text-foreground flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-[#1d4ed8]" />
                  Driver Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-3 gap-x-8 gap-y-4">
                <InfoField label="Driver Type">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${typeStyle}`}
                  >
                    {driver.driverType}
                  </span>
                </InfoField>
                <InfoField label="Phone Number">
                  <a
                    href={`tel:${driver.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-[#1d4ed8] transition-colors"
                  >
                    <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    {driver.phone}
                  </a>
                </InfoField>
                <InfoField label="License Number">
                  <span className="text-sm text-foreground">
                    {extInfo.license}
                  </span>
                </InfoField>
                <InfoField label="License Expiry">
                  <span className="text-sm text-foreground">
                    {extInfo.licenseExpiry}
                  </span>
                </InfoField>
                <InfoField label="Experience">
                  <span className="text-sm text-foreground">
                    {extInfo.experience} years
                  </span>
                </InfoField>
                <InfoField label="Address">
                  <span className="text-sm text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {extInfo.address}
                  </span>
                </InfoField>
              </div>
            </div>

            {/* ── SECTION 2: CURRENT TRIP ─── */}
            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm text-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#1d4ed8]" />
                  Current Trip Details
                </h3>
              </div>
              {activeTrip ? (
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-4 mb-5">
                    <InfoField label="Shipment ID">
                      <span className="text-sm text-[#1d4ed8] cursor-pointer hover:underline">
                        {activeTrip.shipmentId}
                      </span>
                    </InfoField>
                    <InfoField label="Assigned Vehicle">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                        {driver.assignedVehicle?.number || "—"}
                      </span>
                    </InfoField>
                    <InfoField label="Trip Status">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        {activeTrip.tripStatus}
                      </span>
                    </InfoField>
                    <InfoField label="Departure Time">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {activeTrip.departure}
                      </span>
                    </InfoField>
                    <InfoField label="ETA">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                        {activeTrip.eta}
                      </span>
                    </InfoField>
                    <InfoField label="Current Location">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        {activeTrip.currentLocation}
                      </span>
                    </InfoField>
                    <InfoField label="Current Speed">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                        {activeTrip.currentSpeed}
                      </span>
                    </InfoField>
                    <InfoField label="Distance Covered">
                      <span className="text-sm text-foreground">
                        {activeTrip.distanceCovered} km
                      </span>
                    </InfoField>
                    <InfoField label="Remaining Distance">
                      <span className="text-sm text-foreground">
                        {activeTrip.remainingDistance} km
                      </span>
                    </InfoField>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-slate-50 rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Trip Progress
                      </span>
                      <span className="text-xs text-foreground">
                        {tripProgress}% completed
                      </span>
                    </div>
                    <Progress
                      value={tripProgress}
                      className="h-2.5 bg-slate-200 [&>[data-slot=progress-indicator]]:bg-[#1d4ed8]"
                    />
                    <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                      <span>{activeTrip.distanceCovered} km covered</span>
                      <span>{activeTrip.totalDistance} km total</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                    <Route className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No active shipment assigned.
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    This driver is currently not on a trip.
                  </p>
                </div>
              )}
            </div>

            {/* ── SECTION 3: PERFORMANCE METRICS ─── */}
            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
                  Performance Metrics
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {/* Hero row — two highlight cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Shipments — hero card */}
                  <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-[#1d4ed8] to-[#3b6cf4] p-5">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-blue-100">
                          Total Shipments
                        </span>
                      </div>
                      <p className="text-3xl text-white tabular-nums tracking-tight">
                        {performanceMetrics.totalShipments}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <TrendingUp className="w-3 h-3 text-emerald-300" />
                        <span className="text-[11px] text-blue-100">
                          +12 this month
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* On-Time Delivery — circular gauge card */}
                  <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-500 p-5">
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs text-emerald-100">
                          On-Time Delivery
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <p className="text-3xl text-white tabular-nums tracking-tight">
                          {performanceMetrics.onTimePercent}
                        </p>
                        <span className="text-sm text-emerald-200 mb-1">%</span>
                      </div>
                      <div className="mt-2.5 w-full bg-white/20 rounded-full h-1.5">
                        <div
                          className="bg-white rounded-full h-1.5 transition-all"
                          style={{
                            width: `${performanceMetrics.onTimePercent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary metrics row */}
                <div className="grid grid-cols-4 gap-3">
                  {/* Total Distance */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center">
                        <Route className="w-4 h-4 text-violet-600" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        <TrendingUp className="w-2.5 h-2.5" />
                        8%
                      </span>
                    </div>
                    <p className="text-lg text-foreground tabular-nums">
                      {performanceMetrics.totalDistance}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Total Distance
                    </p>
                  </div>

                  {/* Avg Delivery Time */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        <TrendingDown className="w-2.5 h-2.5" />
                        0.3h
                      </span>
                    </div>
                    <p className="text-lg text-foreground tabular-nums">
                      {performanceMetrics.avgDeliveryTime}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Avg Delivery Time
                    </p>
                  </div>

                  {/* Delays */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                        <TrendingUp className="w-2.5 h-2.5" />2
                      </span>
                    </div>
                    <p className="text-lg text-foreground tabular-nums">
                      {performanceMetrics.delays}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Total Delays
                    </p>
                  </div>

                  {/* Safety Score */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +2
                      </span>
                    </div>
                    <div className="flex items-end gap-1">
                      <p className="text-lg text-foreground tabular-nums">
                        {performanceMetrics.safetyScore}
                      </p>
                      <span className="text-xs text-muted-foreground mb-0.5">
                        /100
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Safety Score
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 4: PAST SHIPMENT HISTORY ─── */}
            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1d4ed8]" />
                  Past Shipment History
                </h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f8f9fb] hover:bg-[#f8f9fb]">
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5 pl-5">
                      Shipment ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      Dealer
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      Vehicle
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      Distance
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      Delivery Date
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      Status
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5">
                      On-Time
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-2.5 pr-5 text-right">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedShipments.map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-[#f8f9fb]/60 transition-colors"
                    >
                      <TableCell className="py-2.5 pl-5">
                        <span className="text-sm text-[#1d4ed8] cursor-pointer hover:underline">
                          {s.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-foreground">
                        {s.dealer}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="text-xs text-foreground bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                          {s.vehicle}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-foreground">
                        {s.distance}
                      </TableCell>
                      <TableCell className="py-2.5 text-sm text-muted-foreground">
                        {s.deliveryDate}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                            s.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : s.status === "Returned"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        {s.onTime ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> On-Time
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-500">
                            <AlertTriangle className="w-3.5 h-3.5" /> Delayed
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 pr-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-[#1d4ed8] hover:bg-[#1d4ed8]/5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-border bg-[#f8f9fb]/50 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {historyPage + 1} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={historyPage === 0}
                      onClick={() => setHistoryPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={historyPage >= totalPages - 1}
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ── SECTION 5: TIMELINE ─── */}
            <div className="bg-white rounded-xl border border-border">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1d4ed8]" />
                  Activity Timeline
                </h3>
              </div>
              <div className="p-5">
                <div className="relative">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="flex gap-4 mb-0 last:mb-0">
                      {/* Timeline track */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${timelineDotColors[event.type]} shrink-0 mt-0.5 ring-2 ring-white`}
                        />
                        {idx < timelineEvents.length - 1 && (
                          <div className="w-px flex-1 bg-slate-200 my-1" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-5 last:pb-0 -mt-0.5">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* ── STICKY FOOTER ─── */}
        <div className="bg-white border-t border-border px-6 py-4 shrink-0 flex items-center justify-end gap-3">
          <Button variant="outline" className="h-9 px-4 text-sm gap-2">
            <Edit className="w-3.5 h-3.5" />
            Edit Driver
          </Button>
          <Button variant="outline" className="h-9 px-4 text-sm gap-2">
            <UserPlus className="w-3.5 h-3.5" />
            Assign Shipment
          </Button>
          <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white h-9 px-4 text-sm gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            View Full Profile
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}

/* ── SUB COMPONENTS ────────────────────────────── */

function InfoField({ label, children }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      {children}
    </div>
  );
}

function MetricCard({ icon, label, value, accent }) {
  const accentBg = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-emerald-50 border-emerald-100",
    violet: "bg-violet-50 border-violet-100",
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
  };

  return (
    <div
      className={`rounded-lg border p-4 ${accentBg[accent] || "bg-slate-50 border-slate-100"}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl text-foreground tabular-nums">{value}</p>
    </div>
  );
}
