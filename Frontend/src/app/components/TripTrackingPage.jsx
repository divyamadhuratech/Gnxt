import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Truck,
  MapPin,
  Clock,
  Navigation,
  Phone,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  Route,
  Gauge,
  AlertTriangle,
  Locate,
  Radio,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { TooltipProvider } from "./ui/tooltip";

/* ── TYPES ─────────────────────────────────────── */

/* ── MOCK DATA ─────────────────────────────────── */

const tripVehicles = [
  {
    vehicleNumber: "MH04AB1234",
    driverName: "Suresh Patel",
    driverPhone: "+91 98765 43210",
    shipmentId: "SHP-2026-00142",
    dealerName: "Patel Tyre House",
    dealerLocation: "Pune, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Moving",
    currentLocation: "Lonavala, Mumbai-Pune Expressway",
    currentSpeed: "62 km/h",
    avgSpeed: "58 km/h",
    totalDistance: 165,
    distanceCovered: 120,
    remainingDistance: 45,
    percentComplete: 73,
    eta: "45 min",
    departedTime: "08:30 AM",
    lastUpdated: "11:42 AM",
    vehicleType: "Own",
    delay: null,
    dispatched: true,
  },
  {
    vehicleNumber: "MH14GH3456",
    driverName: "Amit Sharma",
    driverPhone: "+91 65432 10987",
    shipmentId: "SHP-2026-00139",
    dealerName: "Jai Bhavani Tyres",
    dealerLocation: "Aurangabad, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Moving",
    currentLocation: "Ahmednagar, NH-222",
    currentSpeed: "55 km/h",
    avgSpeed: "52 km/h",
    totalDistance: 340,
    distanceCovered: 260,
    remainingDistance: 80,
    percentComplete: 76,
    eta: "1h 20m",
    departedTime: "06:00 AM",
    lastUpdated: "11:38 AM",
    vehicleType: "Rented",
    delay: "45 min behind schedule",
    dispatched: true,
  },
  {
    vehicleNumber: "MH15TU9012",
    driverName: "Nilesh Deshmukh",
    driverPhone: "+91 09876 54321",
    shipmentId: "SHP-2026-00133",
    dealerName: "Vithal Rubber Industries",
    dealerLocation: "Jalgaon, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Dhule Rest Stop, NH-3",
    currentSpeed: "0 km/h",
    avgSpeed: "48 km/h",
    totalDistance: 420,
    distanceCovered: 310,
    remainingDistance: 110,
    percentComplete: 74,
    eta: "2h 15m",
    departedTime: "05:30 AM",
    lastUpdated: "10:15 AM",
    vehicleType: "Own",
    delay: "Stopped for 35 min",
    dispatched: true,
  },
  {
    vehicleNumber: "MH12CD5678",
    driverName: "Ramesh Yadav",
    driverPhone: "+91 87654 32109",
    shipmentId: "SHP-2026-00141",
    dealerName: "Krishna Auto Spares",
    dealerLocation: "Nagpur, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Idle",
    currentLocation: "Mumbai Warehouse, Bhiwandi",
    currentSpeed: "0 km/h",
    avgSpeed: "0 km/h",
    totalDistance: 780,
    distanceCovered: 0,
    remainingDistance: 780,
    percentComplete: 0,
    eta: "12h 30m",
    departedTime: "---",
    lastUpdated: "11:00 AM",
    vehicleType: "Rented",
    delay: null,
    dispatched: false,
  },
  {
    vehicleNumber: "MH20PQ1234",
    driverName: "Prakash Jadhav",
    driverPhone: "+91 21098 76543",
    shipmentId: "SHP-2026-00135",
    dealerName: "Sai Auto Parts",
    dealerLocation: "Ahmednagar, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Idle",
    currentLocation: "Mumbai Warehouse, Bhiwandi",
    currentSpeed: "0 km/h",
    avgSpeed: "0 km/h",
    totalDistance: 265,
    distanceCovered: 0,
    remainingDistance: 265,
    percentComplete: 0,
    eta: "5h 30m",
    departedTime: "---",
    lastUpdated: "09:00 AM",
    vehicleType: "Own",
    delay: null,
    dispatched: false,
  },
  {
    vehicleNumber: "MH04EF9012",
    driverName: "Vikram Singh",
    driverPhone: "+91 76543 21098",
    shipmentId: "SHP-2026-00140",
    dealerName: "Sharma Motors",
    dealerLocation: "Nashik, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Sharma Motors, Nashik",
    currentSpeed: "0 km/h",
    avgSpeed: "52 km/h",
    totalDistance: 185,
    distanceCovered: 185,
    remainingDistance: 0,
    percentComplete: 100,
    eta: "Delivered",
    departedTime: "06:00 AM",
    lastUpdated: "09:32 AM",
    vehicleType: "Own",
    delay: null,
    dispatched: true,
  },
  {
    vehicleNumber: "MH04IJ7890",
    driverName: "Deepak Kumar",
    driverPhone: "+91 54321 09876",
    shipmentId: "SHP-2026-00138",
    dealerName: "Ganesh Traders",
    dealerLocation: "Kolhapur, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Ganesh Traders, Kolhapur",
    currentSpeed: "0 km/h",
    avgSpeed: "47 km/h",
    totalDistance: 395,
    distanceCovered: 395,
    remainingDistance: 0,
    percentComplete: 100,
    eta: "Delivered",
    departedTime: "05:00 AM",
    lastUpdated: "01:22 PM",
    vehicleType: "Own",
    delay: null,
    dispatched: true,
  },
  {
    vehicleNumber: "MH04MN6789",
    driverName: "Rajendra More",
    driverPhone: "+91 32109 87654",
    shipmentId: "SHP-2026-00136",
    dealerName: "Rajendra Tyre Service",
    dealerLocation: "Sangli, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Rajendra Tyre Service, Sangli",
    currentSpeed: "0 km/h",
    avgSpeed: "51 km/h",
    totalDistance: 380,
    distanceCovered: 380,
    remainingDistance: 0,
    percentComplete: 100,
    eta: "Delivered",
    departedTime: "04:30 AM",
    lastUpdated: "11:48 AM",
    vehicleType: "Own",
    delay: null,
    dispatched: true,
  },
  {
    vehicleNumber: "MH24RS5678",
    driverName: "Sanjay Patil",
    driverPhone: "+91 10987 65432",
    shipmentId: "SHP-2026-00134",
    dealerName: "Balaji Tyre World",
    dealerLocation: "Latur, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Balaji Tyre World, Latur",
    currentSpeed: "0 km/h",
    avgSpeed: "49 km/h",
    totalDistance: 490,
    distanceCovered: 490,
    remainingDistance: 0,
    percentComplete: 100,
    eta: "Delivered",
    departedTime: "03:00 AM",
    lastUpdated: "12:45 PM",
    vehicleType: "Rented",
    delay: null,
    dispatched: true,
  },
  {
    vehicleNumber: "MH31KL2345",
    driverName: "Manoj Tiwari",
    driverPhone: "+91 43210 98765",
    shipmentId: "SHP-2026-00137",
    dealerName: "Mahalakshmi Rubber Co.",
    dealerLocation: "Solapur, Maharashtra",
    origin: "Mumbai Warehouse, Bhiwandi",
    status: "Stopped",
    currentLocation: "Mumbai Warehouse, Bhiwandi",
    currentSpeed: "0 km/h",
    avgSpeed: "0 km/h",
    totalDistance: 0,
    distanceCovered: 0,
    remainingDistance: 0,
    percentComplete: 0,
    eta: "Cancelled",
    departedTime: "---",
    lastUpdated: "---",
    vehicleType: "Rented",
    delay: null,
    dispatched: false,
  },
];

