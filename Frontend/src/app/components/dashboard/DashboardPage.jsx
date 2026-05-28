import { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { DashboardChart } from "./DashboardChart";
import { PendingPODsPanel } from "./PendingPODsPanel";
import { StatDetailView } from "./StatDetailView";

// We'll use our API base URL
const API_BASE_URL = "http://localhost:5000/api";

export function DashboardPage() {
  const [activeStatView, setActiveStatView] = useState("Active Shipments");
  const [searchQuery, setSearchQuery] = useState("");
  const [podFilter, setPodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(undefined);
  const [showHistory, setShowHistory] = useState(true);

  // Data states
  const [stats, setStats] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [currentShipments, setCurrentShipments] = useState([]);
  const [historicalShipments, setHistoricalShipments] = useState([]);
  const [pendingPODs, setPendingPODs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes, shipmentsRes, invoicesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/stats`),
        axios.get(`${API_BASE_URL}/dashboard/weekly`),
        axios.get(`${API_BASE_URL}/shipments?limit=100`),
        axios.get(`${API_BASE_URL}/invoices?status=Pending`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (weeklyRes.data.success) setWeeklyData(weeklyRes.data.data);

      if (shipmentsRes.data.success) {
        const shipments = shipmentsRes.data.data;
        const active = shipments
          .filter(s => s.status !== "Delivered" && s.status !== "Cancelled")
          .map(formatShipmentForTable);
        const history = shipments
          .filter(s => s.status === "Delivered" || s.status === "Cancelled")
          .map(formatShipmentForTable);
        
        setCurrentShipments(active);
        setHistoricalShipments(history);
      }

      if (invoicesRes.data.success) {
        const pods = invoicesRes.data.data.map(inv => ({
          id: inv.invoiceNumber,
          dealer: inv.customerName,
          date: format(new Date(inv.invoiceDate || inv.createdAt), "MMM d, yyyy"),
          shipmentId: inv.plantReferenceNumber || "N/A", // Or map to shipment if possible
          status: inv.status === "Pending" ? "Awaiting Upload" : "Verification Pending"
        }));
        setPendingPODs(pods);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatShipmentForTable = (s) => ({
    id: s.shipmentId,
    vehicle: s.vehicleNumber || "Unknown",
    driver: s.driverName || "Unknown",
    destination: s.destinations?.[0]?.customerName || s.destinations?.[0]?.deliveryLocation || "Unknown",
    status: s.status,
    progress: s.status === "Delivered" ? 100 : (s.status === "In Transit" ? 60 : 10),
    eta: s.deliveryDate ? format(new Date(s.deliveryDate), "MMM d, yyyy h:mm a") : "Pending",
    items: `${s.totalQuantity || 0} Items`,
    podStatus: s.status === "Delivered" ? "Signed" : "Pending",
    originalDate: s.dispatchDate || s.createdAt
  });

  // Filter the current shipments dynamically based on selected card view
  let baseData = [];
  if (activeStatView === "Active Shipments") {
    baseData = currentShipments.filter(s => s.status === "In Transit");
  } else if (activeStatView === "Pending Dispatch") {
    baseData = currentShipments.filter(s => s.status === "Pending");
  } else if (activeStatView === "Cancelled Shipments") {
    baseData = historicalShipments.filter(s => s.status === "Cancelled");
  } else if (activeStatView === "Deliveries Today") {
    baseData = historicalShipments.filter(s => s.status === "Delivered");
  } else if (activeStatView === "Vehicles on Trip") {
    baseData = currentShipments.filter(s => s.status === "In Transit");
  } else if (activeStatView) {
    baseData = showHistory ? historicalShipments : currentShipments;
  }
  
  // Apply search filter
  const tableData = baseData.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPod =
      podFilter === "all" ||
      (podFilter === "Signed" &&
        (item.podStatus === "Signed" || showHistory)) ||
      (podFilter === "Pending" && !item.podStatus && !showHistory);
    
    let matchesDate = true;
    if (showHistory && dateFilter) {
      const filterDateStr = dateFilter.toDateString();
      const itemDateStr = new Date(item.originalDate).toDateString();
      matchesDate = filterDateStr === itemDateStr;
    }
    
    return matchesSearch && matchesPod && matchesDate;
  });

  if (activeStatView && !loading) {
    return (
      <StatDetailView
        activeStatView={activeStatView}
        onBack={() => setActiveStatView(null)}
        tableData={tableData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        podFilter={podFilter}
        setPodFilter={setPodFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <DashboardHeader />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <DashboardStatsGrid onStatClick={setActiveStatView} stats={stats} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <DashboardChart weeklyData={weeklyData} />
            <PendingPODsPanel />
          </div>
        </>
      )}
    </div>
  );
}
export default DashboardPage;
