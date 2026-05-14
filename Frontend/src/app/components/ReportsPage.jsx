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

/* ── Shared tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg border border-border px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-foreground">{p.name}:</span>
          <span className="text-foreground ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── REPORTS PAGE ────────────────────────────────── */

export function ReportsPage() {
  const [dateRange, setDateRange]       = useState("7d");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [driverFilter, setDriverFilter]   = useState("all");
  const [dealerFilter, setDealerFilter]   = useState("all");

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
              Analyze transport operations, fleet performance, and delivery metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs bg-white gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button size="sm" className="h-8 text-xs bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-1.5">
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

      {/* ── SHIPMENT REPORT SUMMARY ──────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-[#1d4ed8]" />
          <h2 className="text-sm text-foreground">Shipment Report Summary</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* KPI Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              { label: "Total Shipments",     value: "1,284", trend: "+12.5%", up: true,  icon: Package,      iconBg: "bg-blue-50",    iconColor: "text-blue-600"    },
              { label: "Active Shipments",     value: "32",    trend: "+14%",   up: true,  icon: Truck,        iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
              { label: "Completed Shipments",  value: "1,148", trend: "+8.3%",  up: true,  icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white border border-border rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", card.iconBg)}>
                    <Icon className={cn("w-5 h-5", card.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-muted-foreground">{card.label}</p>
                    <p className="text-xl tracking-tight text-foreground">{card.value}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {card.up
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    <span className={cn("text-[11px]", card.up ? "text-emerald-600" : "text-red-600")}>
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
                <h3 className="text-xs text-foreground">Shipment Volume Trend</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Dispatched, delivered & returned</p>
              </div>
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                <Activity className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={shipmentSummaryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDispatched" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="top" height={28} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: "10px" }} />
                  <Area type="monotone" dataKey="dispatched" name="Dispatched" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gDispatched)" />
                  <Area type="monotone" dataKey="delivered"  name="Delivered"  stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gDelivered)" />
                  <Area type="monotone" dataKey="returned"   name="Returned"   stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gReturned)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
