import {
  X,
  MapPin,
  Truck,
  User,
  Package,
  Clock,
  Phone,
  Navigation,
  Map,
  Weight,
  Hash,
  Layers,
  CheckCircle2,
  FileText,
  Download,
  Edit,
  XCircle,
  Radio,
  Calendar,
  Circle,
  Building2,
  FileCheck,
  Upload,
  Image,
  Camera,
  Eye,
  CircleDot,
  Disc,
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";

/* ── EXTENDED MOCK DATA ─────────────────────────── */

const shipmentDetails = {
  "SHP-2026-00142": {
    dispatchDate: "24 Feb 2026, 08:30 AM",
    estimatedDelivery: "24 Feb 2026, 11:50 AM",
    distance: 165,
    vehicleCapacity: 800,
    driverLicense: "MH-DL-2019-0045612",
    driverType: "Own",
    items: [
      {
        model: "MRF ZVTS 185/65R15",
        type: "Tyre",
        quantity: 2,
        unitWeight: 12,
        totalWeight: 24,
      },
      {
        model: "CEAT Milaze X3 195/55R16",
        type: "Tyre",
        quantity: 1,
        unitWeight: 14,
        totalWeight: 14,
      },
      {
        model: "Apollo Alnac 4G 205/60R16",
        type: "Tyre",
        quantity: 1,
        unitWeight: 15,
        totalWeight: 15,
      },
      {
        model: "JK Tyre Ranger 265/70R16",
        type: "Tyre",
        quantity: 1,
        unitWeight: 22,
        totalWeight: 22,
      },
      {
        model: "Bridgestone Ecopia 175/65R14",
        type: "Tyre",
        quantity: 1,
        unitWeight: 10,
        totalWeight: 10,
      },
      {
        model: "MRF Flap 185/65R15",
        type: "Flap",
        quantity: 3,
        unitWeight: 1.2,
        totalWeight: 3.6,
      },
      {
        model: "CEAT Tube 195/55R16",
        type: "Tube",
        quantity: 2,
        unitWeight: 2,
        totalWeight: 4,
      },
      {
        model: "Apollo Tube 205/60R16",
        type: "Tube",
        quantity: 1,
        unitWeight: 2.5,
        totalWeight: 2.5,
      },
    ],
    tracking: {
      currentLocation: "18.5204° N, 73.8567° E",
      lastUpdated: "11:42 AM, 24 Feb 2026",
      speed: "62 km/h",
      remainingDistance: 45,
      eta: "45 min",
    },
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "24 Feb, 07:15 AM",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Driver",
        timestamp: "24 Feb, 07:45 AM",
        completed: true,
        active: false,
      },
      {
        step: "Dispatched",
        timestamp: "24 Feb, 08:30 AM",
        completed: true,
        active: false,
      },
      {
        step: "In Transit",
        timestamp: "24 Feb, 08:35 AM",
        completed: true,
        active: true,
      },
      { step: "Delivered", timestamp: "—", completed: false, active: false },
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
      {
        model: "MRF ZVTS 185/65R15",
        type: "Tyre",
        quantity: 4,
        unitWeight: 12,
        totalWeight: 48,
      },
      {
        model: "CEAT Milaze X3 195/55R16",
        type: "Tyre",
        quantity: 3,
        unitWeight: 14,
        totalWeight: 42,
      },
      {
        model: "Goodyear Assurance 205/65R15",
        type: "Tyre",
        quantity: 3,
        unitWeight: 16,
        totalWeight: 48,
      },
      {
        model: "Michelin XM2+ 185/60R15",
        type: "Tyre",
        quantity: 2,
        unitWeight: 13,
        totalWeight: 26,
      },
      {
        model: "MRF Flap 185/65R15",
        type: "Flap",
        quantity: 4,
        unitWeight: 1.2,
        totalWeight: 4.8,
      },
      {
        model: "Goodyear Flap 205/65R15",
        type: "Flap",
        quantity: 3,
        unitWeight: 1.5,
        totalWeight: 4.5,
      },
      {
        model: "CEAT Tube 195/55R16",
        type: "Tube",
        quantity: 3,
        unitWeight: 2,
        totalWeight: 6,
      },
    ],
    tracking: {
      currentLocation: "—",
      lastUpdated: "—",
      speed: "—",
      remainingDistance: 780,
      eta: "12h 30m",
    },
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "24 Feb, 10:20 AM",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Driver",
        timestamp: "24 Feb, 11:00 AM",
        completed: true,
        active: true,
      },
      { step: "Dispatched", timestamp: "—", completed: false, active: false },
      { step: "In Transit", timestamp: "—", completed: false, active: false },
      { step: "Delivered", timestamp: "—", completed: false, active: false },
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
      {
        model: "Apollo Alnac 4G 205/60R16",
        type: "Tyre",
        quantity: 2,
        unitWeight: 15,
        totalWeight: 30,
      },
      {
        model: "Bridgestone Ecopia 175/65R14",
        type: "Tyre",
        quantity: 2,
        unitWeight: 10,
        totalWeight: 20,
      },
      {
        model: "Apollo Flap 205/60R16",
        type: "Flap",
        quantity: 2,
        unitWeight: 1.3,
        totalWeight: 2.6,
      },
      {
        model: "Bridgestone Tube 175/65R14",
        type: "Tube",
        quantity: 2,
        unitWeight: 1.8,
        totalWeight: 3.6,
      },
    ],
    tracking: {
      currentLocation: "Nashik, Maharashtra",
      lastUpdated: "09:32 AM, 23 Feb 2026",
      speed: "0 km/h",
      remainingDistance: 0,
      eta: "Delivered",
    },
    timeline: [
      {
        step: "Shipment Created",
        timestamp: "22 Feb, 04:30 PM",
        completed: true,
        active: false,
      },
      {
        step: "Assigned to Driver",
        timestamp: "22 Feb, 05:15 PM",
        completed: true,
        active: false,
      },
      {
        step: "Dispatched",
        timestamp: "23 Feb, 06:00 AM",
        completed: true,
        active: false,
      },
      {
        step: "In Transit",
        timestamp: "23 Feb, 06:05 AM",
        completed: true,
        active: false,
      },
      {
        step: "Delivered",
        timestamp: "23 Feb, 09:32 AM",
        completed: true,
        active: false,
      },
    ],
  },
};

