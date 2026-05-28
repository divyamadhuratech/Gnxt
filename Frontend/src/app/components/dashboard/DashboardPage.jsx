import { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { DashboardChart } from "./DashboardChart";
import { CreateShipmentPanel } from "./CreateShipmentPanel";
import { StatDetailView } from "./StatDetailView";

const API_BASE_URL = "http://localhost:5000/api";

export function DashboardPage() {
  const [activeStatView, setActiveStatView] = useState(null);

  const [stats, setStats] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes, shipmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/stats`),
        axios.get(`${API_BASE_URL}/dashboard/weekly`),
        axios.get(`${API_BASE_URL}/shipments?limit=500`),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (weeklyRes.data.success) setWeeklyData(weeklyRes.data.data);
      if (shipmentsRes.data.success) setAllShipments(shipmentsRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatShipment = (s) => ({
    id: s.shipmentId,
    vehicle: s.vehicleNumber || "Unknown",
    driver: s.driverName || "Unknown",
    destination:
      s.destinations?.[0]?.customerName ||
      s.destinations?.[0]?.deliveryLocation ||
      "Unknown",
    status: s.status,
    eta: s.deliveryDate
      ? format(new Date(s.deliveryDate), "MMM d, yyyy h:mm a")
      : "Pending",
    items: `${s.totalQuantity || 0} Items`,
    // POD status — real field if available, else derive from status
    podStatus: s.podStatus || (s.status === "Delivered" ? "Signed" : "Pending"),
    dispatchDate: s.dispatchDate || s.createdAt,
    deliveryDate: s.deliveryDate || null,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Per-view datasets
  const viewData = {
    "Active Shipments": {
      current: allShipments
        .filter((s) => s.status === "In Transit")
        .map(formatShipment),
      history: allShipments
        .filter((s) => s.status === "Delivered" || s.status === "Cancelled")
        .map(formatShipment),
    },
    "Pending Dispatch": {
      current: allShipments
        .filter((s) => s.status === "Pending")
        .map(formatShipment),
    },
    "Cancelled Dispatch": {
      current: allShipments
        .filter((s) => s.status === "Cancelled")
        .map(formatShipment),
    },
    "Deliveries Today": {
      // Today's deliveries (within last 7 days = current, older = history)
      current: allShipments
        .filter((s) => {
          if (s.status !== "Delivered" || !s.deliveryDate) return false;
          const d = new Date(s.deliveryDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() >= oneWeekAgo.getTime();
        })
        .map(formatShipment),
      history: allShipments
        .filter((s) => {
          if (s.status !== "Delivered" || !s.deliveryDate) return false;
          const d = new Date(s.deliveryDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime() < oneWeekAgo.getTime();
        })
        .map(formatShipment),
    },
  };

  const handleStatClick = (title) => {
    setActiveStatView(title);
  };

  if (activeStatView && !loading) {
    return (
      <StatDetailView
        activeStatView={activeStatView}
        viewData={viewData[activeStatView] || { current: [] }}
        onBack={() => setActiveStatView(null)}
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
          <DashboardStatsGrid onStatClick={handleStatClick} stats={stats} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <DashboardChart weeklyData={weeklyData} />
            <CreateShipmentPanel />
          </div>
        </>
      )}
    </div>
  );
}
export default DashboardPage;
