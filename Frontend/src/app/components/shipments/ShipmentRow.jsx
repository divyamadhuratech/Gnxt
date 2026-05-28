import { Eye, FileCheck, Pencil } from "lucide-react";
import { TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { getPODConfig, getAggregatePodStatus, statusConfig } from "./utils/shipmentStyles";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export function PlantRow({
  shipment,
  setSelectedShipment,
  setViewSheetOpen,
  setEditShipment,       // opens CreateShipmentSheet in edit mode
  setShipmentData,
  onDeleted,
}) {
  const sc  = statusConfig[shipment.status] || { label: shipment.status || "N/A", className: "bg-gray-50 text-gray-700 border-gray-200" };
  const aggregatePodStatus = getAggregatePodStatus(shipment);
  const pod = getPODConfig(shipment.status, aggregatePodStatus);

  const dest = shipment.destinations?.[0] ?? {};

  // LR Number
  const lrNumber = dest.lrNumber || "—";

  // Plant Number
  const plantNumber = dest.plantReferenceNumber || "—";

  // Customer name & location — from denormalized dest fields (set at create/update time)
  // For older records: fall back to any populated invoice across all destinations
  const allPopulatedInvoices = (shipment.destinations ?? [])
    .flatMap((d) => (d.invoiceIds ?? []).filter((inv) => typeof inv === "object"));
  const firstPopulated = allPopulatedInvoices[0] ?? null;

  const customerName     = dest.customerName     || firstPopulated?.customerName || "—";
  const deliveryLocation = dest.deliveryLocation || firstPopulated?.location     || "—";
  // Items & Weight
  const totalWeightKg = shipment.totalWeightKg ?? 0;
  const totalQuantity = shipment.totalQuantity  ?? 0;

  // Date
  const date = shipment.createdAt
    ? new Date(shipment.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const handleDelete = async () => {
    if (!window.confirm(`Delete shipment ${shipment.shipmentId}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/shipments/${shipment._id}`, { method: "DELETE" });
      setShipmentData((prev) => prev.filter((s) => s._id !== shipment._id));
      if (onDeleted) onDeleted(shipment._id);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <TableRow className="group cursor-default hover:bg-muted/30">
      {/* LR Number */}
      <TableCell className="pl-5">
        <span className="text-sm font-medium text-[#1d4ed8]">{lrNumber}</span>
        {shipment.destinations?.length > 1 && (
          <span className="ml-1.5 text-[10px] text-muted-foreground">+{shipment.destinations.length - 1}</span>
        )}
      </TableCell>

      {/* Plant Number */}
      <TableCell>
        <span className="text-sm font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">
          {plantNumber}
        </span>
      </TableCell>

      {/* Invoice Number column — only Shipment ID */}
      <TableCell>
        <span className="text-sm font-medium text-[#1d4ed8]">{shipment.shipmentId}</span>
      </TableCell>

      {/* Dealer & Location — customerName + district from invoice */}
      <TableCell>
        <div>
          <p className="text-sm text-foreground font-medium">{customerName}</p>
          {deliveryLocation !== "—" && (
            <p className="text-xs text-muted-foreground mt-0.5">{deliveryLocation}</p>
          )}
        </div>
      </TableCell>

      {/* Items & Weight */}
      <TableCell>
        <div className="flex items-center gap-2">
          <PackageIcon />
          <div>
            <span className="text-sm text-foreground">{totalWeightKg} kg</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Driver Info */}
      <TableCell>
        <div>
          <p className="text-sm text-foreground">{shipment.driverName || "—"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{shipment.driverPhone || ""}</p>
        </div>
      </TableCell>

      {/* Vehicle Info */}
      <TableCell>
        <div>
          <p className="text-sm text-foreground">{shipment.vehicleNumber || "—"}</p>
          {shipment.vehicleCapacityKg && (
            <Badge variant="outline" className="mt-0.5 text-[10px] px-1.5 py-0 rounded-sm border-blue-200 text-blue-600 bg-blue-50/60">
              {shipment.vehicleCapacityKg} kg
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Date */}
      <TableCell>
        <span className="text-sm text-muted-foreground">{date}</span>
      </TableCell>

      {/* Status */}
      <TableCell>
        <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border ${sc.className}`}>
          {sc.label}
        </span>
      </TableCell>

      {/* POD */}
      <TableCell>
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border w-fit ${pod.className}${
              shipment.status === "Delivered" ? " cursor-pointer hover:opacity-80 transition-opacity" : ""
            }`}
            onClick={shipment.status === "Delivered" ? () => { setSelectedShipment(shipment); setViewSheetOpen(true); } : undefined}
          >
            {pod.icon && <FileCheck className="w-3 h-3" />}
            {pod.label}
          </span>
          {/* Per-destination breakdown for multi-destination shipments */}
          {shipment.destinations?.length > 1 && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {shipment.destinations.map((d, i) => {
                const dPod = d.podStatus === "Submitted"
                  ? { label: "Signed", cls: "text-emerald-600" }
                  : d.isDelivered
                  ? { label: "Pending", cls: "text-amber-600" }
                  : { label: "—", cls: "text-gray-400" };
                return (
                  <span key={i} className={`text-[10px] ${dPod.cls}`}>
                    D{i + 1}: {dPod.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </TableCell>

      {/* View / Edit / Delete */}
      <TableCell className="pr-5">
        <div className="flex items-center gap-1">
          {/* View */}
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => { setSelectedShipment(shipment); setViewSheetOpen(true); }}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {/* Edit — opens CreateShipmentSheet pre-filled */}
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-blue-50 transition-colors text-muted-foreground hover:text-[#1d4ed8]"
            onClick={() => setEditShipment && setEditShipment(shipment)}
            title="Edit Shipment"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {/* Delete */}
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
            onClick={handleDelete}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PackageIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l6 3.46a2 2 0 0 0 2 0l6-3.46A2 2 0 0 0 21 16z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export default PlantRow;
