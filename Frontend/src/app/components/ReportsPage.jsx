import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Car,
  Users,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Filter,
  BarChart3,
  RefreshCw,
} from "lucide-react";
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

/* ── REPORTS PAGE ────────────────────────────────── */

export function ReportsPage() {
  const [dateRange, setDateRange]       = useState("7d");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [driverFilter, setDriverFilter]   = useState("all");
  const [dealerFilter, setDealerFilter]   = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [stats, setStats] = useState({
    total:     { value: 0, trend: "0%", up: true },
    active:    { value: 0, trend: "0%", up: true },
    completed: { value: 0, trend: "0%", up: true },
  });

  const [filterOptions, setFilterOptions] = useState({
    vehicles: [],
    drivers:  [],
    dealers:  [],
  });

  const [loading, setLoading] = useState(true);

  // ── Fetch filter options on mount & refresh ────────
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("http://localhost:5000/api/reports/filters");
        const json = await res.json();
        if (json.success) setFilterOptions(json.data);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    }
    fetchFilters();
  }, [refreshTrigger]);

  // ── Fetch stats when filters change ──────────────────
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          dateRange,
          vehicle: vehicleFilter,
          driver:  driverFilter,
          dealer:  dealerFilter,
        }).toString();

        const res = await fetch(`http://localhost:5000/api/reports/stats?${query}`);
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [dateRange, vehicleFilter, driverFilter, dealerFilter, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div id="printable-report" className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">

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
          <div className="flex items-center gap-2 no-print">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white gap-1.5"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── FILTERS BAR ───────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 bg-white border border-border rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] no-print">
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
              {filterOptions.vehicles.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
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
              {filterOptions.drivers.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
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
              {filterOptions.dealers.map((dl) => (
                <SelectItem key={dl} value={dl}>{dl}</SelectItem>
              ))}
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
          <h2 className="text-sm text-foreground">
            Shipment Report Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Total Shipments",
              value: stats.total.value.toLocaleString(),
              trend: stats.total.trend,
              up: stats.total.up,
              icon: Package,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
            },
            {
              label: "Active Shipments",
              value: stats.active.value.toLocaleString(),
              trend: stats.active.trend,
              up: stats.active.up,
              icon: Truck,
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-600",
            },
            {
              label: "Completed Shipments",
              value: stats.completed.value.toLocaleString(),
              trend: stats.completed.trend,
              up: stats.completed.up,
              icon: CheckCircle2,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="bg-white border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    card.iconBg
                  )}
                >
                  <Icon className={cn("w-5 h-5", card.iconColor)} />
                </div>

                <div className="flex-1">
                  <p className="text-[11px] text-muted-foreground">
                    {card.label}
                  </p>

                  <p className="text-xl text-foreground">
                    {card.value}
                  </p>
                </div>

                <Badge
                  variant="secondary"
                  className="text-emerald-600 bg-emerald-50"
                >
                  {card.trend}
                </Badge>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PRINT STYLES ──────────────────────────── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure colors and backgrounds print */
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
