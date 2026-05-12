import { createPortal } from "react-dom";
import { useState } from "react";
import {
  X,
  Phone as PhoneIcon,
  Truck,
  MapPin,
  IdCard,
  Calendar,
  CheckCircle2,
  Eye,
  Edit,
  UserPlus,
  ExternalLink,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

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

/* ── STATUS STYLES ─────────────────────────────── */

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

  const typeStyle = driverTypeBadgeStyles[driver.driverType];

  const totalPages = Math.ceil(pastShipments.length / pageSize);
  const pagedShipments = pastShipments.slice(
    historyPage * pageSize,
    (historyPage + 1) * pageSize
  );

  const sheetContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div className="absolute inset-y-0 right-0 w-[80%] max-w-[1050px] bg-[#f5f6f8] shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-400">
        {/* ── HEADER ─── */}
        <div className="bg-white border-b border-border px-6 py-5 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center shrink-0">
                <span className="text-sm text-white">{driver.avatar}</span>
              </div>
              <div>
                <h2 className="text-foreground text-lg">{driver.name}</h2>
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
                    {driver.licenseNumber}
                  </span>
                </InfoField>
                {/* <InfoField label="License Expiry">
                  <span className="text-sm text-foreground">
                    {extInfo.licenseExpiry}
                  </span>
                </InfoField> */}
                <InfoField label="Experience">
                  <span className="text-sm text-foreground">
                    {driver.age} age
                  </span>
                </InfoField>
                {/* <InfoField label="Address">
                  <span className="text-sm text-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {extInfo.address}
                  </span>
                </InfoField> */}
              </div>
            </div>

            {/* ── SECTION 2: PAST SHIPMENT HISTORY ─── */}
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
          </div>
        </ScrollArea>

        {/* ── STICKY FOOTER ─── */}
        <div className="bg-white border-t border-border px-6 py-4 shrink-0 flex items-center justify-end gap-3">
          <Button variant="outline" className="h-9 px-4 text-sm gap-2">
            <Edit className="w-3.5 h-3.5" />
            Edit Driver
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