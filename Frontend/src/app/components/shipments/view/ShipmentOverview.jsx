import { Package, Building2, MapPin, Calendar, Clock, Hash, Weight, Navigation } from "lucide-react";
import { SectionLabel, OverviewCell } from "../ui/ShipmentUIComponents";

export function ShipmentOverview({ shipment, detail, totalQty, totalWt }) {
  // For multi-destination shipments, show all destinations
  const destinations = shipment?.destinations ?? [];
  const isMultiDest  = destinations.length > 1;

  // Primary destination for the overview cells
  const primaryDest = destinations[0] ?? {};

  return (
    <div>
      <SectionLabel icon={<Package className="w-4 h-4" />} title="Shipment Overview" />
      <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-x divide-border">
          <OverviewCell label="Customer Name" icon={<Building2 className="w-3.5 h-3.5" />}>
            {isMultiDest ? (
              <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto pr-1">
                {destinations.map((d, idx) => (
                  <span key={idx} className="bg-blue-50 text-[#1d4ed8] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200" title={d.customerName}>
                    {d.customerName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground font-semibold truncate mt-0.5">{shipment.dealerName || primaryDest.customerName || "—"}</p>
            )}
          </OverviewCell>
          <OverviewCell label="Dealer Location" icon={<MapPin className="w-3.5 h-3.5" />}>
            {isMultiDest ? (
              <div className="flex flex-wrap gap-1 mt-1 max-h-[80px] overflow-y-auto pr-1">
                {destinations.map((d, idx) => (
                  <span key={idx} className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200" title={d.deliveryLocation}>
                    {d.deliveryLocation}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground font-semibold truncate mt-0.5">{shipment.dealerLocation || primaryDest.deliveryLocation || "—"}</p>
            )}
          </OverviewCell>
          <OverviewCell label="Dispatch Date"   value={detail.dispatchDate}        icon={<Calendar className="w-3.5 h-3.5" />} />
        </div>
        <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
          <OverviewCell label="Total Quantity" value={`${totalQty} units`}         icon={<Hash className="w-3.5 h-3.5" />} />
          <OverviewCell label="Total Weight"   value={`${totalWt} kg`}             icon={<Weight className="w-3.5 h-3.5" />} />
          <OverviewCell label="Destinations"   value={`${destinations.length}`}    icon={<Navigation className="w-3.5 h-3.5" />} />
        </div>
      </div>
    </div>
  );
}

export default ShipmentOverview;
