import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Package,
  Truck,
  CalendarDays,
  Filter,
  FileCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { CreateShipmentSheet } from "./CreateShipmentSheet";
import { ViewShipmentSheet } from "./ViewShipmentSheet";


const createdByOptions = ["Admin", "Manager", "Operator"];
const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "In Transit": {
    label: "In Transit",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

export function ShipmentList() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [shipmentData, setShipmentData] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      // Replace with your API
      const res = await fetch("/api/shipments");
      const data = await res.json();
      setShipmentData(data);
    } catch (err) {
      console.error("Failed to fetch shipments", err);
    }
  };

  const getPODConfig = (status) => {
    switch (status) {
      case "Delivered":
        return {
          label: "Signed",
          icon: true,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "In Transit":
        return {
          label: "Pending",
          icon: false,
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "Pending":
        return {
          label: "Not Generated",
          icon: false,
          className:
            "bg-gray-50 text-gray-500 border-gray-200",
        };
      default:
        return {
          label: "N/A",
          icon: false,
          className:
            "bg-gray-50 text-gray-400 border-gray-200",
        };
    }
  };

  const isWithinDateRange = (date, filter) => {
    const shipmentDate = new Date(date);
    const now = new Date();

    switch (filter) {
      case "today":
        return shipmentDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return shipmentDate >= weekAgo;
      case "month":
        return (
          shipmentDate.getMonth() === now.getMonth() &&
          shipmentDate.getFullYear() === now.getFullYear()
        );
      default:
        return true;
    }
  };

  const filteredShipments = useMemo(() => {
    return shipmentData.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.dealerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || s.status === statusFilter;

      const matchesDate = isWithinDateRange(s.date, dateFilter);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [shipmentData, searchQuery, statusFilter, dateFilter]);


  const statusCounts = useMemo(() => {
    const counts = {
      all: shipmentData.length,
      Pending: 0,
      "In Transit": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    shipmentData.forEach((s) => {
      if (counts[s.status] !== undefined) {
        counts[s.status]++;
      }
    });

    return counts;
  }, [shipmentData]);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col p-6 gap-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground tracking-tight">
              Shipment Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage all tyre distribution shipments
            </p>
          </div>
          <Button
            onClick={() => setSheetOpen(true)}
            className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Shipment ID, Driver, Vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Statuses ({statusCounts.all})
              </SelectItem>
              <SelectItem value="Pending">
                Pending ({statusCounts.Pending})
              </SelectItem>
              <SelectItem value="In Transit">
                In Transit ({statusCounts["In Transit"]})
              </SelectItem>
              <SelectItem value="Delivered">
                Delivered ({statusCounts.Delivered})
              </SelectItem>
              <SelectItem value="Cancelled">
                Cancelled ({statusCounts.Cancelled})
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Date Range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto text-xs text-muted-foreground">
            Showing {filteredShipments.length} of {shipmentData.length} shipments
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[#fafbfc]">
                  <TableHead className="pl-5 w-[140px]">LR Number</TableHead>
                  <TableHead className="w-[120px]">Plant Number</TableHead>
                  <TableHead className="w-[150px]">Invoice Number</TableHead>
                  <TableHead className="w-[200px]">Dealer & Location</TableHead>
                  <TableHead className="w-[150px]">Items & Weight</TableHead>
                  <TableHead className="w-[160px]">Driver Info</TableHead>
                  <TableHead className="w-[160px]">Vehicle Info</TableHead>
                  <TableHead className="w-[110px]">Date</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                  <TableHead className="w-[110px]">POD</TableHead>
                  <TableHead className="w-[110px]">Created by</TableHead>
                  <TableHead className="w-[60px] pr-5 text-center">
                    View
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment) => {
                  const sc = statusConfig[shipment.status];
                  const pod = getPODConfig(shipment.status);
                  return (
                    <TableRow
                      key={shipment.id}
                      className="group cursor-default"
                    >
                      <TableCell className="pl-5">
                        <span className="text-sm font-medium text-foreground">
                          {shipment.lrNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">
                          {shipment.plantNumber || "PL-001"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-[#1d4ed8]">
                          {shipment.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">
                            {shipment.dealerName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shipment.dealerLocation}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div>
                            <span className="text-sm text-foreground">
                              {shipment.totalWeight} kg
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {shipment.items}{" "}
                              {shipment.items === 1 ? "item" : "items"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-foreground">
                            {shipment.driverName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {shipment.driverPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm text-foreground">
                              {shipment.vehicleNumber}
                            </p>
                            <Badge
                              variant="outline"
                              className={`mt-0.5 text-[10px] px-1.5 py-0 rounded-sm ${shipment.vehicleType === "Own"
                                ? "border-blue-200 text-blue-600 bg-blue-50/60"
                                : "border-orange-200 text-orange-600 bg-orange-50/60"
                                }`}
                            >
                              {shipment.vehicleType}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {shipment.date}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border ${sc.className}`}
                        >
                          {sc.label}
                        </span>
                      </TableCell>

                      {/* Need to add data */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${pod.className}${shipment.status === "Delivered"
                              ? " cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                              : ""
                            }`}
                          role={shipment.status === "Delivered" ? "button" : undefined}
                          onClick={
                            shipment.status === "Delivered"
                              ? () => {
                                setSelectedShipment(shipment);
                                setViewSheetOpen(true);
                              }
                              : undefined
                          }
                        >
                          {pod.icon && <FileCheck className="w-3 h-3" />}
                          {pod.label}
                          {shipment.status === "Delivered" && (
                            <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                          )}
                        </span>
                      </TableCell>
                      {/* Created by  */}
                      <TableCell>
                        <Select
                          value={shipment.createdBy || "Admin"}
                          onValueChange={(value) => {
                            setShipmentData((prev) =>
                              prev.map((s) =>
                                s.id === shipment.id
                                  ? { ...s, createdBy: value }
                                  : s
                              )
                            );
                          }}
                        >
                          <SelectTrigger className="h-8 w-[120px] bg-white border-border text-xs">
                            <SelectValue placeholder="Select User" />
                          </SelectTrigger>
                          <SelectContent>
                            {createdByOptions.map((user) => (
                              <SelectItem key={user} value={user}>
                                {user}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="pr-5 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setSelectedShipment(shipment);
                                setViewSheetOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredShipments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Truck className="w-8 h-8 text-muted-foreground/40" />
                        <p className="text-sm">No shipments found</p>
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
              {filteredShipments.length} shipment
              {filteredShipments.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                Total Weight:{" "}
                <span className="text-foreground">
                  {filteredShipments
                    .reduce((sum, s) => sum + s.totalWeight, 0)
                    .toLocaleString()}{" "}
                  kg
                </span>
              </span>
              <span>
                Total Items:{" "}
                <span className="text-foreground">
                  {filteredShipments.reduce((sum, s) => sum + s.items, 0)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Create Shipment Side Sheet */}
        <CreateShipmentSheet open={sheetOpen} onOpenChange={setSheetOpen} />

        {/* View Shipment Side Sheet */}
        <ViewShipmentSheet
          open={viewSheetOpen}
          onOpenChange={setViewSheetOpen}
          shipment={selectedShipment}
        />
      </div>
    </TooltipProvider>
  );
}
