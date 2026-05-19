import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Download, Edit, XCircle, Phone, CheckCircle2, X, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
import { ShipmentOverview }     from "./view/ShipmentOverview";
import { TrackingSection }      from "./view/TrackingSection";
import { PODSection }           from "./view/PODSection";
import { VehicleDriverDetails } from "./view/VehicleDriverDetails";
import { ItemsBreakdown }       from "./view/ItemsBreakdown";
import { ShipmentTimeline }     from "./view/ShipmentTimeline";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
const GPS_POLL_MS  = 10_000; // refresh GPS every 10 s while sheet is open

const statusConfig = {
  Pending:      { className: "bg-amber-50 text-amber-700 border-amber-200",       dotColor: "bg-amber-500"   },
  "In Transit": { className: "bg-blue-50 text-blue-700 border-blue-200",          dotColor: "bg-blue-500"    },
  Delivered:    { className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" },
  Cancelled:    { className: "bg-red-50 text-red-700 border-red-200",             dotColor: "bg-red-500"     },
};

/* ── Build detail object from real shipment data ── */
function buildDetail(s, liveGps) {
  if (!s) return null;

  const vehicleObj      = s.vehicleId && typeof s.vehicleId === "object" ? s.vehicleId : null;
  const vehicleCapacity = vehicleObj?.capacityKg ?? s.vehicleCapacityKg ?? 0;
  const vehicleType     = vehicleObj?.type        ?? "—";
  const vehicleModel    = vehicleObj?.model        ?? "";

  const driverObj     = s.driverId && typeof s.driverId === "object" ? s.driverId : null;
  const driverLicense = driverObj?.licenseNumber ?? "—";
  const driverType    = driverObj?.driverType    ?? "—";

  const fmt = (d) =>
    d ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—";

  const dispatchDate      = fmt(s.dispatchDate);
  const estimatedDelivery = fmt(s.deliveryDate) !== "—" ? fmt(s.deliveryDate) : "—";
  const created           = fmt(s.createdAt);
  const dispatched        = fmt(s.dispatchDate);
  const delivered         = fmt(s.deliveryDate);

  const isDelivered = s.status === "Delivered";
  const isInTransit = s.status === "In Transit";
  const isPending   = s.status === "Pending";

  const timeline = [
    { step: "Shipment Created",   timestamp: created,    completed: true,                    active: isPending && !s.dispatchDate },
    { step: "Assigned to Driver", timestamp: s.driverName ? created : "—", completed: !!s.driverName, active: false },
    { step: "Dispatched",         timestamp: dispatched, completed: !!s.dispatchDate,        active: false },
    { step: "In Transit",         timestamp: dispatched !== "—" ? dispatched : "—", completed: isInTransit || isDelivered, active: isInTransit },
    { step: "Delivered",          timestamp: delivered,  completed: isDelivered,             active: false },
  ];

  const items = (s.destinations ?? []).flatMap((dest) => {
    const rows = [];
    if (dest.totalTyres > 0) rows.push({ model: dest.customerName || dest.plantReferenceNumber, type: "Tyre", quantity: dest.totalTyres, unitWeight: 0, totalWeight: 0 });
    if (dest.totalTubes > 0) rows.push({ model: dest.customerName || dest.plantReferenceNumber, type: "Tube", quantity: dest.totalTubes, unitWeight: 0, totalWeight: 0 });
    if (dest.totalFlaps > 0) rows.push({ model: dest.customerName || dest.plantReferenceNumber, type: "Flap", quantity: dest.totalFlaps, unitWeight: 0, totalWeight: 0 });
    return rows;
  });

  /* ── Live GPS tracking data ── */
  let tracking;
  if (liveGps) {
    const fixAge = liveGps.fixTime
      ? new Date(liveGps.fixTime).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        })
      : "—";

    tracking = {
      isLive:          true,
      // raw numbers for the map
      rawLat:          liveGps.lat,
      rawLng:          liveGps.lng,
      rawSpeed:        liveGps.speed,
      fixTime:         liveGps.fixTime,
      // display strings for the panel
      currentLocation: `${liveGps.lat?.toFixed(5)}° N, ${liveGps.lng?.toFixed(5)}° E`,
      lastUpdated:     fixAge,
      speed:           `${(liveGps.speed ?? 0).toFixed(1)} km/h`,
      remainingDistance: 0,
      eta:             liveGps.vehicleStatus === "Moving" ? "In transit" : "Stopped",
      // extra GPS fields for the badge
      satellites:      liveGps.satellites,
      accuracy:        liveGps.acc,
      heading:         liveGps.heading,
      altitude:        liveGps.altitude,
      vehicleStatus:   liveGps.vehicleStatus,
      deviceId:        liveGps.deviceId,
    };
  } else {
    tracking = {
      isLive:          false,
      currentLocation: isDelivered ? (s.destinations?.[0]?.deliveryLocation || "Delivered") : isInTransit ? "En route" : "—",
      lastUpdated:     isDelivered ? delivered : isInTransit ? dispatched : "—",
      speed:           "—",
      remainingDistance: 0,
      eta:             isDelivered ? "Delivered" : "—",
    };
  }

  return {
    dispatchDate, estimatedDelivery,
    distance: 0,
    vehicleCapacity, vehicleType, vehicleModel,
    driverLicense, driverType,
    items, tracking, timeline,
  };
}