/* ── STATUS CONFIG ─────────────────────────────── */

const statusStyles = {
  Moving: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Idle: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Stopped: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

/* ── COMPONENT ─────────────────────────────────── */

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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1d4ed8] flex items-center justify-center shadow-sm">
              <Locate className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-foreground tracking-tight flex items-center gap-2.5">
                Fleet Control Center
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                  <Radio className="w-3 h-3" />
                  Live
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Real-time fleet monitoring &middot; {tripVehicles.length}{" "}
                vehicles tracked &middot; Last synced 11:45 AM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-border text-muted-foreground hover:text-foreground h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Truck className="w-4 h-4 text-[#1d4ed8]" />}
            label="Total Vehicles"
            value={`${tripVehicles.length}`}
            sub="Across all trips"
          />

          <KpiCard
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            label="Moving"
            value={`${statusCounts.Moving}`}
            sub="Currently on road"
            highlight="emerald"
          />

          <KpiCard
            icon={<Clock className="w-4 h-4 text-amber-500" />}
            label="Idle"
            value={`${statusCounts.Idle}`}
            sub="Awaiting dispatch"
            highlight="amber"
          />

          <KpiCard
            icon={<MapPin className="w-4 h-4 text-red-500" />}
            label="Stopped"
            value={`${statusCounts.Stopped}`}
            sub="Delivered / halted"
            highlight="red"
          />
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Vehicle, Driver, Shipment ID, Dealer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Statuses ({statusCounts.all})
              </SelectItem>
              <SelectItem value="Moving">
                Moving ({statusCounts.Moving})
              </SelectItem>
              <SelectItem value="Idle">Idle ({statusCounts.Idle})</SelectItem>
              <SelectItem value="Stopped">
                Stopped ({statusCounts.Stopped})
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={vehicleTypeFilter}
            onValueChange={setVehicleTypeFilter}
          >
            <SelectTrigger className="w-[155px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Vehicle Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Own">Own Vehicles</SelectItem>
              <SelectItem value="Rented">Rented Vehicles</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="dispatch-filter"
                checked={showNotDispatched}
                onCheckedChange={setShowNotDispatched}
                className="data-[state=checked]:bg-[#1d4ed8]"
              />

              <Label
                htmlFor="dispatch-filter"
                className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap"
              >
                Yet to Dispatch
              </Label>
              {showNotDispatched && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 border-amber-200 text-amber-700 bg-amber-50"
                >
                  {tripVehicles.filter((v) => !v.dispatched).length} pending
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {filteredVehicles.length} of {tripVehicles.length}
            </span>
          </div>
        </div>

        {/* Tracking Vehicles Table */}
        <div className="bg-white rounded-xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
          {/* Table Header Bar */}
          <div className="px-5 py-3 border-b border-border bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#eef2ff] border border-[#c7d7fe] flex items-center justify-center">
                <Locate className="w-3.5 h-3.5 text-[#4338ca]" />
              </div>
              <h3 className="text-sm text-foreground">Tracking Vehicles</h3>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 rounded-md border-[#c7d7fe] text-[#4338ca] bg-[#eef2ff]"
              >
                {filteredVehicles.length} active
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Click <Eye className="w-3 h-3 inline-block mx-0.5" /> to open full
              tracking view
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[#fafbfc]">
                  <TableHead className="pl-5 w-[130px]">Vehicle</TableHead>
                  <TableHead className="w-[145px]">Driver</TableHead>
                  <TableHead className="w-[130px]">Shipment</TableHead>
                  <TableHead className="w-[175px]">Current Location</TableHead>
                  <TableHead className="w-[85px]">Speed</TableHead>
                  <TableHead className="w-[155px]">Route Progress</TableHead>
                  <TableHead className="w-[75px]">ETA</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead className="w-[80px]">Updated</TableHead>
                  <TableHead className="w-[110px] pr-5 text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const ss = statusStyles[vehicle.status];
                  return (
                    <TableRow
                      key={vehicle.vehicleNumber}
                      className="group cursor-pointer hover:bg-[#fafbfe] transition-colors"
                      onClick={() =>
                        navigate(`/tracking/${vehicle.vehicleNumber}`)
                      }
                    >
                      {/* Vehicle */}
                      <TableCell className="pl-5">
                        <div>
                          <span className="text-sm text-[#1d4ed8]">
                            {vehicle.vehicleNumber}
                          </span>
                          <div className="mt-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 rounded-sm ${
                                vehicle.vehicleType === "Own"
                                  ? "border-blue-200 text-blue-600 bg-blue-50/60"
                                  : "border-orange-200 text-orange-600 bg-orange-50/60"
                              }`}
                            >
                              {vehicle.vehicleType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {/* Driver */}
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">
                            {vehicle.driverName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {vehicle.driverPhone}
                          </p>
                        </div>
                      </TableCell>

                      {/* Shipment */}
                      <TableCell>
                        <div>
                          <span className="text-sm text-[#1d4ed8]">
                            {vehicle.shipmentId}
                          </span>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                            {vehicle.dealerName}
                          </p>
                        </div>
                      </TableCell>

                      {/* Current Location */}
                      <TableCell>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-foreground truncate max-w-[155px]">
                              {vehicle.currentLocation}
                            </p>
                            {vehicle.delay && (
                              <p className="text-[10px] text-red-600 flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {vehicle.delay}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Speed */}
                      <TableCell>
                        <div>
                          <span className="text-sm text-foreground tabular-nums">
                            {vehicle.currentSpeed}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Avg: {vehicle.avgSpeed}
                          </p>
                        </div>
                      </TableCell>

                      {/* Route Progress */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              {vehicle.distanceCovered}/{vehicle.totalDistance}{" "}
                              km
                            </span>
                            <span className="text-[11px] text-foreground tabular-nums">
                              {vehicle.percentComplete}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                vehicle.percentComplete === 100
                                  ? "bg-emerald-500"
                                  : vehicle.percentComplete > 0
                                    ? "bg-[#1d4ed8]"
                                    : "bg-muted"
                              }`}
                              style={{ width: `${vehicle.percentComplete}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* ETA */}
                      <TableCell>
                        <span
                          className={`text-sm tabular-nums ${
                            vehicle.eta === "Delivered"
                              ? "text-emerald-600"
                              : vehicle.eta === "Cancelled"
                                ? "text-red-500"
                                : "text-foreground"
                          }`}
                        >
                          {vehicle.eta}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${ss.bg} ${ss.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${ss.dot} ${
                              vehicle.status === "Moving" ? "animate-pulse" : ""
                            }`}
                          />

                          {vehicle.status}
                        </span>
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {vehicle.lastUpdated}
                        </span>
                      </TableCell>

                      {/* View Tracking Button */}
                      <TableCell className="pr-5 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs border-[#c7d7fe] text-[#1d4ed8] hover:bg-[#eef2ff] hover:border-[#a5b4fc] transition-all h-8 px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tracking/${vehicle.vehicleNumber}`);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Tracking
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredVehicles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Truck className="w-8 h-8 text-muted-foreground/40" />
                        <p className="text-sm">No vehicles found</p>
                        <p className="text-xs text-muted-foreground/70">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer */}
          <div className="border-t border-border px-5 py-3 flex items-center justify-between bg-[#fafbfc]">
            <p className="text-xs text-muted-foreground">
              {filteredVehicles.length} vehicle
              {filteredVehicles.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Route className="w-3 h-3" />
                Total Distance:{" "}
                <span className="text-foreground">
                  {filteredVehicles
                    .reduce((sum, v) => sum + v.totalDistance, 0)
                    .toLocaleString()}{" "}
                  km
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                Covered:{" "}
                <span className="text-foreground">
                  {filteredVehicles
                    .reduce((sum, v) => sum + v.distanceCovered, 0)
                    .toLocaleString()}{" "}
                  km
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3 h-3" />
                Avg Speed:{" "}
                <span className="text-foreground">
                  {Math.round(
                    filteredVehicles
                      .filter((v) => v.status === "Moving")
                      .reduce((sum, v) => sum + parseInt(v.currentSpeed), 0) /
                      (filteredVehicles.filter((v) => v.status === "Moving")
                        .length || 1),
                  )}{" "}
                  km/h
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────── */

function KpiCard({ icon, label, value, sub, highlight }) {
  const highlightBorder = highlight
    ? highlight === "emerald"
      ? "border-emerald-200"
      : highlight === "amber"
        ? "border-amber-200"
        : "border-red-200"
    : "border-border";

  return (
    <div
      className={`bg-white border rounded-xl p-4 space-y-2 ${highlightBorder}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#f0f4ff] border border-[#dbe4ff] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div>
        <p className="text-2xl text-foreground tabular-nums">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
