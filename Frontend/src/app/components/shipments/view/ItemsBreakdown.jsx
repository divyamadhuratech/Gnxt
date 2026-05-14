import { Layers, Weight, Hash, CircleDot, Disc, Circle } from "lucide-react";
import { Separator } from "../../ui/separator";
import { SectionLabel, SummaryPill } from "../ui/ShipmentUIComponents";

export function ItemsBreakdown({ detail, totalQty, totalWt }) {
  const tyreCount = detail.items.filter((i) => i.type === "Tyre").reduce((s, i) => s + i.quantity, 0);
  const flapCount = detail.items.filter((i) => i.type === "Flap").reduce((s, i) => s + i.quantity, 0);
  const tubeCount = detail.items.filter((i) => i.type === "Tube").reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <SectionLabel icon={<Layers className="w-4 h-4" />} title="Shipment Items Breakdown" />
      <div className="mt-3 bg-white border border-border rounded-xl overflow-hidden">
        <div className="bg-[#fafbfc] px-5 py-3 space-y-2.5">
          <div className="flex items-center gap-6">
            <SummaryPill icon={<Weight className="w-3.5 h-3.5 text-[#1d4ed8]" />} label="Total Weight" value={`${totalWt} kg`} />
            <SummaryPill icon={<Hash className="w-3.5 h-3.5 text-[#1d4ed8]" />}   label="Total Items"  value={`${totalQty}`} />
          </div>
          <Separator />
          <div className="flex items-center gap-6">
            <SummaryPill icon={<CircleDot className="w-3.5 h-3.5 text-blue-600" />}   label="Total Tyres" value={`${tyreCount}`} />
            <SummaryPill icon={<Disc className="w-3.5 h-3.5 text-amber-600" />}        label="Total Flaps" value={`${flapCount}`} />
            <SummaryPill icon={<Circle className="w-3.5 h-3.5 text-violet-600" />}     label="Total Tubes" value={`${tubeCount}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemsBreakdown;