// Default detail for shipments without specific data
const defaultDetail = {
  dispatchDate: "22 Feb 2026, 07:00 AM",
  estimatedDelivery: "22 Feb 2026, 02:00 PM",
  distance: 340,
  vehicleCapacity: 900,
  driverLicense: "MH-DL-2021-0091234",
  driverType: "Own",
  items: [
    {
      model: "MRF ZVTS 185/65R15",
      type: "Tyre",
      quantity: 3,
      unitWeight: 12,
      totalWeight: 36,
    },
    {
      model: "CEAT Milaze X3 195/55R16",
      type: "Tyre",
      quantity: 2,
      unitWeight: 14,
      totalWeight: 28,
    },
    {
      model: "Apollo Alnac 4G 205/60R16",
      type: "Tyre",
      quantity: 2,
      unitWeight: 15,
      totalWeight: 30,
    },
    {
      model: "MRF Flap 185/65R15",
      type: "Flap",
      quantity: 3,
      unitWeight: 1.2,
      totalWeight: 3.6,
    },
    {
      model: "CEAT Tube 195/55R16",
      type: "Tube",
      quantity: 2,
      unitWeight: 2,
      totalWeight: 4,
    },
  ],
  tracking: {
    currentLocation: "19.0760° N, 72.8777° E",
    lastUpdated: "02:15 PM, 22 Feb 2026",
    speed: "0 km/h",
    remainingDistance: 0,
    eta: "Delivered",
  },
  timeline: [
    {
      step: "Shipment Created",
      timestamp: "21 Feb, 03:00 PM",
      completed: true,
      active: false,
    },
    {
      step: "Assigned to Driver",
      timestamp: "21 Feb, 04:00 PM",
      completed: true,
      active: false,
    },
    {
      step: "Dispatched",
      timestamp: "22 Feb, 07:00 AM",
      completed: true,
      active: false,
    },
    {
      step: "In Transit",
      timestamp: "22 Feb, 07:05 AM",
      completed: true,
      active: false,
    },
    {
      step: "Delivered",
      timestamp: "22 Feb, 01:48 PM",
      completed: true,
      active: false,
    },
  ],
};

/* ── STATUS CONFIG ─────────────────────────────── */

