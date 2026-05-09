import { useState } from "react";
import {
  Search,
  Phone as PhoneIcon,
  Filter,
  Users,
  Plus,
  Truck,
  Eye,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DriverDetailSheet } from "./DriverDetailSheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Label } from "./ui/label";

/* ── TYPES ─────────────────────────────────────── */

/* ── MOCK DATA ─────────────────────────────────── */

const drivers = [
  {
    id: "DRV-001",
    name: "Ramesh Patil",
    avatar: "RP",
    driverType: "Own",
    phone: "+91 98765 43210",
    tripStatus: "Driving",
    assignedVehicle: { number: "MH-12-AB-1234", type: "Tata 407" },
  },
  {
    id: "DRV-002",
    name: "Suresh Jadhav",
    avatar: "SJ",
    driverType: "Own",
    phone: "+91 87654 32109",
    tripStatus: "Idle",
  },
  {
    id: "DRV-003",
    name: "Vikram Singh",
    avatar: "VS",
    driverType: "Hired",
    phone: "+91 76543 21098",
    tripStatus: "Driving",
    assignedVehicle: { number: "MH-04-CD-5678", type: "Ashok Leyland 12T" },
  },
  {
    id: "DRV-004",
    name: "Ajay Sharma",
    avatar: "AS",
    driverType: "Contract",
    phone: "+91 65432 10987",
    tripStatus: "Assigned",
    assignedVehicle: { number: "MH-14-EF-9012", type: "Eicher Pro 3019" },
  },
  {
    id: "DRV-005",
    name: "Prakash Jadhav",
    avatar: "PJ",
    driverType: "Own",
    phone: "+91 21098 76543",
    tripStatus: "Assigned",
    assignedVehicle: { number: "MH-43-GH-3456", type: "BharatBenz 1617" },
  },
  {
    id: "DRV-006",
    name: "Manoj Deshmukh",
    avatar: "MD",
    driverType: "Hired",
    phone: "+91 54321 09876",
    tripStatus: "Completed",
  },
  {
    id: "DRV-007",
    name: "Nilesh More",
    avatar: "NM",
    driverType: "Own",
    phone: "+91 43210 98765",
    tripStatus: "On Leave",
  },
  {
    id: "DRV-008",
    name: "Deepak Kulkarni",
    avatar: "DK",
    driverType: "Contract",
    phone: "+91 32109 87654",
    tripStatus: "Driving",
    assignedVehicle: { number: "MH-09-KL-7890", type: "Tata LPT 1613" },
  },
  {
    id: "DRV-009",
    name: "Ravi Thorat",
    avatar: "RT",
    driverType: "Hired",
    phone: "+91 09876 54321",
    tripStatus: "Idle",
  },
  {
    id: "DRV-010",
    name: "Sanjay Patil",
    avatar: "SP",
    driverType: "Own",
    phone: "+91 10987 65432",
    tripStatus: "Completed",
  },
];

/* ── STATUS STYLES ─────────────────────────────── */

const tripStatusStyles = {
  Driving: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Idle: {
    bg: "bg-slate-50 border-slate-200",
    text: "text-slate-600",
  },
  "On Leave": {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
  },
  Assigned: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
  Completed: {
    bg: "bg-violet-50 border-violet-200",
    text: "text-violet-700",
  },
};

const driverTypeBadgeStyles = {
  Own: "bg-blue-50 text-blue-700 border-blue-200",
  Hired: "bg-purple-50 text-purple-700 border-purple-200",
  Contract: "bg-teal-50 text-teal-700 border-teal-200",
};

/* ── COMPONENT ─────────────────────────────────── */