export function ViewShipmentSheet({ open, onOpenChange, shipment, onStatusChange, onEdit }) {
  const [podImages, setPodImages]             = useState([]);
  const [podRemarks, setPodRemarks]           = useState("");
  const [podReceiverName, setPodReceiverName] = useState("");
  const [podUploading, setPodUploading]       = useState(false);
  const [podViewImage, setPodViewImage]       = useState(null);
  const [fullShipment, setFullShipment]       = useState(null);
  const [loadingDetail, setLoadingDetail]     = useState(false);
  const [liveGps, setLiveGps]                 = useState(null);
  const [gpsError, setGpsError]               = useState(null);
  const fileInputRef  = useRef(null);
  const gpsIntervalRef = useRef(null);

  /* ── Fetch shipment detail ── */
  useEffect(() => {
    if (!open || !shipment) return;
    setFullShipment(null);
    setLiveGps(null);
    setGpsError(null);
    setLoadingDetail(true);
    fetch(`${API_BASE_URL}/shipments/${shipment._id}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setFullShipment(res.data); else setFullShipment(shipment); })
      .catch(() => setFullShipment(shipment))
      .finally(() => setLoadingDetail(false));
  }, [open, shipment?._id]);

  /* ── Poll live GPS while sheet is open ── */
  const fetchGps = useCallback(async (vehicleNo) => {
    if (!vehicleNo) return;
    try {
      const res  = await fetch(`${API_BASE_URL}/gps/location/${encodeURIComponent(vehicleNo)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLiveGps(json.data);
        setGpsError(null);
      } else {
        setGpsError("no_data");
      }
    } catch {
      setGpsError("unavailable");
    }
  }, []);

  useEffect(() => {
    const vehicleNo = fullShipment?.vehicleNumber;
    if (!open || !vehicleNo) {
      clearInterval(gpsIntervalRef.current);
      return;
    }
    fetchGps(vehicleNo);
    gpsIntervalRef.current = setInterval(() => fetchGps(vehicleNo), GPS_POLL_MS);
    return () => clearInterval(gpsIntervalRef.current);
  }, [open, fullShipment?.vehicleNumber, fetchGps]);

  if (!shipment) return null;

  const s      = fullShipment ?? shipment;
  const detail = buildDetail(s, liveGps);
  const sc     = statusConfig[s.status] ?? statusConfig["Pending"];

  const totalQty = s.totalQuantity ?? 0;
  const totalWt  = s.totalWeightKg ?? 0;
  const loadUtil = detail?.vehicleCapacity ? Math.round((totalWt / detail.vehicleCapacity) * 100) : 0;

  const firstDest = s.destinations?.[0] ?? {};
  const viewShipment = {
    ...s,
    id:             s.shipmentId ?? s._id,
    status:         s.status,
    dealerName:     firstDest.customerName     || "—",
    dealerLocation: firstDest.deliveryLocation || "—",
    vehicleNumber:  s.vehicleNumber            || (typeof s.vehicleId === "object" ? s.vehicleId?.vehicleNo : "—"),
    vehicleType:    detail?.vehicleType        || "—",
    driverName:     s.driverName               || (typeof s.driverId === "object" ? s.driverId?.name : "—"),
    driverPhone:    s.driverPhone              || (typeof s.driverId === "object" ? s.driverId?.phone : "—"),
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/shipments/${s._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        setFullShipment((prev) => ({ ...(prev ?? s), status: newStatus, ...result.data }));
        if (onStatusChange) onStatusChange(result.data);
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  /* ── GPS accuracy label ── */
  const accLabel = (acc) => acc === 3 ? "High" : acc === 2 ? "Moderate" : acc === 1 ? "Low" : "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-none w-full sm:w-[80%] p-0 gap-0 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white shrink-0">
          <div>
            <SheetTitle className="text-lg tracking-tight">Shipment Details</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
              Complete shipment information and tracking
            </SheetDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* GPS live badge — clearly shows real vs no-signal */}
            {s.status === "In Transit" && (
              liveGps ? (
                <div className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Wifi className="w-3 h-3" />
                  <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  GPS Live · {(liveGps.speed ?? 0).toFixed(1)} km/h
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-500">
                  <WifiOff className="w-3 h-3" />
                  No GPS Signal
                </div>
              )
            )}
            <div className="bg-[#f0f4ff] border border-[#c7d7fe] rounded-lg px-4 py-2">
              <p className="text-[10px] text-[#4b6cb7] tracking-wide uppercase">Shipment ID</p>
              <p className="text-sm text-[#1d4ed8] tracking-tight">{s.shipmentId ?? s._id}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${sc.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
              {s.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-8">

              {/* ── GPS data verification panel ── */}
              {s.status === "In Transit" && (
                liveGps ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Wifi className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-800">Live GPS Data — Device {liveGps.deviceId}</span>
                      <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        REAL DATA
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white rounded-lg px-3 py-2 border border-emerald-100">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Coordinates</p>
                        <p className="text-foreground mt-0.5 tabular-nums">
                          {liveGps.lat?.toFixed(5)}° N<br />{liveGps.lng?.toFixed(5)}° E
                        </p>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 border border-emerald-100">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Speed</p>
                        <p className="text-foreground mt-0.5 tabular-nums text-base">
                          {(liveGps.speed ?? 0).toFixed(1)} km/h
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {liveGps.vehicleStatus}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 border border-emerald-100">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">GPS Quality</p>
                        <p className="text-foreground mt-0.5">
                          {accLabel(liveGps.acc)} accuracy
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {liveGps.satellites} satellites · {liveGps.altitude?.toFixed(1)} m alt
                        </p>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 border border-emerald-100">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Heading · Fix Time</p>
                        <p className="text-foreground mt-0.5">{liveGps.heading?.toFixed(1)}°</p>
                        <p className="text-[10px] text-muted-foreground">
                          {liveGps.fixTime
                            ? new Date(liveGps.fixTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                            : "—"}
                        </p>
                      </div>
                    </div>
                    {/* Google Maps verification link */}
                    <a
                      href={`https://www.google.com/maps?q=${liveGps.lat},${liveGps.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      Verify on Google Maps → {liveGps.lat?.toFixed(5)}, {liveGps.lng?.toFixed(5)}
                    </a>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
                    <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">
                        {gpsError === "no_data"
                          ? "No GPS fix received yet from this vehicle's device."
                          : "GPS service unavailable — check backend connection."}
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Vehicle: {viewShipment.vehicleNumber} · Polling every 10 s
                      </p>
                    </div>
                  </div>
                )
              )}

              <ShipmentOverview shipment={viewShipment} detail={detail} totalQty={totalQty} totalWt={totalWt} />
              <TrackingSection  shipment={viewShipment} detail={detail} />
              <PODSection
                shipment={viewShipment} detail={detail} totalQty={totalQty}
                podImages={podImages}             setPodImages={setPodImages}
                podRemarks={podRemarks}           setPodRemarks={setPodRemarks}
                podReceiverName={podReceiverName} setPodReceiverName={setPodReceiverName}
                podUploading={podUploading}       setPodUploading={setPodUploading}
                podViewImage={podViewImage}       setPodViewImage={setPodViewImage}
                fileInputRef={fileInputRef}
              />
              <VehicleDriverDetails shipment={viewShipment} detail={detail} loadUtil={loadUtil} />
              <ItemsBreakdown       shipment={viewShipment} detail={detail} totalQty={totalQty} totalWt={totalWt} />
              <ShipmentTimeline     detail={detail} />

              {podViewImage && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-8" onClick={() => setPodViewImage(null)}>
                  <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 z-10" onClick={() => setPodViewImage(null)}>
                      <X className="w-4 h-4 text-white" />
                    </button>
                    <img src={podViewImage} alt="POD Preview" className="max-w-full max-h-[80vh] object-contain" />
                  </div>
                </div>
              )}
              <div className="h-4" />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-white px-8 py-4 flex items-center justify-between shrink-0">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex items-center gap-3">
            {s.status === "Pending" && (
              <>
                <Button variant="outline" className="border-border gap-2" onClick={() => handleStatusUpdate("Cancelled")}>
                  <XCircle className="w-4 h-4" />Cancel Shipment
                </Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm" onClick={() => { if (onEdit) onEdit(s); onOpenChange(false); }}>
                  <Edit className="w-4 h-4" />Edit Shipment
                </Button>
              </>
            )}
            {s.status === "In Transit" && (
              <>
                <Button variant="outline" className="border-border gap-2">
                  <Phone className="w-4 h-4" />Contact Driver
                </Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm" onClick={() => handleStatusUpdate("Delivered")}>
                  <CheckCircle2 className="w-4 h-4" />Mark as Delivered
                </Button>
              </>
            )}
            {s.status === "Delivered" && (
              <>
                <Button variant="outline" className="border-border gap-2"><FileText className="w-4 h-4" />View Proof of Delivery</Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"><Download className="w-4 h-4" />Download Invoice</Button>
              </>
            )}
            {s.status === "Cancelled" && (
              <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm" onClick={() => { if (onEdit) onEdit(s); onOpenChange(false); }}>
                <Edit className="w-4 h-4" />Re-create Shipment
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ViewShipmentSheet;
