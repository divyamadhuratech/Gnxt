import { useState } from "react";
import { useNavigate } from "react-router";
import { TooltipProvider } from "../ui/tooltip";
import { TripHeader } from "./TripHeader";
import { TripKpiCards } from "./TripKpiCards";
import { TripFiltersBar } from "./TripFiltersBar";
import { TripTable } from "./TripTable";
import { tripVehicles } from "./data/tripData";

export function TripTrackingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [showNotDispatched, setShowNotDispatched] = useState(false);

  const filteredVehicles = tripVehicles.filter((v) => {
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
    all: tripVehicles.length,
    Moving: tripVehicles.filter((v) => v.status === "Moving").length,
    Idle: tripVehicles.filter((v) => v.status === "Idle").length,
    Stopped: tripVehicles.filter((v) => v.status === "Stopped").length,
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col p-6 gap-6">
        <TripHeader totalVehicles={tripVehicles.length} />
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
      </div>
    </TooltipProvider>
  );
}
export default TripTrackingPage;