const statusConfig = {
  Pending: {
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
  },
  "In Transit": {
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  Delivered: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  Cancelled: {
    className: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
};

/* ── COMPONENT ─────────────────────────────────── */

export function ViewShipmentSheet({ open, onOpenChange, shipment }) {
  const [podImages, setPodImages] = useState([]);
  const [podRemarks, setPodRemarks] = useState("");
  const [podReceiverName, setPodReceiverName] = useState("");
  const [podUploading, setPodUploading] = useState(false);
  const [podViewImage, setPodViewImage] = useState(null);
  const fileInputRef = useRef(null);

  if (!shipment) return null;

  const detail = shipmentDetails[shipment.id] ?? defaultDetail;
  const sc = statusConfig[shipment.status];

  const totalQty = detail.items.reduce((s, i) => s + i.quantity, 0);
  const totalWt = detail.items.reduce((s, i) => s + i.totalWeight, 0);
  const loadUtil = Math.round((totalWt / detail.vehicleCapacity) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-none w-full sm:w-[80%] p-0 gap-0 flex flex-col"
      >
        {/* ── HEADER ───────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div>
              <SheetTitle className="text-lg tracking-tight flex items-center gap-3">
                Shipment Details
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Complete shipment information and tracking
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#f0f4ff] border border-[#c7d7fe] rounded-lg px-4 py-2">
              <p className="text-[10px] text-[#4b6cb7] tracking-wide uppercase">
                Shipment ID
              </p>
              <p className="text-sm text-[#1d4ed8] tracking-tight">
                {shipment.id}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${sc.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
              {shipment.status}
            </span>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-6 space-y-8">
            {/* ═══════════ SECTION 1: Overview Card ═══════════ */}
            <div>
              <SectionLabel
                icon={<Package className="w-4 h-4" />}
                title="Shipment Overview"
              />
              <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                  <OverviewCell
                    label="Dealer Name"
                    value={shipment.dealerName}
                    icon={<Building2 className="w-3.5 h-3.5" />}
                  />

                  <OverviewCell
                    label="Dealer Location"
                    value={shipment.dealerLocation}
                    icon={<MapPin className="w-3.5 h-3.5" />}
                  />

                  <OverviewCell
                    label="Dispatch Date"
                    value={detail.dispatchDate}
                    icon={<Calendar className="w-3.5 h-3.5" />}
                  />

                  <OverviewCell
                    label="Est. Delivery"
                    value={detail.estimatedDelivery}
                    icon={<Clock className="w-3.5 h-3.5" />}
                  />
                </div>
                <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
                  <OverviewCell
                    label="Total Quantity"
                    value={`${totalQty} units`}
                    icon={<Hash className="w-3.5 h-3.5" />}
                  />

                  <OverviewCell
                    label="Total Weight"
                    value={`${totalWt} kg`}
                    icon={<Weight className="w-3.5 h-3.5" />}
                  />

                  <OverviewCell
                    label="Distance"
                    value={`${detail.distance} km`}
                    icon={<Navigation className="w-3.5 h-3.5" />}
                  />
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 2: GPS & Tracking ═══════════ */}
            <div>
              <SectionLabel
                icon={<Map className="w-4 h-4" />}
                title="Location & GPS Tracking"
              />
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Map Placeholder */}
                <div className="lg:col-span-3 bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] border border-[#c7d7fe] rounded-xl flex flex-col items-center justify-center min-h-[260px] p-6 relative overflow-hidden">
                  {/* Decorative grid */}
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  {/* Route visualization */}
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center shadow-md">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] text-[#4338ca]">
                          Warehouse
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-0.5 bg-[#6366f1]/30 rounded" />
                        <div className="w-3 h-3 rounded-full bg-[#6366f1]/40 animate-pulse" />
                        <div className="w-16 h-0.5 bg-[#6366f1]/30 rounded" />
                        {shipment.status === "In Transit" && (
                          <>
                            <div className="w-6 h-6 rounded-full bg-[#1d4ed8]/80 flex items-center justify-center shadow-sm">
                              <Truck className="w-3 h-3 text-white" />
                            </div>
                            <div className="w-12 h-0.5 bg-[#6366f1]/20 rounded" />
                          </>
                        )}
                        <div className="w-16 h-0.5 bg-[#6366f1]/20 rounded" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                            shipment.status === "Delivered"
                              ? "bg-emerald-500"
                              : "bg-[#6366f1]/30"
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 ${
                              shipment.status === "Delivered"
                                ? "text-white"
                                : "text-[#4338ca]"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-[#4338ca]">
                          Dealer
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6366f1]/70 mt-2">
                      {shipment.status === "Delivered"
                        ? "Route completed"
                        : shipment.status === "In Transit"
                          ? "Vehicle en route"
                          : "Awaiting dispatch"}
                    </p>
                  </div>
                </div>

                {/* Tracking Info Card */}
                <div className="lg:col-span-2 space-y-3">
                  {shipment.status === "Delivered" ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col items-center gap-3 h-full justify-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-emerald-800">
                          Delivered Successfully
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          {
                            detail.timeline.find((t) => t.step === "Delivered")
                              ?.timestamp
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-border rounded-xl divide-y divide-border h-full flex flex-col">
                      <div className="px-4 py-3 flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-[#1d4ed8]" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Live Tracking
                        </span>
                      </div>
                      <TrackingRow
                        label="Current Location"
                        value={detail.tracking.currentLocation}
                      />
                      <TrackingRow
                        label="Last Updated"
                        value={detail.tracking.lastUpdated}
                      />
                      <TrackingRow
                        label="Current Speed"
                        value={detail.tracking.speed}
                      />
                      <TrackingRow
                        label="Remaining Distance"
                        value={`${detail.tracking.remainingDistance} km`}
                      />
                      <TrackingRow
                        label="ETA"
                        value={detail.tracking.eta}
                        highlight
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 3: Proof of Dispatch (POD) ═══════════ */}
            <div>
              <SectionLabel
                icon={<FileCheck className="w-4 h-4" />}
                title="Proof of Dispatch (POD)"
              />
              <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
                {/* POD Status Header */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-[#fafbfc]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        shipment.status === "Delivered"
                          ? "bg-emerald-100"
                          : shipment.status === "In Transit"
                            ? "bg-amber-100"
                            : shipment.status === "Cancelled"
                              ? "bg-gray-100"
                              : "bg-gray-100"
                      }`}
                    >
                      <FileCheck
                        className={`w-4 h-4 ${
                          shipment.status === "Delivered"
                            ? "text-emerald-600"
                            : shipment.status === "In Transit"
                              ? "text-amber-600"
                              : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">POD Status</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shipment.status === "Delivered"
                          ? "Dispatch confirmed — POD available"
                          : shipment.status === "In Transit"
                            ? "Awaiting delivery confirmation"
                            : shipment.status === "Cancelled"
                              ? "Shipment cancelled — POD not applicable"
                              : "Pending dispatch — POD not yet generated"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
                      shipment.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : shipment.status === "In Transit"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {shipment.status === "Delivered" ? (
                      <>
                        <FileCheck className="w-3 h-3" /> Signed
                      </>
                    ) : shipment.status === "In Transit" ? (
                      <>
                        <Clock className="w-3 h-3" /> Pending
                      </>
                    ) : shipment.status === "Cancelled" ? (
                      "N/A"
                    ) : (
                      "Not Generated"
                    )}
                  </span>
                </div>

                {/* POD Details — only shown for Delivered shipments */}
                {shipment.status === "Delivered" && (
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <DetailField
                        label="Receiver Name"
                        value="Rajesh Sharma"
                      />
                      <DetailField
                        label="Receiver Designation"
                        value="Store Manager"
                      />
                      <DetailField
                        label="Received Date"
                        value={
                          detail.timeline.find((t) => t.step === "Delivered")
                            ?.timestamp ?? "—"
                        }
                      />
                      <DetailField label="POD Reference">
                        <span className="text-sm text-[#1d4ed8]">
                          POD-{shipment.id.replace("SHP-", "")}
                        </span>
                      </DetailField>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">
                        Dispatch Proof Images
                      </p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative group rounded-xl border border-border overflow-hidden bg-[#fafbfc] aspect-[4/3] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Camera className="w-6 h-6 text-muted-foreground/40" />
                            <span className="text-[10px]">
                              Loading Document
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Download className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="relative group rounded-xl border border-border overflow-hidden bg-[#fafbfc] aspect-[4/3] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="w-6 h-6 text-muted-foreground/40" />
                            <span className="text-[10px]">Signed Challan</span>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Download className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </div>
                        <div className="relative group rounded-xl border border-border overflow-hidden bg-[#fafbfc] aspect-[4/3] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Image className="w-6 h-6 text-muted-foreground/40" />
                            <span className="text-[10px]">Unloading Photo</span>
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Eye className="w-4 h-4 text-foreground" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                              <Download className="w-4 h-4 text-foreground" />
                            </button>
                          </div>
                        </div>
                        {podImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl border border-border overflow-hidden bg-[#fafbfc] aspect-[4/3]"
                          >
                            <img
                              src={img}
                              alt={`POD upload ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                                onClick={() => setPodViewImage(img)}
                              >
                                <Eye className="w-4 h-4 text-foreground" />
                              </button>
                              <button
                                className="w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors"
                                onClick={() =>
                                  setPodImages((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                        Delivery Remarks
                      </p>
                      <p className="text-sm text-foreground bg-[#fafbfc] border border-border rounded-lg px-4 py-3">
                        All {totalQty} units received in good condition. No
                        damages reported. Receiver confirmed item count matches
                        challan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Upload Area */}
                <div className="border-t border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-[#1d4ed8]" />
                      <p className="text-xs text-foreground">
                        Admin: Upload POD Documents
                      </p>
                    </div>
                    {podImages.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 rounded-md border-[#c7d7fe] text-[#4338ca] bg-[#eef2ff]"
                      >
                        {podImages.length} uploaded
                      </Badge>
                    )}
                  </div>
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-[#1d4ed8]/40 hover:bg-[#fafbfe] transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#eef2ff] flex items-center justify-center">
                      <Upload className="w-5 h-5 text-[#1d4ed8]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-foreground">
                        Click to upload POD images
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Supports JPG, PNG, PDF — Max 5MB per file
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          Array.from(files).forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                setPodImages((prev) => [
                                  ...prev,
                                  ev.target.result,
                                ]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Receiver Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter receiver's name..."
                        value={podReceiverName}
                        onChange={(e) => setPodReceiverName(e.target.value)}
                        className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="Add delivery remarks..."
                        value={podRemarks}
                        onChange={(e) => setPodRemarks(e.target.value)}
                        className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"
                      disabled={
                        podImages.length === 0 &&
                        !podReceiverName &&
                        !podRemarks
                      }
                      onClick={() => {
                        setPodUploading(true);
                        setTimeout(() => {
                          setPodUploading(false);
                          alert("POD data saved successfully!");
                        }, 1000);
                      }}
                    >
                      {podUploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <FileCheck className="w-4 h-4" />
                      )}
                      {podUploading ? "Saving..." : "Save POD Data"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 4: Vehicle & Driver ═══════════ */}
            <div>
              <SectionLabel
                icon={<Truck className="w-4 h-4" />}
                title="Vehicle & Driver Details"
              />
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Vehicle Card */}
                <div className="bg-white border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Vehicle Information
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Transport details
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField label="Vehicle Type">
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0.5 rounded-md ${
                          shipment.vehicleType === "Own"
                            ? "border-blue-200 text-blue-600 bg-blue-50/60"
                            : "border-orange-200 text-orange-600 bg-orange-50/60"
                        }`}
                      >
                        {shipment.vehicleType}
                      </Badge>
                    </DetailField>
                    <DetailField
                      label="Vehicle Number"
                      value={shipment.vehicleNumber}
                    />
                    <DetailField
                      label="Capacity"
                      value={`${detail.vehicleCapacity} kg`}
                    />
                    <DetailField label="Load Utilization">
                      <div className="space-y-1.5">
                        <span
                          className={`text-sm ${loadUtil > 90 ? "text-red-600" : loadUtil > 70 ? "text-amber-600" : "text-foreground"}`}
                        >
                          {loadUtil}%
                        </span>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              loadUtil > 90
                                ? "bg-red-500"
                                : loadUtil > 70
                                  ? "bg-amber-500"
                                  : "bg-[#1d4ed8]"
                            }`}
                            style={{ width: `${Math.min(loadUtil, 100)}%` }}
                          />
                        </div>
                      </div>
                    </DetailField>
                  </div>
                </div>

                {/* Driver Card */}
                <div className="bg-white border border-border rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Driver Information
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned driver details
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      label="Driver Name"
                      value={shipment.driverName}
                    />
                    <DetailField label="Phone Number">
                      <span className="text-sm text-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {shipment.driverPhone}
                      </span>
                    </DetailField>
                    <DetailField
                      label="License Number"
                      value={detail.driverLicense}
                    />
                    <DetailField label="Driver Type">
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0.5 rounded-md ${
                          detail.driverType === "Own"
                            ? "border-emerald-200 text-emerald-600 bg-emerald-50/60"
                            : "border-violet-200 text-violet-600 bg-violet-50/60"
                        }`}
                      >
                        {detail.driverType}
                      </Badge>
                    </DetailField>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 4: Shipment Items ═══════════ */}
            <div>
              <SectionLabel
                icon={<Layers className="w-4 h-4" />}
                title="Shipment Items Breakdown"
              />
              <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
                <div className="bg-[#fafbfc] px-5 py-3 space-y-2.5">
                  <div className="flex items-center gap-6">
                    <SummaryPill
                      icon={<Weight className="w-3.5 h-3.5 text-[#1d4ed8]" />}
                      label="Total Weight"
                      value={`${totalWt} kg`}
                    />

                    <SummaryPill
                      icon={<Hash className="w-3.5 h-3.5 text-[#1d4ed8]" />}
                      label="Total Items"
                      value={`${totalQty}`}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center gap-6">
                    <SummaryPill
                      icon={<CircleDot className="w-3.5 h-3.5 text-blue-600" />}
                      label="Total Tyres"
                      value={`${detail.items.filter((i) => i.type === "Tyre").reduce((s, i) => s + i.quantity, 0)}`}
                    />

                    <SummaryPill
                      icon={<Disc className="w-3.5 h-3.5 text-amber-600" />}
                      label="Total Flaps"
                      value={`${detail.items.filter((i) => i.type === "Flap").reduce((s, i) => s + i.quantity, 0)}`}
                    />

                    <SummaryPill
                      icon={<Circle className="w-3.5 h-3.5 text-violet-600" />}
                      label="Total Tubes"
                      value={`${detail.items.filter((i) => i.type === "Tube").reduce((s, i) => s + i.quantity, 0)}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 5: Timeline ═══════════ */}
            <div>
              <SectionLabel
                icon={<Clock className="w-4 h-4" />}
                title="Shipment Timeline"
              />
              <div className="mt-3 bg-white border border-border rounded-xl p-6">
                <div className="space-y-0">
                  {detail.timeline.map((step, idx) => {
                    const isLast = idx === detail.timeline.length - 1;
                    return (
                      <div key={idx} className="flex gap-4">
                        {/* Timeline Line & Dot */}
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
                              className={`w-0.5 h-10 ${
                                step.completed &&
                                detail.timeline[idx + 1]?.completed
                                  ? "bg-emerald-300"
                                  : step.completed
                                    ? "bg-gradient-to-b from-emerald-300 to-border"
                                    : "bg-border"
                              }`}
                            />
                          )}
                        </div>

                        {/* Content */}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Image Preview Modal */}
            {podViewImage && (
              <div
                className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-8"
                onClick={() => setPodViewImage(null)}
              >
                <div
                  className="relative max-w-3xl max-h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    onClick={() => setPodViewImage(null)}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <img
                    src={podViewImage}
                    alt="POD Preview"
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                </div>
              </div>
            )}

            {/* Bottom spacer for sticky footer */}
            <div className="h-4" />
          </div>
        </div>

        {/* ── STICKY FOOTER ────────────────────── */}
        <div className="border-t border-border bg-white px-8 py-4 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <div className="flex items-center gap-3">
            {shipment.status === "Pending" && (
              <>
                <Button variant="outline" className="border-border gap-2">
                  <XCircle className="w-4 h-4" />
                  Cancel Shipment
                </Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm">
                  <Edit className="w-4 h-4" />
                  Edit Shipment
                </Button>
              </>
            )}
            {shipment.status === "In Transit" && (
              <>
                <Button variant="outline" className="border-border gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Driver
                </Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Delivered
                </Button>
              </>
            )}
            {shipment.status === "Delivered" && (
              <>
                <Button variant="outline" className="border-border gap-2">
                  <FileText className="w-4 h-4" />
                  View Proof of Delivery
                </Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm">
                  <Download className="w-4 h-4" />
                  Download Invoice
                </Button>
              </>
            )}
            {shipment.status === "Cancelled" && (
              <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm">
                <Edit className="w-4 h-4" />
                Re-create Shipment
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────── */

function SectionLabel({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#eef2ff] border border-[#c7d7fe] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-sm text-foreground">{title}</h3>
    </div>
  );
}

function OverviewCell({ label, value, icon }) {
  return (
    <div className="px-4 py-3.5 space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  );
}

function TrackingRow({ label, value, highlight }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs ${
          highlight ? "text-[#1d4ed8]" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function DetailField({ label, value, children }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      {children ?? <p className="text-sm text-foreground">{value}</p>}
    </div>
  );
}

function SummaryPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}
