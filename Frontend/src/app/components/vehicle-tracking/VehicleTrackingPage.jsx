import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router";
import { statusStyles } from "./data/vehicleTrackingData";
import { VehicleTrackingHeader } from "./VehicleTrackingHeader";
import { KpiCards }              from "./KpiCards";
import { TimelineSection }       from "./TimelineSection";
import { QuickActionsPanel }     from "./QuickActionsPanel";

const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
const POLL_INTERVAL_MS = 6_000; // poll every 6 seconds

export function VehicleTrackingPage() {
  const { vehicleId } = useParams();
  const [dispatched, setDispatched]   = useState(false);
  const [activeShipment, setActiveShipment] = useState(null);
  const [isPolling, setIsPolling]     = useState(false);
  const [lastPoll, setLastPoll]       = useState(null);
  const pollRef = useRef(null);

  // Fetch active shipment for this vehicle from MongoDB
  const fetchActiveShipment = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/shipments?limit=100`);
      const json = await res.json();
      if (json.success && json.data) {
        // Find active shipment for this vehicleNumber which is not Returned and not Cancelled
        const active = json.data.find(
          (s) => s.vehicleNumber === vehicleId && s.status !== "Returned" && s.status !== "Cancelled"
        );
        if (active) {
          setActiveShipment(active);
          setDispatched(active.status !== "Pending");
        } else {
          // If no active trip, check if there is a recently returned trip for display
          const recentlyReturned = json.data.find(
            (s) => s.vehicleNumber === vehicleId && s.status === "Returned"
          );
          setActiveShipment(recentlyReturned || null);
          setDispatched(recentlyReturned ? true : false);
        }
      }
    } catch (err) {
      console.error("Error fetching active shipment:", err);
    }
  }, [vehicleId]);

  // Dispatch handler (Transition status from Pending -> In Transit)
  const handleDispatch = async () => {
    if (!activeShipment) return;
    try {
      const res = await fetch(`${API_BASE}/shipments/${activeShipment._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Transit" }),
      });
      const json = await res.json();
      if (json.success) {
        setDispatched(true);
        setActiveShipment(json.data);
      } else {
        alert(json.message || "Dispatch failed");
      }
    } catch (err) {
      console.error("Dispatch failed:", err);
      alert("Error triggering dispatch");
    }
  };

  // Arrived/Returned handler (Transition status from Delivered -> Returned)
  const handleReturn = async () => {
    if (!activeShipment) return;
    try {
      const res = await fetch(`${API_BASE}/shipments/${activeShipment._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Returned" }),
      });
      const json = await res.json();
      if (json.success) {
        setActiveShipment(json.data);
        alert("Vehicle successfully checked back in! Driver and vehicle are now available.");
      } else {
        alert(json.message || "Checking-in failed");
      }
    } catch (err) {
      console.error("Check-in failed:", err);
      alert("Error registering vehicle return");
    }
  };

  // Build movement timeline dynamically based on exact database states requested:
  // 1. shipment planned
  // 2. dispatched from warehouse
  // 3. in transit (after dispatched) both same time
  // 4. cargo delivered
  // 5. returned
  const timeline = [];
  if (activeShipment) {
    // 1. Shipment Planned
    timeline.push({
      step: "Shipment Planned",
      timestamp: activeShipment.createdAt
        ? new Date(activeShipment.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "---",
      completed: true,
      active: activeShipment.status === "Pending",
    });

    // 2. Dispatched from Warehouse
    const isDispatched = activeShipment.status !== "Pending";
    timeline.push({
      step: "Dispatched from Warehouse",
      timestamp: activeShipment.dispatchDate
        ? new Date(activeShipment.dispatchDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "---",
      completed: isDispatched,
      active: false,
    });

    // 3. In Transit (Active at same time when dispatched)
    const isInTransit = activeShipment.status === "In Transit";
    const completedTransit = activeShipment.status === "Delivered" || activeShipment.status === "Returned" || activeShipment.status === "Closed";
    timeline.push({
      step: "In Transit",
      timestamp: activeShipment.dispatchDate
        ? new Date(activeShipment.dispatchDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "---",
      completed: completedTransit || isInTransit,
      active: isInTransit,
      detail: isInTransit ? "Vehicle is actively in transit towards the destination." : null
    });

    // 4. Cargo Delivered (Delivered or Returned or Closed)
    const isDelivered = activeShipment.status === "Delivered" || activeShipment.status === "Returned" || activeShipment.status === "Closed";
    timeline.push({
      step: "Cargo Delivered",
      timestamp: activeShipment.deliveryDate
        ? new Date(activeShipment.deliveryDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "---",
      completed: isDelivered,
      active: activeShipment.status === "Delivered" || activeShipment.status === "Closed",
    });

    // 5. Returned (Completed upon clicking returned button)
    const isReturned = activeShipment.status === "Returned";
    timeline.push({
      step: "Returned",
      timestamp: activeShipment.returnedDate
        ? new Date(activeShipment.returnedDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
        : "---",
      completed: isReturned,
      active: false,
      detail: isReturned ? "Vehicle arrived back at factory/warehouse. Available." : null
    });
  }

  // Resolve dynamic, live details for right side quick actions panel
  const data = {
    vehicleNumber: vehicleId,
    driverName: activeShipment?.driverName || "Unknown",
    driverPhone: activeShipment?.driverPhone || "---",
    status: activeShipment 
      ? (activeShipment.status === "Pending" ? "Waiting for Dispatch" : (activeShipment.status === "In Transit" ? "In Transit" : activeShipment.status)) 
      : "Idle",
    shipmentId: activeShipment?.shipmentId || "---",
    dealerName: activeShipment?.destinations?.[0]?.customerName || "---",
    dealerLocation: activeShipment?.destinations?.[0]?.deliveryLocation || "---",
    timeline,
  };

  const ss = statusStyles[data.status] ?? statusStyles.Idle;

  const triggerRefresh = useCallback(async () => {
    setIsPolling(true);
    await fetchActiveShipment();
    setIsPolling(false);
    setLastPoll(new Date());
  }, [fetchActiveShipment]);

  // Start polling
  useEffect(() => {
    triggerRefresh();
    pollRef.current = setInterval(triggerRefresh, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [triggerRefresh]);

  return (
    <div className="h-full flex flex-col bg-background">
      <VehicleTrackingHeader
        data={data}
        ss={ss}
        onDispatch={handleDispatch}
        onReturn={handleReturn}
        isPolling={isPolling}
        lastPoll={lastPoll}
        onRefresh={triggerRefresh}
        activeShipment={activeShipment}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left content — 3 cols */}
          <div className="xl:col-span-3 space-y-6">
            <KpiCards
              departedTime={activeShipment?.dispatchDate ? new Date(activeShipment.dispatchDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "---"}
              arrivedTime={activeShipment?.returnedDate
                ? new Date(activeShipment.returnedDate).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                : "---"}

            />
            {activeShipment && <TimelineSection data={data} />}
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
