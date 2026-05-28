import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { TooltipProvider } from "../ui/tooltip";
import { TripHeader } from "./TripHeader";
import { TripKpiCards } from "./TripKpiCards";
import { TripFiltersBar } from "./TripFiltersBar";
import { TripTable } from "./TripTable";
import { statusStyles } from "./data/tripData";

const API_BASE_URL = "http://localhost:5000/api";

export function TripTrackingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [showNotDispatched, setShowNotDispatched] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, shipmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/vehicles`),
        axios.get(`${API_BASE_URL}/shipments?limit=100`),
      ]);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (shipmentsRes.data.success) setShipments(shipmentsRes.data.data);
    } catch (error) {
      console.error("Error fetching trip tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedVehicles = () => {
    return vehicles.map(vehicle => {
      // Find the most recent shipment for this vehicle (any status)
      const allVehicleShipments = shipments.filter(
        s => s.vehicleNumber === vehicle.vehicleNo
      );
      // Active = In Transit, Pending, or Delivered (vehicle still on road)
      const activeShipment = allVehicleShipments.find(
        s => s.status === "In Transit" || s.status === "Pending" || s.status === "Delivered"
      );
      // Most recent returned shipment (if no active one)
      const returnedShipment = !activeShipment
        ? allVehicleShipments.find(s => s.status === "Returned")
        : null;

      const relevantShipment = activeShipment || returnedShipment;

      // Derive display status from shipment status first, then vehicle status
      let finalStatus;
      if (relevantShipment?.status === "In Transit") {
        finalStatus = "Moving";
      } else if (relevantShipment?.status === "Delivered") {
        // Shipment delivered but vehicle not yet returned — still Moving
        finalStatus = "Moving";
      } else if (relevantShipment?.status === "Returned") {
        finalStatus = "Returned";
      } else if (relevantShipment?.status === "Pending") {
        finalStatus = "Waiting for Dispatch";
      } else {
        // No relevant shipment — fall back to vehicle hardware status
        const vehicleStatusMap = {
          "In Transit":  "Moving",
          "Idle":        "Waiting for Dispatch",
          "Maintenance": "Waiting for Dispatch",
          "Breakdown":   "Waiting for Dispatch",
        };
        finalStatus = vehicleStatusMap[vehicle.status] || "Waiting for Dispatch";
      }

      const isDispatched = finalStatus === "Moving";
      const vehicleType  = vehicle.ownership === "Company" ? "Own" : "Rented";

      return {
        vehicleNumber: vehicle.vehicleNo,
        driverName:    relevantShipment?.driverName  || "—",
        driverPhone:   relevantShipment?.driverPhone || "---",
        shipmentId:    relevantShipment?.shipmentId  || "---",
        dealerName:    relevantShipment?.destinations?.[0]?.customerName    || "---",
        dealerLocation:relevantShipment?.destinations?.[0]?.deliveryLocation || "---",
        status:        finalStatus,
        departedTime:  relevantShipment?.dispatchDate
          ? new Date(relevantShipment.dispatchDate).toLocaleString("en-IN", {
              hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short",
            })
          : "---",
        vehicleType,
        dispatched: isDispatched,
      };
    });
  };

  const combinedVehicles = getCombinedVehicles();

  const filteredVehicles = combinedVehicles.filter((v) => {
    const matchesSearch =
      searchQuery === "" ||
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dealerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dealerLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus   = statusFilter === "all" || v.status === statusFilter;
    const matchesType     = vehicleTypeFilter === "all" || v.vehicleType === vehicleTypeFilter;
    const matchesDispatch = showNotDispatched ? !v.dispatched : true;

    return matchesSearch && matchesStatus && matchesType && matchesDispatch;
  });

  const statusCounts = {
    all:                  combinedVehicles.length,
    Moving:               combinedVehicles.filter((v) => v.status === "Moving").length,
    "Waiting for Dispatch": combinedVehicles.filter((v) => v.status === "Waiting for Dispatch").length,
    Returned:             combinedVehicles.filter((v) => v.status === "Returned").length,
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col p-6 gap-6">
        <TripHeader totalVehicles={combinedVehicles.length} />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading trip tracking details...</p>
          </div>
        ) : (
          <>
            <TripKpiCards statusCounts={statusCounts} />
            <TripFiltersBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              vehicleTypeFilter={vehicleTypeFilter}
              setVehicleTypeFilter={setVehicleTypeFilter}
              showNotDispatched={showNotDispatched}
              setShowNotDispatched={setShowNotDispatched}
              filteredVehicles={filteredVehicles}
              statusCounts={statusCounts}
            />
            <TripTable
              filteredVehicles={filteredVehicles}
              onNavigate={(vehicleNumber) => navigate(`/tracking/${vehicleNumber}`)}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}
export default TripTrackingPage;
