import { FileCheck, Clock, Camera, FileText, Image, Eye, Download, Upload, X } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { SectionLabel, DetailField } from "../ui/ShipmentUIComponents";

export function PODSection({
  shipment,
  detail,
  totalQty,
  podImages,
  setPodImages,
  podRemarks,
  setPodRemarks,
  podReceiverName,
  setPodReceiverName,
  podUploading,
  setPodUploading,
  podViewImage,
  setPodViewImage,
  fileInputRef,
}) {
  // Delivery timestamp from timeline
  const deliveredTimestamp =
    detail?.timeline?.find((t) => t.step === "Delivered")?.timestamp ?? "—";

  // POD reference derived from shipment ID
  const podRef = shipment.shipmentId
    ? `POD-${shipment.shipmentId.replace("SHP-", "")}`
    : shipment.id
    ? `POD-${shipment.id.replace("SHP-", "")}`
    : "—";

  return (
    <div>
      <SectionLabel icon={<FileCheck className="w-4 h-4" />} title="Proof of Dispatch (POD)" />
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
              <><FileCheck className="w-3 h-3" /> Signed</>
            ) : shipment.status === "In Transit" ? (
              <><Clock className="w-3 h-3" /> Pending</>
            ) : shipment.status === "Cancelled" ? (
              "N/A"
            ) : (
              "Not Generated"
            )}
          </span>
        </div>

        {/* POD Details — Delivered only */}
        {shipment.status === "Delivered" && (
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Receiver name — from podReceiverName state (filled by admin) or blank */}
              <DetailField
                label="Receiver Name"
                value={podReceiverName || "—"}
              />
              <DetailField label="Received Date"  value={deliveredTimestamp} />
              <DetailField label="POD Reference">
                <span className="text-sm text-[#1d4ed8]">{podRef}</span>
              </DetailField>
              <DetailField
                label="Delivery Remarks"
                value={podRemarks || "—"}
              />
            </div>

            {/* Proof images — only user-uploaded ones */}
            {podImages.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2.5">
                  Dispatch Proof Images
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                          className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center hover:bg-white"
                          onClick={() => setPodViewImage(img)}
                        >
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-500"
                          onClick={() =>
                            setPodImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin Upload Area */}
        <div className="border-t border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#1d4ed8]" />
              <p className="text-xs text-foreground">Admin: Upload POD Documents</p>
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
              <p className="text-sm text-foreground">Click to upload POD images</p>
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
                      if (ev.target?.result)
                        setPodImages((prev) => [...prev, ev.target.result]);
                    };
                    reader.readAsDataURL(file);
                  });
                }
                e.target.value = "";
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {[
              {
                label: "Receiver Name",
                placeholder: "Enter receiver's name...",
                value: podReceiverName,
                onChange: setPodReceiverName,
              },
              {
                label: "Remarks",
                placeholder: "Add delivery remarks...",
                value: podRemarks,
                onChange: setPodRemarks,
              },
            ].map(({ label, placeholder, value, onChange }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"
              disabled={podImages.length === 0 && !podReceiverName && !podRemarks}
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
  );
}

export default PODSection;
