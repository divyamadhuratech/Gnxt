import { format } from "date-fns";
import { useState } from "react";
import {
  Truck,
  MapPin,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Package,
  CalendarDays,
  FileText,
  ChevronRight,
  Search,
  Eye,
  FileCheck,
  ArrowLeft,
  History,
  Calendar as CalendarIcon,
  FileWarning,
  XCircle,

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
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "./ui/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

/* ── MOCK DATA ─────────────────────────────────── */

const stats = [
  {
    title: "Active Shipments",
    value: "32",
    // trend: "+14% from yesterday",
    trendUp: true,
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    title: "Pending PODs / LRs",
    value: "18",
    // trend: "+3% from yesterday",
    trendUp: true,
    icon: <FileWarning className="w-5 h-5 text-yellow-600" />,
    bg: "bg-yellow-50",
    border: "border-yellow-100",
  },
  {
    title: "Pending Dispatch",
    value: "18",
    // trend: "+5% from yesterday",
    trendUp: true,
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    title: "Cancelled Dispatch",
    value: "18",
    // trend: "-5% from yesterday",
    trendUp: false,
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    title: "Pending Delivery",
    value: "18",
    // trend: "+2% from yesterday",
    trendUp: true,
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    title: "Deliveries Today",
    value: "124",
    // trend: "+22% from yesterday",
    trendUp: true,
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    title: "Vehicles on Trip",
    value: "45",
    // trend: "82% utilization",
    trendUp: true,
    icon: <MapPin className="w-5 h-5 text-violet-600" />,
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
];

const weeklyData = [
  { name: "Mon", dispatches: 42, deliveries: 38 },
  { name: "Tue", dispatches: 55, deliveries: 45 },
  { name: "Wed", dispatches: 60, deliveries: 58 },
  { name: "Thu", dispatches: 48, deliveries: 52 },
  { name: "Fri", dispatches: 75, deliveries: 65 },
  { name: "Sat", dispatches: 82, deliveries: 78 },
  { name: "Sun", dispatches: 30, deliveries: 40 },
];

const currentShipments = [
  {
    id: "SHP-2026-00142",
    vehicle: "MH12 CD 5678",
    driver: "Ramesh Yadav",
    destination: "Nagpur, MH",
    status: "In Transit",
    progress: 65,
    eta: "Today, 4:30 PM",
    items: "120 Tyres",
  },
  {
    id: "SHP-2026-00141",
    vehicle: "MH04 EF 9012",
    driver: "Suresh Patel",
    destination: "Pune, MH",
    status: "Delayed",
    progress: 40,
    eta: "Today, 8:00 PM",
    items: "85 Tyres",
  },
  {
    id: "SHP-2026-00140",
    vehicle: "MH14 GH 3456",
    driver: "Amit Sharma",
    destination: "Nashik, MH",
    status: "Unloading",
    progress: 95,
    eta: "Today, 1:15 PM",
    items: "200 Tyres",
  },
  {
    id: "SHP-2026-00139",
    vehicle: "MH31 KL 2345",
    driver: "Vikram Singh",
    destination: "Aurangabad, MH",
    status: "In Transit",
    progress: 20,
    eta: "Tomorrow, 10:00 AM",
    items: "150 Tyres",
  },
];

const historicalShipments = [
  {
    id: "SHP-2026-00101",
    vehicle: "MH12 CD 5678",
    driver: "Ramesh Yadav",
    destination: "Nagpur, MH",
    status: "Completed",
    progress: 100,
    eta: "Today, 10:30 AM",
    items: "120 Tyres",
    podStatus: "Signed",
  },
  {
    id: "SHP-2026-00098",
    vehicle: "MH01 AB 1234",
    driver: "Kisan Rao",
    destination: "Mumbai, MH",
    status: "Completed",
    progress: 100,
    eta: "Yesterday, 2:00 PM",
    items: "500 Tyres",
    podStatus: "Signed",
  },
  {
    id: "SHP-2026-00097",
    vehicle: "MH12 CD 5678",
    driver: "Ramesh Yadav",
    destination: "Nagpur, MH",
    status: "Completed",
    progress: 100,
    eta: "Yesterday, 10:30 AM",
    items: "120 Tyres",
    podStatus: "Signed",
  },
  {
    id: "SHP-2026-00095",
    vehicle: "MH04 EF 9012",
    driver: "Suresh Patel",
    destination: "Pune, MH",
    status: "Completed",
    progress: 100,
    eta: "Mar 10, 4:00 PM",
    items: "85 Tyres",
    podStatus: "Signed",
  },
];

const pendingPODs = [
  {
    id: "INV-2026-0892",
    dealer: "Patel Tyre House",
    date: "Mar 12, 2026",
    shipmentId: "SHP-2026-00130",
    status: "Awaiting Upload",
  },
  {
    id: "INV-2026-0890",
    dealer: "Sharma Motors",
    date: "Mar 12, 2026",
    shipmentId: "SHP-2026-00128",
    status: "Verification Pending",
  },
  {
    id: "INV-2026-0885",
    dealer: "Ganesh Traders",
    date: "Mar 11, 2026",
    shipmentId: "SHP-2026-00125",
    status: "Awaiting Upload",
  },
];

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
      <div className="p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveStatView(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeStatView}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed view of all {activeStatView.toLowerCase()}.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Invoice ID, Driver, Vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-border"
            />
          </div>

          <Select value={podFilter} onValueChange={setPodFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="POD Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PODs</SelectItem>
              <SelectItem value="Signed">Signed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Not Generated">Not Generated</SelectItem>
            </SelectContent>
          </Select>

          {showHistory && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-white h-9 border-border",
                      !dateFilter && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? (
                      format(dateFilter, "PPP")
                    ) : (
                      <span>All Time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Date
                </Button>
              )}
            </div>
          )}

          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={() => {
              setShowHistory(!showHistory);
              if (showHistory) setDateFilter(undefined);
            }}
            className={
              showHistory
                ? "bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                : "bg-white"
            }
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[#fafbfc]">

                  {/* 1. Active Shipments */}
                  {activeStatView === "Active Shipments" && (
                    <>
                      <TableHead className="pl-5 w-[150px]">Invoice Number</TableHead>
                      <TableHead className="w-[200px]">Dealer & Location</TableHead>
                      <TableHead className="w-[150px]">Weight</TableHead>
                      <TableHead className="w-[160px]">Driver Info</TableHead>
                      <TableHead className="w-[160px]">Vehicle Info</TableHead>
                      <TableHead className="w-[110px]">Date</TableHead>
                      <TableHead className="w-[110px]">POD</TableHead>
                      <TableHead className="w-[60px] pr-5 text-center">View</TableHead>
                    </>
                  )}

                  {/* 2. Pending PODs / LRs */}
                  {activeStatView === "Pending PODs / LRs" && (
                    <>
                      <TableHead className="pl-5">Invoice No</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Dispatch Date</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>POD Status</TableHead>
                      <TableHead className="pr-5">LR Status</TableHead>
                    </>
                  )}

                  {/* 3. Pending Dispatch */}
                  {activeStatView === "Pending Dispatch" && (
                    <>
                      <TableHead className="pl-5">Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Planned Vehicle</TableHead>
                      <TableHead className="pr-5">Dispatch Status</TableHead>
                    </>
                  )}

                  {/* 4. Cancelled Dispatch */}
                  {activeStatView === "Cancelled Dispatch" && (
                    <>
                      <TableHead className="pl-5">Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="pr-5">Cancelled By</TableHead>
                    </>
                  )}

                  {/* 5. Pending Delivery */}
                  {activeStatView === "Pending Delivery" && (
                    <>
                      <TableHead className="pl-5">Invoice No</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Dispatch Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-5">Delay (if any)</TableHead>
                    </>
                  )}

                  {/* 6. Deliveries Today */}
                  {activeStatView === "Deliveries Today" && (
                    <>
                      <TableHead className="pl-5">Invoice No</TableHead>
                      <TableHead>Dealer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Delivered Time</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="pr-5">POD Received</TableHead>
                    </>
                  )}

                  {/* 7. Vehicles on Trip */}
                  {activeStatView === "Vehicles on Trip" && (
                    <>
                      <TableHead className="pl-5">Vehicle No</TableHead>
                      <TableHead>Driver Name</TableHead>
                      <TableHead>Current Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Trip Start Date</TableHead>
                      <TableHead className="pr-5">Status</TableHead>
                    </>
                  )}

                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item, idx) => (
                  <TableRow key={idx} className="group cursor-default">
                    <TableCell className="pl-5">
                      <span className="font-medium text-[#1d4ed8]">
                        {item.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">Dealer Name</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.destination}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">450 kg</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{item.driver}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        +91 98765 43210
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm text-foreground">
                            {item.vehicle}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-0.5 text-[10px] px-1.5 py-0 rounded-sm border-blue-200 text-blue-600 bg-blue-50/60"
                          >
                            Own
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.eta || "Today"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.podStatus === "Signed" || showHistory ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pr-5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0 border-none">
                      <div className="w-full flex flex-col items-center justify-center py-10 px-6 bg-slate-50/50">
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm w-full max-w-5xl opacity-60 pointer-events-none mb-6 overflow-hidden">
                          <Table>
                            <TableBody>
                              <TableRow className="border-b-0 hover:bg-transparent">
                                <TableCell className="pl-5 w-[150px]">
                                  <span className="font-medium text-[#1d4ed8]">
                                    DEMO-2026-001
                                  </span>
                                </TableCell>
                                <TableCell className="w-[200px]">
                                  <p className="text-sm text-foreground">
                                    Example Dealer
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Mumbai, MH
                                  </p>
                                </TableCell>
                                <TableCell className="w-[150px]">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="text-sm text-foreground">
                                      500 kg
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="w-[160px]">
                                  <p className="text-sm text-foreground">
                                    John Doe
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    +91 99999 99999
                                  </p>
                                </TableCell>
                                <TableCell className="w-[160px]">
                                  <div>
                                    <p className="text-sm text-foreground">
                                      MH01 AB 1234
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="mt-0.5 text-[10px] px-1.5 py-0 rounded-sm border-blue-200 text-blue-600 bg-blue-50/60"
                                    >
                                      Demo
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="w-[110px]">
                                  <span className="text-sm text-muted-foreground">
                                    Today
                                  </span>
                                </TableCell>
                                <TableCell className="w-[110px]">
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Signed
                                  </span>
                                </TableCell>
                                <TableCell className="w-[60px] pr-5 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 text-muted-foreground"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          No Data Available
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm text-center">
                          Please adjust your filters or select a different stat
                          card above (e.g., "Active Shipments") to view actual
                          demo data.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* ── HEADER ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your daily shipments and delivery performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white">
            <CalendarDays className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            onClick={() => setActiveStatView(stat.title)}
            className="bg-white border border-border rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.border} border`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <span
                  className={
                    stat.trendUp ? "text-emerald-600" : "text-amber-600"
                  }
                >
                  {stat.trend}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ROW ───────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold tracking-tight">
              Dispatch vs Delivery Volume
            </h3>
            <p className="text-sm text-muted-foreground">
              Shipment quantities over the last 7 days
            </p>
          </div>
          <div className="h-[300px] w-full min-h-[300px] min-w-[300px] flex-1">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minHeight={300}
              minWidth={300}
            >
              <AreaChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs key="chart-defs">
                  <linearGradient
                    id="colorDispatches"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorDeliveries"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="chart-grid"
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  key="chart-xaxis"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  key="chart-yaxis"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <Tooltip
                  key="chart-tooltip"
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />

                <Legend
                  key="chart-legend"
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                />
                <Area
                  key="chart-area-dispatches"
                  type="monotone"
                  dataKey="dispatches"
                  name="Dispatches"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDispatches)"
                />
                <Area
                  key="chart-area-deliveries"
                  type="monotone"
                  dataKey="deliveries"
                  name="Deliveries"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDeliveries)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Pending PODs & LRs
              </h3>
              <p className="text-sm text-muted-foreground">Action required</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {pendingPODs.map((pod, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 p-3.5 rounded-lg border border-border hover:bg-[#fafbfc] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4b6cb7]" />
                    <span className="text-sm font-semibold">{pod.id}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      pod.status === "Awaiting Upload"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {pod.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{pod.dealer}</span>
                  <span>{pod.date}</span>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-5 bg-[#f8fafc]">
            View All Pending Documents
          </Button>
        </div>
      </div>

      {/* ── CURRENT SHIPMENTS ──────────────────── */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Live Shipments
            </h3>
            <p className="text-sm text-muted-foreground">
              Real-time tracking of ongoing deliveries
            </p>
          </div>
          <Button variant="ghost" className="text-[#1d4ed8] hover:bg-blue-50">
            View Map <MapPin className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-[#fafbfc] uppercase border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Shipment ID</th>
                <th className="px-6 py-4 font-medium">Vehicle / Driver</th>
                <th className="px-6 py-4 font-medium">Destination</th>
                <th className="px-6 py-4 font-medium">Status & ETA</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {currentShipments.map((shipment, i) => (
                <tr key={i} className="hover:bg-[#fafbfc] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">
                      {shipment.id}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {shipment.items}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{shipment.vehicle}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {shipment.driver}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 w-48">
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold flex items-center gap-1.5 ${shipment.status === "Delayed"
                            ? "text-red-600"
                            : shipment.status === "Unloading"
                              ? "text-blue-600"
                              : "text-emerald-600"
                            }`}
                        >
                          {shipment.status === "Delayed" && (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {shipment.status === "Unloading" && (
                            <Package className="w-3.5 h-3.5" />
                          )}
                          {shipment.status === "In Transit" && (
                            <Truck className="w-3.5 h-3.5" />
                          )}
                          {shipment.status}
                        </span>
                        <span className="text-muted-foreground">
                          {shipment.eta}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${shipment.status === "Delayed"
                            ? "bg-red-500"
                            : "bg-emerald-500"
                            }`}
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium"
                    >
                      Track
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
