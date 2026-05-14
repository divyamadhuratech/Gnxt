import { Truck, Activity, Clock, MapPin } from "lucide-react";

function KpiCard({ icon, label, value, sub, highlight }) {
  const highlightBorder = highlight
    ? highlight === "emerald"
      ? "border-emerald-200"
      : highlight === "amber"
        ? "border-amber-200"
        : "border-red-200"
    : "border-border";

  return (
    <div className={`bg-white border rounded-xl p-4 space-y-2 ${highlightBorder}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#f0f4ff] border border-[#dbe4ff] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div>
        <p className="text-2xl text-foreground tabular-nums">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export function TripKpiCards({ statusCounts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        icon={<Truck className="w-4 h-4 text-[#1d4ed8]" />}
        label="Total Vehicles"
        value={`${statusCounts.all}`}
        sub="Across all trips"
      />
      <KpiCard
        icon={<Activity className="w-4 h-4 text-emerald-500" />}
        label="Moving"
        value={`${statusCounts.Moving}`}
        sub="Currently on road"
        highlight="emerald"
      />
      <KpiCard
        icon={<Clock className="w-4 h-4 text-amber-500" />}
        label="Idle"
        value={`${statusCounts.Idle}`}
        sub="Awaiting dispatch"
        highlight="amber"
      />
      <KpiCard
        icon={<MapPin className="w-4 h-4 text-red-500" />}
        label="Stopped"
        value={`${statusCounts.Stopped}`}
        sub="Delivered / halted"
        highlight="red"
      />
    </div>
  );
}
export default TripKpiCards;
