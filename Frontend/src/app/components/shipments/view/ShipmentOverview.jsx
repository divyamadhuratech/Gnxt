import { Package, Building2, MapPin, Calendar, Clock, Hash, Weight, Navigation } from "lucide-react";
import { SectionLabel, OverviewCell } from "../ui/ShipmentUIComponents";

export function ShipmentOverview({ shipment, detail, totalQty, totalWt }) {
  // For multi-destination shipments, show all destinations
  const destinations = shipment?.destinations ?? [];
  const isMultiDest  = destinations.length > 1;

  // Primary destination for the overview cells
  const primaryDest = destinations[0] ?? {};

  const dealerDisplay = isMultiDest
    ? `${primaryDest.customerName || "—"} +${destinations.length - 1} more`
    : (shipment.dealerName || primaryDest.customerName || "—");

  const locationDisplay = isMultiDest
    ? destinations.map((d) => d.deliveryLocation).filter(Boolean).join(", ") || "—"
    : (shipment.dealerLocation || primaryDest.deliveryLocation || "—");

  return (
    <div>
      <SectionLabel icon={<Package className="w-4 h-4" />} title="Shipment Overview" />
      <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-border">
          <OverviewCell label="Dealer Name"     value={dealerDisplay}              icon={<Building2 className="w-3.5 h-3.5" />} />
          <OverviewCell label="Dealer Location" value={locationDisplay}            icon={<MapPin className="w-3.5 h-3.5" />} />
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
