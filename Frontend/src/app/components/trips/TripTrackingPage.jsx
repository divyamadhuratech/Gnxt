import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { format } from "date-fns";
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
  const [gpsLocations, setGpsLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, shipmentsRes, gpsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/vehicles`),
        axios.get(`${API_BASE_URL}/shipments?limit=100`),
        axios.get(`${API_BASE_URL}/gps/all`)
      ]);

      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (shipmentsRes.data.success) setShipments(shipmentsRes.data.data);
      if (gpsRes.data.success) setGpsLocations(gpsRes.data.data);
    } catch (error) {
      console.error("Error fetching trip tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedVehicles = () => {
    return vehicles.map(vehicle => {
      // Find active shipment for this vehicle
      const activeShipment = shipments.find(
        s => s.vehicleNumber === vehicle.vehicleNo && s.status !== "Delivered" && s.status !== "Cancelled"
      );

      // Find GPS location for this vehicle
      const gps = gpsLocations.find(g => g.vehicleNo === vehicle.vehicleNo);

      const isDispatched = vehicle.status === "In Transit";
      const statusMap = {
        "In Transit": gps?.speed > 2 ? "Moving" : "Stopped",
        "Idle": "Idle",
        "Maintenance": "Stopped",
        "Breakdown": "Stopped"
      };

      const finalStatus = statusMap[vehicle.status] || "Idle";

      const vehicleType = vehicle.ownership === "Company" ? "Own" : "Rented";

      return {
        vehicleNumber: vehicle.vehicleNo,
        driverName: activeShipment?.driverName || "Idle Driver",
        driverPhone: activeShipment?.driverPhone || "---",
        shipmentId: activeShipment?.shipmentId || "---",
        dealerName: activeShipment?.destinations?.[0]?.customerName || "---",
        dealerLocation: activeShipment?.destinations?.[0]?.deliveryLocation || "---",
        origin: "Mumbai Warehouse, Bhiwandi",
        status: finalStatus,
        currentLocation: gps?.lat != null ? `${gps.lat.toFixed(4)}° N, ${gps.lng.toFixed(4)}° E` : "Mumbai Warehouse, Bhiwandi",
        currentSpeed: gps?.speed != null ? `${gps.speed.toFixed(1)} km/h` : "0 km/h",
        avgSpeed: gps?.speed != null ? `${Math.max(10, gps.speed * 0.9).toFixed(1)} km/h` : "0 km/h",
        totalDistance: activeShipment ? 200 : 0, // Mock base distance for active trips
        distanceCovered: activeShipment ? (gps?.speed > 0 ? 120 : 0) : 0,
        remainingDistance: activeShipment ? (gps?.speed > 0 ? 80 : 200) : 0,
        percentComplete: activeShipment ? (gps?.speed > 0 ? 60 : 0) : 0,
        eta: activeShipment ? "2h 30m" : "---",
        departedTime: activeShipment?.dispatchDate ? format(new Date(activeShipment.dispatchDate), "hh:mm a") : "---",
        lastUpdated: gps?.fixTime ? format(new Date(gps.fixTime), "hh:mm a") : "---",
        vehicleType,
        delay: null,
        dispatched: isDispatched
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
      v.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    
    const matchesType =
      vehicleTypeFilter === "all" || v.vehicleType === vehicleTypeFilter;
    
    const matchesDispatch = showNotDispatched ? !v.dispatched : true;
    
    return matchesSearch && matchesStatus && matchesType && matchesDispatch;
  });

  const statusCounts = {
    all: combinedVehicles.length,
    Moving: combinedVehicles.filter((v) => v.status === "Moving").length,
    Idle: combinedVehicles.filter((v) => v.status === "Idle").length,
    Stopped: combinedVehicles.filter((v) => v.status === "Stopped").length,
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
