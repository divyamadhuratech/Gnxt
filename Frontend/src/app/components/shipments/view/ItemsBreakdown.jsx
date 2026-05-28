import { useState, useRef, useEffect } from "react";
import {
  Layers, Weight, Hash, CircleDot, Disc, Circle,
  FileCheck, Clock, Upload, Eye, X,
  ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";
import { Separator } from "../../ui/separator";
import { SectionLabel, SummaryPill, DetailField } from "../ui/ShipmentUIComponents";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

// ─── Per-destination POD panel ────────────────────────────────────────────────
function DestinationPOD({ shipment, dest, detail, setPodViewImage, onDeliverySuccess, onRefresh }) {
  // Optimistic confirmed state — initialised from DB, set immediately on success
  // so the button disappears without waiting for the re-fetch
  const [localConfirmed, setLocalConfirmed] = useState(dest.isDelivered ?? false);
  const [podImages, setPodImages]           = useState(dest.podImages || []);
  const [podRemarks, setPodRemarks]         = useState(dest.podRemarks || "");
  const [podReceiverName, setPodReceiverName] = useState(dest.podReceiverName || dest.customerName || "");
  const [saving, setSaving]                 = useState(false);
  const [isExpanded, setIsExpanded]         = useState(false);
  const fileInputRef = useRef(null);

  // Sync from DB whenever dest prop changes (after refresh)
  useEffect(() => {
    if (dest.isDelivered) setLocalConfirmed(true);
    setPodImages(dest.podImages || []);
    setPodRemarks(dest.podRemarks || "");
    setPodReceiverName(dest.podReceiverName || dest.customerName || "");
  }, [dest]);

  // confirmed = either DB says so OR we just clicked it this session
  const confirmed = localConfirmed || dest.isDelivered;

  // Shipment is closed (Delivered) — no more actions allowed
  const shipmentClosed = shipment.status === "Delivered" || shipment.status === "Returned" || shipment.status === "Cancelled";

  const deliveredDateStr = dest.deliveredAt
    ? new Date(dest.deliveredAt).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

  const SERVER_BASE = API_BASE_URL.replace("/api", "");

  // Resolve image src — base64 data URLs work directly, server paths need the base URL
  const resolveImgSrc = (img) =>
    img.startsWith("data:") || img.startsWith("http") ? img : `${SERVER_BASE}${img}`;
  const podRef = dest.lrNumber ? `POD-${dest.lrNumber}` : "—";

  const canConfirm = !!podReceiverName.trim();
  const handleDeliverySuccess = async () => {
    if (!canConfirm || confirmed || saving) return;
    setSaving(true);
    // Optimistically hide the button immediately
    setLocalConfirmed(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/shipments/${shipment._id}/destination/${dest._id}/delivery`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverName: podReceiverName, remarks: podRemarks }),
        }
      );
      const json = await res.json();
      if (json.success) {
        if (onDeliverySuccess) onDeliverySuccess();
        if (onRefresh) onRefresh();
      } else {
        // Rollback optimistic update on failure
        setLocalConfirmed(false);
        alert(json.message || "Failed to confirm delivery");
      }
    } catch (err) {
      setLocalConfirmed(false);
      console.error("Delivery confirmation error", err);
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Submit POD ──────────────────────────────────────────────────────────────
  const handleSubmitPod = async () => {
    if (podImages.length === 0 || saving) return;
    setSaving(true);
    try {
      // Upload each image via multipart to /api/upload, collect URLs
      const uploadedUrls = [];
      for (const imgDataUrl of podImages) {
        // Only upload if it's a base64 data URL (not already a server URL)
        if (imgDataUrl.startsWith("data:")) {
          const response = await fetch(imgDataUrl);
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("file", blob, `pod-${Date.now()}.jpg`);

          const serverBase = API_BASE_URL.replace("/api", "");
          const uploadRes = await fetch(`${serverBase}/api/upload`, {
            method: "POST",
            body: formData,
          });
          const uploadJson = await uploadRes.json();
          if (uploadJson.url) {
            uploadedUrls.push(uploadJson.url);
          }
        } else {
          // Already a server URL — keep as-is
          uploadedUrls.push(imgDataUrl);
        }
      }

      // Submit POD with server file URLs
      const res = await fetch(
        `${API_BASE_URL}/shipments/${shipment._id}/destination/${dest._id}/pod`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverName: podReceiverName,
            remarks: podRemarks,
            podImages: uploadedUrls,
          }),
        }
      );
      const json = await res.json();
      if (json.success) {
        if (onRefresh) onRefresh();
      } else {
        alert(json.message || "Failed to submit POD");
      }
    } catch (err) {
      console.error("POD submit error", err);
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Badge config ────────────────────────────────────────────────────────────
  const getBadge = () => {
    if (dest.podStatus === "Submitted")
      return { style: "bg-emerald-50 text-emerald-700 border-emerald-200", text: "Signed", icon: <CheckCircle2 className="w-3 h-3" /> };
    if (confirmed && !shipmentClosed)
      return { style: "bg-amber-50 text-amber-700 border-amber-200", text: "Pending", icon: <Clock className="w-3 h-3" /> };
    if (shipmentClosed && confirmed)
      return { style: "bg-gray-50 text-gray-500 border-gray-200", text: "Not Generated", icon: null };
    if (shipment.status === "Cancelled")
      return { style: "bg-gray-50 text-gray-400 border-gray-200", text: "N/A", icon: null };
    return { style: "bg-gray-50 text-gray-500 border-gray-200", text: "Not Generated", icon: null };
  };

  const badge = getBadge();

  // ── Subtitle ────────────────────────────────────────────────────────────────
  const getSubtitle = () => {
    if (dest.podStatus === "Submitted")   return "POD submitted and verified";
    if (confirmed && !shipmentClosed)     return "Delivery confirmed — awaiting POD upload";
    if (shipmentClosed)                   return "Shipment closed";
    if (shipment.status === "In Transit") return "Awaiting delivery confirmation";
    if (shipment.status === "Cancelled")  return "Shipment cancelled — POD not applicable";
    return "Pending dispatch — POD not yet generated";
  };

  return (
    <div className="bg-[#f8fafc] border-t border-border px-5 py-4">
      {/* ── Collapsible header ── */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            dest.podStatus === "Submitted" ? "bg-emerald-100"
            : confirmed ? "bg-amber-100"
            : "bg-gray-200"
          }`}>
            <FileCheck className={`w-4 h-4 ${
              dest.podStatus === "Submitted" ? "text-emerald-600"
              : confirmed ? "text-amber-600"
              : "text-gray-500"
            }`} />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              POD Details — {dest.customerName || dest.plantReferenceNumber || "Destination"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{getSubtitle()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${badge.style}`}>
            {badge.icon}{badge.text}
          </span>
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {/* ── Expanded content ── */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-5">

          {/* Delivery confirmed summary */}
          {confirmed && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailField label="Receiver Name"    value={podReceiverName || "—"} />
              <DetailField label="Received Date"    value={deliveredDateStr} />
              <DetailField label="POD Reference">
                <span className="text-sm text-[#1d4ed8]">{podRef}</span>
              </DetailField>
              <DetailField label="Delivery Remarks" value={podRemarks || "—"} />
            </div>
          )}

          {/* POD images */}
          {podImages.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">
                Dispatch Proof Images
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {podImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl border border-border overflow-hidden bg-white aspect-[4/3]">
                    <img src={resolveImgSrc(img)} alt={`POD ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white"
                        onClick={(e) => { e.stopPropagation(); setPodViewImage(img); }}
                      >
                        <Eye className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Upload + action form ──
              Show when: shipment is In Transit AND POD not yet submitted
              - "Delivery Success" button: only if NOT yet confirmed
              - "Submit POD" button: only if confirmed (delivery done) but POD not submitted
              - Both hidden once shipment is closed
          ── */}
          {shipment.status === "In Transit" && dest.podStatus !== "Submitted" && (
            <div className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#1d4ed8]" />
                  <p className="text-xs text-foreground font-medium">
                    {confirmed ? "Upload POD Documents" : "Upload POD Documents for this Destination"}
                  </p>
                </div>
                {podImages.length > 0 && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-md border-[#c7d7fe] text-[#4338ca] bg-[#eef2ff]">
                    {podImages.length} uploaded
                  </Badge>
                )}
              </div>

              {/* Drop zone — only show if POD not yet submitted */}
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-3 hover:border-[#1d4ed8]/40 hover:bg-[#fafbfe] transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center">
                  <Upload className="w-4 h-4 text-[#1d4ed8]" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground">Click to upload POD images</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Supports JPG, PNG, PDF — Max 5MB</p>
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
                          if (ev.target?.result) setPodImages((prev) => [...prev, ev.target.result]);
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Uploaded thumbnails */}
              {podImages.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                  {podImages.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl border border-border overflow-hidden bg-white aspect-[4/3]">
                      <img src={resolveImgSrc(img)} alt={`POD ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white"
                          onClick={(e) => { e.stopPropagation(); setPodViewImage(img); }}>
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-500"
                          onClick={(e) => { e.stopPropagation(); setPodImages((prev) => prev.filter((_, i) => i !== idx)); }}>
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Receiver + Remarks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Receiver Name {!confirmed && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter receiver's name..."
                    value={podReceiverName}
                    onChange={(e) => setPodReceiverName(e.target.value)}
                    readOnly={confirmed}
                    className={`w-full h-9 px-3 text-sm border border-border rounded-lg transition-colors ${
                      confirmed
                        ? "bg-gray-50 text-muted-foreground cursor-default"
                        : "bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]"
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Remarks</label>
                  <input
                    type="text"
                    placeholder="Add delivery remarks..."
                    value={podRemarks}
                    onChange={(e) => setPodRemarks(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-4">
                {/* Delivery Success — hidden after confirmed, shown only once */}
                {!confirmed && (
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    disabled={!canConfirm || saving}
                    onClick={handleDeliverySuccess}
                  >
                    {saving
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? "Confirming..." : "Delivery Success"}
                  </Button>
                )}

                {/* Submit POD — always shown until shipment closes, enabled when images uploaded */}
                <Button
                  className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"
                  disabled={podImages.length === 0 || saving}
                  onClick={handleSubmitPod}
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <FileCheck className="w-4 h-4" />}
                  {saving ? "Submitting..." : "Submit POD"}
                </Button>
              </div>
            </div>
          )}

          {/* Closed shipment — show submitted POD info if available */}
          {shipmentClosed && dest.podStatus === "Submitted" && podImages.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              POD submitted successfully for this destination.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ItemsBreakdown ──────────────────────────────────────────────────────
export function ItemsBreakdown({ shipment, detail, totalQty, totalWt, setPodViewImage, onStatusUpdate, onAllDelivered, onRefresh }) {
  const destinations = shipment?.destinations ?? [];

  const handleDeliverySuccess = (_idx) => {
    // onRefresh will re-fetch the shipment and check allDelivered inside refreshShipment
    // No need to check locally — the DB is the source of truth
  };

  const tyreCount =
    destinations.reduce((s, d) => s + (d.totalTyres || 0), 0) ||
    detail.items.filter((i) => i.type === "Tyre").reduce((s, i) => s + i.quantity, 0);
  const flapCount =
    destinations.reduce((s, d) => s + (d.totalFlaps || 0), 0) ||
    detail.items.filter((i) => i.type === "Flap").reduce((s, i) => s + i.quantity, 0);
  const tubeCount =
    destinations.reduce((s, d) => s + (d.totalTubes || 0), 0) ||
    detail.items.filter((i) => i.type === "Tube").reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <SectionLabel icon={<Layers className="w-4 h-4" />} title="Shipment Items Breakdown" />
      <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
        {/* Summary */}
        <div className="bg-[#fafbfc] px-5 py-3 space-y-2.5">
          <div className="flex items-center gap-6">
            <SummaryPill icon={<Weight className="w-3.5 h-3.5 text-[#1d4ed8]" />} label="Total Weight" value={`${totalWt} kg`} />
            <SummaryPill icon={<Hash className="w-3.5 h-3.5 text-[#1d4ed8]" />}   label="Total Items"  value={`${totalQty}`} />
          </div>
          <Separator />
          <div className="flex items-center gap-6">
            <SummaryPill icon={<CircleDot className="w-3.5 h-3.5 text-blue-600" />}  label="Total Tyres" value={`${tyreCount}`} />
            <SummaryPill icon={<Disc className="w-3.5 h-3.5 text-amber-600" />}       label="Total Flaps" value={`${flapCount}`} />
            <SummaryPill icon={<Circle className="w-3.5 h-3.5 text-violet-600" />}    label="Total Tubes" value={`${tubeCount}`} />
          </div>
        </div>

        {/* Per-destination rows */}
        {destinations.length > 0 && (
          <div className="divide-y divide-border">
            {destinations.map((dest, idx) => (
              <div key={dest._id ?? idx} className="flex flex-col">
                <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Destination {idx + 1}</p>
                    <p className="text-sm text-foreground mt-0.5">{dest.customerName || dest.plantReferenceNumber || "—"}</p>
                    {dest.deliveryLocation && <p className="text-xs text-muted-foreground">{dest.deliveryLocation}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LR Number</p>
                    <p className="text-sm text-[#1d4ed8] mt-0.5">{dest.lrNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Items</p>
                    <p className="text-sm text-foreground mt-0.5">
                      {[
                        dest.totalTyres > 0 && `${dest.totalTyres} Tyres`,
                        dest.totalTubes > 0 && `${dest.totalTubes} Tubes`,
                        dest.totalFlaps > 0 && `${dest.totalFlaps} Flaps`,
                      ].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight</p>
                    <p className="text-sm text-foreground mt-0.5">{dest.weightKg ?? 0} kg</p>
                  </div>
                </div>

                <DestinationPOD
                  shipment={shipment}
                  dest={dest}
                  detail={detail}
                  setPodViewImage={setPodViewImage}
                  onDeliverySuccess={() => handleDeliverySuccess(idx)}
                  onRefresh={onRefresh}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemsBreakdown;