export function DriversPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    driverType: "",
    name: "",
    age: "",
    phone: "",
    licenseNumber: "",
  });

  const openDriverSheet = (driver) => {
    setSelectedDriver(driver);
    setSheetOpen(true);
  };

  const closeDriverSheet = () => {
    setSheetOpen(false);
    setSelectedDriver(null);
  };

  const filtered = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);
    const matchesType = typeFilter === "all" || d.driverType === typeFilter;
    const matchesStatus =
      statusFilter === "all" || d.tripStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="h-full flex flex-col">
      {/* ── HEADER ─── */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-foreground tracking-tight flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#1d4ed8]" />
              Driver Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage all drivers across your fleet
            </p>
          </div>
          <Button
            className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 h-9 px-4 text-sm"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* ── FILTERS BAR ─── */}
      <div className="px-6 pb-4 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white text-sm"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-white text-sm">
              <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue placeholder="Driver Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Own">Own</SelectItem>
              <SelectItem value="Hired">Hired</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 bg-white text-sm">
              <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
              <SelectValue placeholder="Trip Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Driving">Driving</SelectItem>
              <SelectItem value="Idle">Idle</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {(typeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-[#1d4ed8] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE ─── */}
      <div className="px-6 pb-6 flex-1 min-h-0 overflow-auto">
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f9fb] hover:bg-[#f8f9fb]">
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3 pl-5">
                  Driver Name
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3">
                  Driver Type
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3">
                  Phone Number
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3">
                  Assigned Vehicle
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3 pr-5">
                  Trip Status
                </TableHead>
                <TableHead className="text-xs text-muted-foreground uppercase tracking-wider py-3 pr-5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm">No drivers found</p>
                      <p className="text-xs text-muted-foreground/70">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((driver) => {
                  const statusStyle = tripStatusStyles[driver.tripStatus];
                  const typeStyle = driverTypeBadgeStyles[driver.driverType];
                  return (
                    <TableRow
                      key={driver.id}
                      className="group hover:bg-[#f8f9fb]/60 transition-colors cursor-pointer"
                      onClick={() => openDriverSheet(driver)}
                    >
                      {/* Driver Name */}
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1d4ed8] to-[#7c3aed] flex items-center justify-center shrink-0">
                            <span className="text-[11px] text-white">
                              {driver.avatar}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-foreground">
                              {driver.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {driver.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Driver Type */}
                      <TableCell className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${typeStyle}`}
                        >
                          {driver.driverType}
                        </span>
                      </TableCell>

                      {/* Phone Number */}
                      <TableCell className="py-3.5">
                        <a
                          href={`tel:${driver.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-[#1d4ed8] transition-colors group/phone"
                        >
                          <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground group-hover/phone:text-[#1d4ed8] transition-colors" />
                          {driver.phone}
                        </a>
                      </TableCell>

                      {/* Assigned Vehicle */}
                      <TableCell className="py-3.5">
                        {driver.assignedVehicle ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm text-foreground">
                                {driver.assignedVehicle.number}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {driver.assignedVehicle.type}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Trip Status */}
                      <TableCell className="py-3.5 pr-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.dot && (
                            <span className="relative flex h-2 w-2">
                              {driver.tripStatus === "Driving" && (
                                <span
                                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.dot}`}
                                />
                              )}
                              <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dot}`}
                              />
                            </span>
                          )}
                          {driver.tripStatus}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 pr-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-[#1d4ed8] hover:bg-[#1d4ed8]/5 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDriverSheet(driver);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-[#f8f9fb]/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {drivers.length} drivers
            </p>
          </div>
        </div>
      </div>

      {/* Driver Detail Sheet */}
      <DriverDetailSheet
        driver={selectedDriver}
        open={sheetOpen}
        onClose={closeDriverSheet}
      />

      {/* Add Driver Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1d4ed8]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1d4ed8]" />
              </div>
              <div>
                <DialogTitle className="text-base">Add New Driver</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Enter the driver details below to register a new driver.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Driver Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Driver Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newDriver.driverType}
                onValueChange={(value) =>
                  setNewDriver({ ...newDriver, driverType: value })
                }
              >
                <SelectTrigger className="w-full h-10 bg-[#f8f9fb] border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Own">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Own
                    </span>
                  </SelectItem>
                  <SelectItem value="Hired">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Hired
                    </span>
                  </SelectItem>
                  <SelectItem value="Contract">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      Contract
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Driver Name & Age - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Driver Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Ramesh Patil"
                  value={newDriver.name}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, name: e.target.value })
                  }
                  className="h-10 bg-[#f8f9fb] border-border focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Driver Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. 35"
                  type="number"
                  value={newDriver.age}
                  onChange={(e) =>
                    setNewDriver({ ...newDriver, age: e.target.value })
                  }
                  className="h-10 bg-[#f8f9fb] border-border focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Mobile Number & License - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="e.g. 9876543210"
                    value={newDriver.phone}
                    onChange={(e) =>
                      setNewDriver({ ...newDriver, phone: e.target.value })
                    }
                    className="h-10 bg-[#f8f9fb] border-border focus:bg-white transition-colors pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  License Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. MH-1234567890"
                  value={newDriver.licenseNumber}
                  onChange={(e) =>
                    setNewDriver({
                      ...newDriver,
                      licenseNumber: e.target.value,
                    })
                  }
                  className="h-10 bg-[#f8f9fb] border-border focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-[#f8f9fb]/60 flex items-center justify-end gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 text-sm"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="h-9 px-5 text-sm bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2"
              disabled={
                !newDriver.driverType ||
                !newDriver.name ||
                !newDriver.age ||
                !newDriver.phone ||
                !newDriver.licenseNumber
              }
              onClick={() => {
                const newId = `DRV-${String(drivers.length + 1).padStart(3, "0")}`;
                drivers.push({
                  id: newId,
                  name: newDriver.name,
                  avatar: newDriver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase(),
                  driverType: newDriver.driverType,
                  phone: `+91 ${newDriver.phone.slice(0, 5)} ${newDriver.phone.slice(5)}`,
                  tripStatus: "Idle",
                });
                setAddDialogOpen(false);
                setNewDriver({
                  driverType: "",
                  name: "",
                  age: "",
                  phone: "",
                  licenseNumber: "",
                });
              }}
            >
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
