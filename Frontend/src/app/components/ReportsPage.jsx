import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Car,
  Users,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ArrowUpRight,
  FileCheck2,
  AlertTriangle,
  Navigation,
  Activity,
  Download,
  Filter,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "./ui/utils";

/* ── MOCK DATA ──────────────────────────────────── */

const shipmentSummaryData = [
  { name: "Mar 10", dispatched: 42, delivered: 38, returned: 2 },
  { name: "Mar 11", dispatched: 55, delivered: 45, returned: 4 },
  { name: "Mar 12", dispatched: 60, delivered: 58, returned: 1 },
  { name: "Mar 13", dispatched: 48, delivered: 52, returned: 3 },
  { name: "Mar 14", dispatched: 75, delivered: 65, returned: 5 },
  { name: "Mar 15", dispatched: 82, delivered: 78, returned: 2 },
  { name: "Mar 16", dispatched: 30, delivered: 40, returned: 1 },
];

const tripStatusData = [
  { name: "Scheduled", value: 12, color: "#6366f1" },
  { name: "In Progress", value: 18, color: "#3b82f6" },
  { name: "Completed", value: 145, color: "#10b981" },
  { name: "Delayed", value: 8, color: "#f59e0b" },
  { name: "Cancelled", value: 3, color: "#ef4444" },
];

const vehicleUtilData = [
  { name: "On Trip", assigned: 31, color: "#3b82f6" },
  { name: "Available", assigned: 24, color: "#10b981" },
  { name: "Maintenance", assigned: 6, color: "#f59e0b" },
  { name: "Out of Service", assigned: 4, color: "#ef4444" },
];

const driverActivityData = [
  { name: "Ramesh Yadav", trips: 18, shipments: 42, rating: 4.8 },
  { name: "Suresh Patel", trips: 15, shipments: 36, rating: 4.6 },
  { name: "Amit Sharma", trips: 22, shipments: 51, rating: 4.9 },
  { name: "Vikram Singh", trips: 12, shipments: 28, rating: 4.5 },
  { name: "Kisan Rao", trips: 20, shipments: 47, rating: 4.7 },
];

const podStatusData = [
  { name: "Signed", value: 856, color: "#10b981" },
  { name: "Pending Upload", value: 124, color: "#f59e0b" },
  { name: "Verification Pending", value: 68, color: "#6366f1" },
  { name: "Not Generated", value: 42, color: "#94a3b8" },
  { name: "Rejected", value: 12, color: "#ef4444" },
];

const liveTrips = [
  {
    id: "TRP-2026-0087",
    vehicle: "MH12 CD 5678",
    driver: "Ramesh Yadav",
    from: "Mumbai",
    to: "Nagpur",
    progress: 65,
    eta: "4:30 PM",
    status: "On Time",
    tyres: 120,
  },
  {
    id: "TRP-2026-0085",
    vehicle: "MH04 EF 9012",
    driver: "Suresh Patel",
    from: "Pune",
    to: "Hyderabad",
    progress: 38,
    eta: "8:00 PM",
    status: "Delayed",
    tyres: 85,
  },
  {
    id: "TRP-2026-0084",
    vehicle: "MH14 GH 3456",
    driver: "Amit Sharma",
    from: "Mumbai",
    to: "Nashik",
    progress: 92,
    eta: "1:15 PM",
    status: "On Time",
    tyres: 200,
  },
  {
    id: "TRP-2026-0082",
    vehicle: "MH31 KL 2345",
    driver: "Vikram Singh",
    from: "Aurangabad",
    to: "Jalgaon",
    progress: 15,
    eta: "Tomorrow",
    status: "On Time",
    tyres: 150,
  },
];

