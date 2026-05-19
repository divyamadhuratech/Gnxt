import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { vehicleTrackingData, fallbackData, statusStyles } from "./data/vehicleTrackingData";
import { VehicleTrackingHeader } from "./VehicleTrackingHeader";
import { KpiCards }              from "./KpiCards";
import { LiveMapSection }        from "./LiveMapSection";
import { FuelInfoSection }       from "./FuelInfoSection";
import { TimelineSection }       from "./TimelineSection";
import { QuickActionsPanel }     from "./QuickActionsPanel";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
const POLL_INTERVAL_MS = 10_000; // poll every 10 seconds

/**
 * Merge live GPS data into the tracking data shape the UI expects.
 * Only overrides fields that the GPS provides — keeps shipment/dealer
 * info from the shipment record or mock data.
 */
function mergeGpsIntoData(base, gps) {
  if (!gps) return base;

  const speedKmh = gps.speed ?? 0;
  const status   = gps.vehicleStatus ?? (speedKmh > 2 ? "Moving" : "Stopped");

  const lastUpdated = gps.fixTime
    ? new Date(gps.fixTime).toLocaleString("en-IN", {
        hour: "2-digit", minute: "2-digit",
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  return {
    ...base,
    status,
    currentSpeed: `${speedKmh.toFixed(1)} km/h`,
    currentLocation: {
      area:        gps.lat != null ? `${gps.lat.toFixed(5)}° N, ${gps.lng.toFixed(5)}° E` : base.currentLocation?.area,
      lat:         gps.lat?.toFixed(6) ?? base.currentLocation?.lat,
      lng:         gps.lng?.toFixed(6) ?? base.currentLocation?.lng,
      lastUpdated,
    },
    // GPS accuracy badge
    gpsAcc:      gps.acc,
    satellites:  gps.satellites,
    heading:     gps.heading,
    altitude:    gps.altitude,
    hasLiveGps:  true,
  };
}

export function VehicleTrackingPage() {
  const { vehicleId } = useParams();
  const [dispatched, setDispatched]   = useState(false);
  const [gpsData, setGpsData]         = useState(null);
  const [gpsError, setGpsError]       = useState(null);
  const [lastPoll, setLastPoll]       = useState(null);
  const [isPolling, setIsPolling]     = useState(false);
  const pollRef = useRef(null);

  // Base data — from mock map or fallback
  const mockBase = vehicleTrackingData[vehicleId ?? ""] ?? {
    ...fallbackData,
    vehicleNumber: vehicleId ?? "Unknown",
  };

  // Merge live GPS on top of base
  const data = mergeGpsIntoData(mockBase, gpsData);
  const ss   = statusStyles[data.status] ?? statusStyles.Idle;

  // Fetch latest GPS fix for this vehicle
  const fetchGps = useCallback(async () => {
    if (!vehicleId) return;
    setIsPolling(true);
    try {
      // vehicleId in the URL is the vehicle reg number (e.g. KL07DC9716)
      const res  = await fetch(`${API_BASE}/gps/location/${encodeURIComponent(vehicleId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setGpsData(json.data);
        setGpsError(null);
      } else {
        setGpsError("No GPS data yet");
      }
    } catch {
      setGpsError("GPS unavailable");
    } finally {
      setIsPolling(false);
      setLastPoll(new Date());
    }
  }, [vehicleId]);

  // Start polling on mount, stop on unmount
  useEffect(() => {
    fetchGps();
    pollRef.current = setInterval(fetchGps, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchGps]);

  return (
    <div className="h-full flex flex-col bg-background">
      <VehicleTrackingHeader
        data={data}
        ss={ss}
        dispatched={dispatched}
        onDispatch={() => setDispatched(true)}
        isPolling={isPolling}
        lastPoll={lastPoll}
        gpsError={gpsError}
        onRefresh={fetchGps}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Live GPS status banner */}
        {gpsData ? (
          <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              Live GPS active — {data.currentSpeed} · Satellites: {data.satellites ?? "—"} ·
              Accuracy: {data.gpsAcc === 3 ? "High" : data.gpsAcc === 2 ? "Moderate" : data.gpsAcc === 1 ? "Low" : "—"} ·
              Heading: {data.heading != null ? `${data.heading}°` : "—"} ·
              Altitude: {data.altitude != null ? `${data.altitude} m` : "—"}
            </span>
          </div>
        ) : gpsError ? (
          <div className="mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-sm text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              {gpsError === "No GPS data yet"
                ? "No GPS fix received yet — showing last known data. Waiting for device to transmit."
                : "GPS connection unavailable — showing last known data."}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left content — 3 cols */}
          <div className="xl:col-span-3 space-y-6">
            <KpiCards       data={data} />
            <LiveMapSection data={data} />
            <FuelInfoSection data={data} />
            <TimelineSection data={data} />
          </div>

          {/* Right sidebar — 1 col */}
          <div className="xl:col-span-1">
            <QuickActionsPanel data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleTrackingPage;
