import { Map, Building2, MapPin, Truck, CheckCircle2, Radio } from "lucide-react";
import { SectionLabel, TrackingRow } from "../ui/ShipmentUIComponents";

export function TrackingSection({ shipment, detail }) {
  return (
    <div>
      <SectionLabel icon={<Map className="w-4 h-4" />} title="Location & GPS Tracking" />
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Map placeholder */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] border border-[#c7d7fe] rounded-xl flex flex-col items-center justify-center min-h-[260px] p-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-[#1d4ed8] flex items-center justify-center shadow-md">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-[#4338ca]">Warehouse</span>
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${shipment.status === "Delivered" ? "bg-emerald-500" : "bg-[#6366f1]/30"}`}>
                  <MapPin className={`w-5 h-5 ${shipment.status === "Delivered" ? "text-white" : "text-[#4338ca]"}`} />
                </div>
                <span className="text-[10px] text-[#4338ca]">Dealer</span>
              </div>
            </div>
            <p className="text-xs text-[#6366f1]/70 mt-2">
              {shipment.status === "Delivered" ? "Route completed" : shipment.status === "In Transit" ? "Vehicle en route" : "Awaiting dispatch"}
            </p>
          </div>
        </div>

        {/* Tracking info */}
        <div className="lg:col-span-2 space-y-3">
          {shipment.status === "Delivered" ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col items-center gap-3 h-full justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-emerald-800">Delivered Successfully</p>
                <p className="text-xs text-emerald-600 mt-1">
                  {detail.timeline.find((t) => t.step === "Delivered")?.timestamp}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-xl divide-y divide-border h-full flex flex-col">
              <div className="px-4 py-3 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Live Tracking</span>
              </div>
              <TrackingRow label="Current Location"   value={detail.tracking.currentLocation} />
              <TrackingRow label="Last Updated"        value={detail.tracking.lastUpdated} />
              <TrackingRow label="Current Speed"       value={detail.tracking.speed} />
              <TrackingRow label="Remaining Distance"  value={`${detail.tracking.remainingDistance} km`} />
              <TrackingRow label="ETA"                 value={detail.tracking.eta} highlight />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackingSection;