const recentActivities = [
  {
    id: 1,
    type: "shipment",
    title: "Shipment SHP-2026-00142 dispatched",
    detail: "120 Tyres → Nagpur, MH • Ramesh Yadav",
    time: "12 min ago",
    icon: Package,
    dotColor: "bg-blue-500",
  },
  {
    id: 2,
    type: "pod",
    title: "POD signed for INV-2026-0892",
    detail: "Patel Tyre House • Nagpur, MH",
    time: "28 min ago",
    icon: FileCheck2,
    dotColor: "bg-emerald-500",
  },
  {
    id: 3,
    type: "alert",
    title: "Trip TRP-2026-0085 delayed by 2 hours",
    detail: "Route: Pune → Hyderabad • Traffic congestion",
    time: "45 min ago",
    icon: AlertTriangle,
    dotColor: "bg-amber-500",
  },
  {
    id: 4,
    type: "trip",
    title: "Trip TRP-2026-0079 completed",
    detail: "MH01 AB 1234 • 500 Tyres delivered to Mumbai",
    time: "1 hr ago",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
  },
  {
    id: 5,
    type: "vehicle",
    title: "Vehicle MH09 PQ 7890 sent for service",
    detail: "Scheduled maintenance • Expected back Mar 18",
    time: "2 hrs ago",
    icon: Car,
    dotColor: "bg-violet-500",
  },
  {
    id: 6,
    type: "driver",
    title: "Driver Kisan Rao marked available",
    detail: "Completed rest period • Ready for assignment",
    time: "2.5 hrs ago",
    icon: Users,
    dotColor: "bg-indigo-500",
  },
  {
    id: 7,
    type: "pod",
    title: "POD rejected for INV-2026-0878",
    detail: "Sharma Motors • Signature mismatch",
    time: "3 hrs ago",
    icon: FileCheck2,
    dotColor: "bg-red-500",
  },
  {
    id: 8,
    type: "shipment",
    title: "Bulk order received from Ganesh Traders",
    detail: "350 Tyres • 3 invoices generated",
    time: "4 hrs ago",
    icon: Package,
    dotColor: "bg-blue-500",
  },
];

