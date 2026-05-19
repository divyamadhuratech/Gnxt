import { Calendar, Clock, Route, Navigation, Timer, Target } from "lucide-react";
import { KpiCard } from "./VehicleTrackingUIComponents";

export function KpiCards({ data }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <KpiCard
        icon={<Calendar className="w-4 h-4 text-[#1d4ed8]" />}
        label="Departed Time"
        value={data.departedTime}
      />
      <KpiCard
        icon={<Clock className="w-4 h-4 text-[#1d4ed8]" />}
        label="Est. Delivery Time"
        value={data.estimatedDelivery}
      />
      <KpiCard
        icon={<Route className="w-4 h-4 text-emerald-500" />}
        label="Distance Covered"
        value={`${data.distanceCovered} km`}
      />
      <KpiCard
        icon={<Navigation className="w-4 h-4 text-amber-500" />}
        label="Remaining Distance"
        value={`${data.remainingDistance} km`}
      />
      <KpiCard
        icon={<Timer className="w-4 h-4 text-violet-500" />}
        label="ETA (Arrival)"
        value={data.eta}
      />

      {/* Progress card — custom layout */}
      <div className="bg-white border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-[#1d4ed8]" />
          </div>
          <span className="text-xs text-muted-foreground">% Completed</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl text-foreground tabular-nums">
            {data.percentComplete}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              data.percentComplete === 100 ? "bg-emerald-500" : "bg-[#1d4ed8]"
            }`}
            style={{ width: `${data.percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default KpiCards;
