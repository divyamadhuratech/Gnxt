import { useState } from "react";
import { format } from "date-fns";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { DashboardChart } from "./DashboardChart";
import { PendingPODsPanel } from "./PendingPODsPanel";
import { LiveShipmentsTable } from "./LiveShipmentsTable";
import { StatDetailView } from "./StatDetailView";
import { currentShipments, historicalShipments } from "./data/dashboardData";

export function DashboardPage() {
  const [activeStatView, setActiveStatView] = useState("Active Shipments");
  const [searchQuery, setSearchQuery] = useState("");
  const [podFilter, setPodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(undefined);
  const [showHistory, setShowHistory] = useState(true);

  // Filter the current shipments (in a real app, this would use the full data)
  let baseData = [];
  if (activeStatView === "Active Shipments") {
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
      const etaStr = (item.eta || "").toLowerCase();
      const isToday = etaStr.includes("today");
      const isYesterday = etaStr.includes("yesterday");
      const isMarch10 = etaStr.includes("mar 10");
      const filterStr = format(dateFilter, "MMM d, yyyy").toLowerCase();
      // Simple mock logic for this prototype based on current date assumptions
      if (filterStr.includes("mar 10")) {
        matchesDate = isMarch10;
      } else if (
        filterStr.includes("today") ||
        dateFilter.toDateString() === new Date().toDateString()
      ) {
        matchesDate = isToday;
      } else {
        // Fallback for demo purposes - if the date doesn't match our hardcoded mock data patterns,
        // it won't show the data. A real app would parse actual dates.
        matchesDate = false;
        // Let's pretend yesterday was selected if the date is one day before today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dateFilter.toDateString() === yesterday.toDateString()) {
          matchesDate = isYesterday;
        }
      }
    }
    return matchesSearch && matchesPod && matchesDate;
  });

  if (activeStatView) {
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
      <DashboardStatsGrid onStatClick={setActiveStatView} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DashboardChart />
        <PendingPODsPanel />
      </div>
      <LiveShipmentsTable />
    </div>
  );
}
export default DashboardPage;