/* ── Shared tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg border border-border px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-foreground">{p.name}:</span>
          <span className="text-foreground ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── REPORTS PAGE ────────────────────────────────── */

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("7d");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");

  const totalTrips = tripStatusData.reduce((s, d) => s + d.value, 0);
  const totalPods = podStatusData.reduce((s, d) => s + d.value, 0);
  const totalVehicles = vehicleUtilData.reduce((s, d) => s + d.assigned, 0);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* ── HEADER ─────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#1d4ed8]" />
              Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze transport operations, fleet performance, and delivery
              metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* ── FILTERS BAR ───────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-border rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filters
          </div>

          {/* Date Range */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-white border-border">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Vehicle */}
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs bg-white border-border">
              <Car className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="MH12 CD 5678">MH12 CD 5678</SelectItem>
              <SelectItem value="MH04 EF 9012">MH04 EF 9012</SelectItem>
              <SelectItem value="MH14 GH 3456">MH14 GH 3456</SelectItem>
              <SelectItem value="MH31 KL 2345">MH31 KL 2345</SelectItem>
            </SelectContent>
          </Select>

          {/* Driver */}
          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-[150px] h-8 text-xs bg-white border-border">
              <Users className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              <SelectItem value="ramesh">Ramesh Yadav</SelectItem>
              <SelectItem value="suresh">Suresh Patel</SelectItem>
              <SelectItem value="amit">Amit Sharma</SelectItem>
              <SelectItem value="vikram">Vikram Singh</SelectItem>
              <SelectItem value="kisan">Kisan Rao</SelectItem>
            </SelectContent>
          </Select>

          {/* Dealer */}
          <Select value={dealerFilter} onValueChange={setDealerFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-white border-border">
              <Package className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dealers</SelectItem>
              <SelectItem value="patel">Patel Tyre House</SelectItem>
              <SelectItem value="sharma">Sharma Motors</SelectItem>
              <SelectItem value="ganesh">Ganesh Traders</SelectItem>
              <SelectItem value="kumar">Kumar Auto</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground ml-auto"
            onClick={() => {
              setDateRange("7d");
              setVehicleFilter("all");
              setDriverFilter("all");
              setDealerFilter("all");
            }}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* ── 1. SHIPMENT REPORT SUMMARY ──────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-[#1d4ed8]" />
          <h2 className="text-sm text-foreground">Shipment Report Summary</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              {
                label: "Total Shipments",
                value: "1,284",
                trend: "+12.5%",
                up: true,
                icon: Package,
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                label: "Active Shipments",
                value: "32",
                trend: "+14%",
                up: true,
                icon: Truck,
                iconBg: "bg-indigo-50",
                iconColor: "text-indigo-600",
              },
              {
                label: "Completed Shipments",
                value: "1,148",
                trend: "+8.3%",
                up: true,
                icon: CheckCircle2,
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white border border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      card.iconBg,
                    )}
                  >
                    <Icon className={cn("w-5 h-5", card.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-xl tracking-tight text-foreground">
                      {card.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {card.up ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-[11px]",
                        card.up ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {card.trend}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipment Area Chart */}
          <div className="lg:col-span-3 bg-white border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs text-foreground">
                  Shipment Volume Trend
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Dispatched, delivered & returned
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
              >
                <Activity className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={shipmentSummaryData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gDispatched"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={0.12}
                      />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: "10px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dispatched"
                    name="Dispatched"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gDispatched)"
                  />
                  <Area
                    type="monotone"
                    dataKey="delivered"
                    name="Delivered"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gDelivered)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returned"
                    name="Returned"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gReturned)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRIP PERFORMANCE + 3. VEHICLE UTILIZATION ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trip Performance Report */}
        <section className="bg-white border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-indigo-500" />
            <div className="flex-1">
              <h2 className="text-sm text-foreground">
                Trip Performance Report
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Status breakdown of {totalTrips} total trips
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tripStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {tripStatusData.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-3">
              {tripStatusData.map((item) => {
                const pct = ((item.value / totalTrips) * 100).toFixed(1);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-foreground">{item.value}</span>
                        <span className="text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vehicle Utilization Report */}
        <section className="bg-white border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-violet-500" />
            <div className="flex-1">
              <h2 className="text-sm text-foreground">
                Vehicle Utilization Report
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalVehicles} total vehicles in fleet
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-[200px] w-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleUtilData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    dataKey="assigned"
                    strokeWidth={0}
                  >
                    {vehicleUtilData.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-3">
              {vehicleUtilData.map((item) => {
                const pct = ((item.assigned / totalVehicles) * 100).toFixed(1);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-foreground">{item.assigned}</span>
                        <span className="text-muted-foreground w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. DRIVER ACTIVITY + 5. POD SUBMISSION ──── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Driver Activity Report */}
        <section className="bg-white border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-amber-500" />
            <div>
              <h2 className="text-sm text-foreground">
                Driver Activity Report
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Trips handled & shipments delivered per driver
              </p>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={driverActivityData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  width={85}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={28}
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: "10px" }}
                />
                <Bar
                  dataKey="trips"
                  name="Trips"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="shipments"
                  name="Shipments"
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Rating footer */}
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-5 gap-2">
            {driverActivityData.map((d) => (
              <div key={d.name} className="text-center">
                <p className="text-[10px] text-muted-foreground truncate">
                  {d.name.split(" ")[0]}
                </p>
                <p className="text-xs text-foreground mt-0.5">⭐ {d.rating}</p>
              </div>
            ))}
          </div>
        </section>

        {/* POD Submission Report */}
        <section className="bg-white border border-border rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            <div className="flex-1">
              <h2 className="text-sm text-foreground">POD Submission Report</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalPods} total proof of delivery records
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
            >
              {podStatusData[1].value + podStatusData[2].value} Pending
            </Badge>
          </div>
          <div className="space-y-4">
            {podStatusData.map((item) => {
              const pct = ((item.value / totalPods) * 100).toFixed(1);
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-xs text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground">
                        {item.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* POD summary cards */}
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-lg text-emerald-700">
                {podStatusData[0].value}
              </p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                Completed PODs
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-lg text-amber-700">
                {podStatusData[1].value + podStatusData[2].value}
              </p>
              <p className="text-[10px] text-amber-600 mt-0.5">
                Pending Submissions
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. TRIP TRACKING + 7. RECENT ACTIVITIES ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Trip Tracking Overview */}
        <section className="xl:col-span-3 bg-white border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-cyan-500" />
                <div>
                  <h2 className="text-sm text-foreground">
                    Trip Tracking Overview
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {liveTrips.length} active trips being monitored
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs bg-white gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" /> Open Map
              </Button>
            </div>
          </div>

          {/* Map Preview */}
          <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 h-[170px] border-b border-border">
            <div className="absolute inset-0 overflow-hidden">
              <svg
                className="w-full h-full opacity-[0.06]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="rptGrid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#1d4ed8"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rptGrid)" />
              </svg>
              {/* City markers */}
              {[
                { label: "Mumbai", x: "12%", y: "30%", color: "blue" },
                { label: "Nashik", x: "35%", y: "20%", color: "emerald" },
                { label: "Nagpur", x: "72%", y: "15%", color: "amber" },
                { label: "Pune", x: "25%", y: "65%", color: "violet" },
                { label: "Hyderabad", x: "65%", y: "70%", color: "rose" },
                { label: "Aurangabad", x: "42%", y: "48%", color: "indigo" },
                { label: "Jalgaon", x: "55%", y: "28%", color: "cyan" },
              ].map((city) => (
                <div
                  key={city.label}
                  className="absolute flex items-center gap-1"
                  style={{ left: city.x, top: city.y }}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-${city.color}-500 animate-pulse`}
                  />
                  <span
                    className={`text-[8px] text-${city.color}-700 bg-${city.color}-100 px-1 py-0.5 rounded`}
                  >
                    {city.label}
                  </span>
                </div>
              ))}
              {/* Route lines */}
              <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: "none" }}
              >
                <line
                  x1="14%"
                  y1="32%"
                  x2="37%"
                  y2="22%"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.35"
                />
                <line
                  x1="14%"
                  y1="32%"
                  x2="74%"
                  y2="17%"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.35"
                />
                <line
                  x1="27%"
                  y1="67%"
                  x2="67%"
                  y2="72%"
                  stroke="#8b5cf6"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.35"
                />
                <line
                  x1="44%"
                  y1="50%"
                  x2="57%"
                  y2="30%"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.35"
                />
              </svg>
            </div>
          </div>

          {/* Trip List */}
          <div className="divide-y divide-border flex-1 overflow-y-auto">
            {liveTrips.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    trip.status === "On Time"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground">{trip.id}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0",
                        trip.status === "On Time"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200",
                      )}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {trip.vehicle} • {trip.driver} • {trip.tyres} Tyres
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
                  <span>{trip.from}</span>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground/50" />
                  <span>{trip.to}</span>
                </div>
                <div className="w-20 shrink-0">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>{trip.progress}%</span>
                    <span>{trip.eta}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-1.5 rounded-full",
                        trip.status === "On Time"
                          ? "bg-emerald-500"
                          : "bg-amber-500",
                      )}
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activities */}
        <section className="xl:col-span-2 bg-white border border-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
          <div className="p-5 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-rose-500" />
                <div>
                  <h2 className="text-sm text-foreground">Recent Activities</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Latest updates across operations
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-[#1d4ed8]"
              >
                View All
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="relative px-5 py-2">
              {/* Timeline line */}
              <div className="absolute left-[33px] top-0 bottom-0 w-px bg-border" />

              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="relative flex gap-3 py-3">
                    {/* Dot */}
                    <div className="relative z-10 flex flex-col items-center shrink-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-1.5 ring-2 ring-white",
                          act.dotColor,
                        )}
                      />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 -mt-0.5">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {act.detail}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0 mt-0.5">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
