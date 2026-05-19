import { ArrowLeft, Truck, RefreshCw, Check, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export function VehicleTrackingHeader({
  data,
  ss,
  dispatched,
  onDispatch,
  isPolling,
  lastPoll,
  gpsError,
  onRefresh,
}) {
  const navigate = useNavigate();

  const lastPollStr = lastPoll
    ? lastPoll.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/trips")}
          className="w-9 h-9 rounded-lg border border-border bg-white flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-foreground tracking-tight flex items-center gap-3">
            Vehicle Tracking
            <span className="text-[#1d4ed8]">— {data.vehicleNumber}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
            Real-time tracking for shipment {data.shipmentId}
            {lastPollStr && (
              <span className="text-[10px] text-muted-foreground/60">
                · polled {lastPollStr}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* GPS signal indicator */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
          !gpsError
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-gray-50 text-gray-500 border-gray-200"
        }`}>
          {!gpsError
            ? <Wifi className="w-3 h-3" />
            : <WifiOff className="w-3 h-3" />}
          {!gpsError ? "GPS Live" : "No Signal"}
        </div>

        <Button
          variant="outline"
          className="gap-2 border-border text-muted-foreground hover:text-foreground h-9"
          onClick={onRefresh}
          disabled={isPolling}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        {dispatched ? (
          <Button
            variant="secondary"
            className="gap-2 h-9 cursor-default pointer-events-none bg-emerald-50 text-emerald-700 border border-emerald-200"
            disabled
          >
            <Check className="w-3.5 h-3.5" />
            Dispatched — Departed from Factory
          </Button>
        ) : (
          <Button
            className="gap-2 h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white"
            onClick={onDispatch}
          >
            <Truck className="w-3.5 h-3.5" />
            Dispatch
          </Button>
        )}

        <span
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${ss.bg} ${ss.text}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${ss.dot} ${data.status === "Moving" ? "animate-pulse" : ""}`}
          />
          {data.status}
        </span>
      </div>
    </div>
  );
}

export default VehicleTrackingHeader;
