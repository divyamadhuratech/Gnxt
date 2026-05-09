import { useState, useMemo } from "react";
import {
  MapPin,
  Truck,
  User,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  Weight,
  Hash,
  Layers,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronsUpDown,
  Check,
  Search,
  Navigation,
  Building2,
  FileText
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { format } from "date-fns";

/* ── MOCK DATA ─────────────────────────────────── */

const dealers = [
  {
    id: "dl1",
    name: "Patel Tyre House",
    location: "Pune, Maharashtra",
    distance: 165,
    estimatedTime: "3h 20m",
  },
  {
    id: "dl2",
    name: "Krishna Auto Spares",
    location: "Nagpur, Maharashtra",
    distance: 780,
    estimatedTime: "12h 30m",
  },
  {
    id: "dl3",
    name: "Sharma Motors",
    location: "Nashik, Maharashtra",
    distance: 185,
    estimatedTime: "3h 45m",
  },
  {
    id: "dl4",
    name: "Jai Bhavani Tyres",
    location: "Aurangabad, Maharashtra",
    distance: 335,
    estimatedTime: "5h 50m",
  },
  {
    id: "dl5",
    name: "Ganesh Traders",
    location: "Kolhapur, Maharashtra",
    distance: 395,
    estimatedTime: "6h 40m",
  },
  {
    id: "dl6",
    name: "Sai Auto Parts",
    location: "Ahmednagar, Maharashtra",
    distance: 260,
    estimatedTime: "4h 20m",
  },
];

const vehicles = [
  {
    id: "v1",
    number: "MH04AB1234",
    type: "Own",
    capacity: 800,
    isAssigned: false,
  },
  {
    id: "v2",
    number: "MH12CD5678",
    type: "Rented",
    capacity: 1200,
    isAssigned: true,
  },
  {
    id: "v3",
    number: "MH04EF9012",
    type: "Own",
    capacity: 600,
    isAssigned: false,
  },
  {
    id: "v4",
    number: "MH14GH3456",
    type: "Rented",
    capacity: 1000,
    isAssigned: false,
  },
  {
    id: "v5",
    number: "MH31KL2345",
    type: "Rented",
    capacity: 900,
    isAssigned: false,
  },
  {
    id: "v6",
    number: "MH04MN6789",
    type: "Own",
    capacity: 750,
    isAssigned: false,
  },
];

const drivers = [
  {
    id: "d1",
    name: "Suresh Patel",
    type: "Own",
    phone: "+91 98765 43210",
    isOnTrip: false,
  },
  {
    id: "d2",
    name: "Ramesh Yadav",
    type: "Rented",
    phone: "+91 87654 32109",
    isOnTrip: true,
  },
  {
    id: "d3",
    name: "Vikram Singh",
    type: "Own",
    phone: "+91 76543 21098",
    isOnTrip: false,
  },
  {
    id: "d4",
    name: "Amit Sharma",
    type: "Rented",
    phone: "+91 65432 10987",
    isOnTrip: false,
  },
  {
    id: "d5",
    name: "Deepak Kumar",
    type: "Own",
    phone: "+91 54321 09876",
    isOnTrip: false,
  },
];

const tyreModels = [
  { id: "t1", name: "MRF ZVTS 185/65R15", unitWeight: 12 },
  { id: "t2", name: "CEAT Milaze X3 195/55R16", unitWeight: 14 },
  { id: "t3", name: "Apollo Alnac 4G 205/60R16", unitWeight: 15 },
  { id: "t4", name: "JK Tyre Ranger 265/70R16", unitWeight: 22 },
  { id: "t5", name: "Bridgestone Ecopia 175/65R14", unitWeight: 10 },
  { id: "t6", name: "Michelin XM2+ 185/60R15", unitWeight: 13 },
  { id: "t7", name: "Goodyear Assurance 205/65R15", unitWeight: 16 },
];

const mockInvoices = [
  {
    id: "1",
    plantNumber: "PL-001",
    lrNumber: "LR-2026-10042",
    invoiceNumbers: ["INV-2026-00142", "INV-2026-00143"],
    invoiceDate: "2026-03-24",
    customerName: "Patel Tyre House",
    amount: 145000,
    status: "Completed",
  },
  {
    id: "2",
    plantNumber: "PL-002",
    lrNumber: "LR-2026-10043",
    invoiceNumbers: ["INV-2026-00144"],
    invoiceDate: "2026-03-23",
    customerName: "Krishna Auto Spares",
    amount: 89000,
    status: "Pending",
  },
  {
    id: "3",
    plantNumber: "PL-003",
    lrNumber: "LR-2026-10044",
    invoiceNumbers: ["INV-2026-00145", "INV-2026-00146", "INV-2026-00147"],
    invoiceDate: "2026-03-22",
    customerName: "Sharma Wheels",
    amount: 210000,
    status: "Completed",
  },
  {
    id: "4",
    plantNumber: "PL-004",
    lrNumber: "LR-2026-10045",
    invoiceNumbers: ["INV-2026-00148"],
    invoiceDate: "2026-03-21",
    customerName: "Metro Tyres Ltd",
    amount: 450000,
    status: "Delayed",
  },
  {
    id: "5",
    plantNumber: "PL-005",
    lrNumber: "LR-2026-10046",
    invoiceNumbers: ["INV-2026-00149", "INV-2026-00150"],
    invoiceDate: "2026-03-20",
    customerName: "Highway Auto Traders",
    amount: 32000,
    status: "Completed",
  },
  {
    id: "6",
    plantNumber: "PL-006",
    lrNumber: "LR-2026-10047",
    invoiceNumbers: ["INV-2026-00151"],
    invoiceDate: "2026-03-19",
    customerName: "Sai Motors",
    amount: 76500,
    status: "Pending",
  },
  {
    id: "7",
    plantNumber: "PL-007",
    lrNumber: "LR-2026-10048",
    invoiceNumbers: ["INV-2026-00152", "INV-2026-00153"],
    invoiceDate: "2026-03-18",
    customerName: "Royal Tyre Care",
    amount: 125000,
    status: "Completed",
  },
];

/* ── COMPONENT ─────────────────────────────────── */

export function CreateShipmentSheet({ open, onOpenChange }) {
  // Form state
  const [dealerEntries, setDealerEntries] = useState([
    {
      id: crypto.randomUUID(),
      dealerId: "",
      plantNumber: "",
      invoices: [{ number: "", date: "" }],
      items: [{ key: crypto.randomUUID(), tyreModelId: "", quantity: 1 }],
      totalTyres: 0,
      totalTubes: 0,
      totalFlaps: 0,
      weight: "",
    },
  ]);
  const [openDealerPopoverId, setOpenDealerPopoverId] = useState(null);
  const [openCalendarId, setOpenCalendarId] = useState(null);

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [rentedVehicleNumber, setRentedVehicleNumber] = useState("");
  const [driverType, setDriverType] = useState("");
  const [driverId, setDriverId] = useState("");

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const selectedDriver = drivers.find((d) => d.id === driverId);

  const filteredVehicles = vehicles.filter(
    (v) => vehicleType === "" || v.type === vehicleType,
  );
  const ownVehicles = vehicles.filter((v) => v.type === "Own");
  const filteredDrivers = drivers.filter(
    (d) => driverType === "" || d.type === driverType,
  );

  // Items calculations
  const allItemDetails = useMemo(() => {
    return dealerEntries.flatMap((entry) =>
      entry.items.map((item) => {
        const model = tyreModels.find((m) => m.id === item.tyreModelId);
        return {
          ...item,
          entryId: entry.id,
          model,
          unitWeight: model?.unitWeight ?? 0,
          totalWeight: (model?.unitWeight ?? 0) * item.quantity,
        };
      }),
    );
  }, [dealerEntries]);

  const grandTotalQty = dealerEntries.reduce(
    (s, e) => s + e.totalTyres + e.totalTubes + e.totalFlaps,
    0,
  );
  const grandTotalWeight = dealerEntries.reduce(
    (s, e) => s + (parseFloat(e.weight) || 0),
    0,
  );
  const totalQuantity =
    grandTotalQty || allItemDetails.reduce((s, i) => s + i.quantity, 0);
  const totalWeight =
    grandTotalWeight || allItemDetails.reduce((s, i) => s + i.totalWeight, 0);
  const skuCount = new Set(
    allItemDetails
      .filter((i) => i.tyreModelId !== "")
      .map((i) => i.tyreModelId),
  ).size;
  const totalTyresAll = dealerEntries.reduce((s, e) => s + e.totalTyres, 0);
  const totalTubesAll = dealerEntries.reduce((s, e) => s + e.totalTubes, 0);
  const totalFlapsAll = dealerEntries.reduce((s, e) => s + e.totalFlaps, 0);
  const overCapacity =
    selectedVehicle && totalWeight > selectedVehicle.capacity;

  // Handlers
  const addDealerEntry = () => {
    setDealerEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        dealerId: "",
        plantNumber: "",
        invoices: [{ number: "", date: "" }],
        items: [{ key: crypto.randomUUID(), tyreModelId: "", quantity: 1 }],
        totalTyres: 0,
        totalTubes: 0,
        totalFlaps: 0,
        weight: "",
      },
    ]);
  };

  const removeDealerEntry = (id) => {
    if (dealerEntries.length <= 1) return;
    setDealerEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateDealerEntry = (id, field, value) => {
    setDealerEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const addItemToEntry = (entryId) => {
    setDealerEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            items: [
              ...e.items,
              { key: crypto.randomUUID(), tyreModelId: "", quantity: 1 },
            ],
          };
        }
        return e;
      }),
    );
  };

  const removeItemFromEntry = (entryId, itemKey) => {
    setDealerEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          if (e.items.length <= 1) return e;
          return { ...e, items: e.items.filter((i) => i.key !== itemKey) };
        }
        return e;
      }),
    );
  };

  const updateItemInEntry = (entryId, itemKey, field, value) => {
    setDealerEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            items: e.items.map((i) =>
              i.key === itemKey ? { ...i, [field]: value } : i,
            ),
          };
        }
        return e;
      }),
    );
  };

  const resetForm = () => {
    setDealerEntries([
      {
        id: crypto.randomUUID(),
        dealerId: "",
        plantNumber: "",
        invoices: [{ number: "", date: "" }],
        items: [{ key: crypto.randomUUID(), tyreModelId: "", quantity: 1 }],
        totalTyres: 0,
        totalTubes: 0,
        totalFlaps: 0,
        weight: "",
      },
    ]);
    setVehicleType("");
    setVehicleId("");
    setVehicleOpen(false);
    setRentedVehicleNumber("");
    setDriverType("");
    setDriverId("");
    setOpenDealerPopoverId(null);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <SheetContent
        side="right"
        className="sm:max-w-none w-full sm:w-[78%] p-0 gap-0 flex flex-col"
      >
        {/* ── HEADER ───────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white shrink-0">
          <div>
            <SheetTitle className="text-lg tracking-tight">
              Create Shipment
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
              Fill in the details to dispatch a new tyre shipment
            </SheetDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#f0f4ff] border border-[#c7d7fe] rounded-lg px-3 py-1.5">
              <p className="text-[10px] text-[#4b6cb7] tracking-wide uppercase">
                Shipment ID
              </p>
              <p className="text-sm text-[#1d4ed8] tracking-tight">
                SHP-2026-00143
              </p>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-8 py-6 space-y-0">
            {/* ═══════════ SECTION 1: Destinations & Items ═══════════ */}
            <SectionHeader
              icon={<MapPin className="w-4 h-4" />}
              title="Destinations & Items"
              description="Add destinations and their respective shipment items"
              number={1}
            />

            <div className="mt-5 space-y-6">
              {dealerEntries.map((entry, index) => {
                const selectedDealer = dealers.find(
                  (d) => d.id === entry.dealerId,
                );
                return (
                  <div
                    key={entry.id}
                    className="p-5 border border-border rounded-xl bg-[#fafbfc] space-y-6 relative shadow-sm"
                  >
                    {dealerEntries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDealerEntry(entry.id)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-[#f0f4ff] text-[#1d4ed8] border-[#c7d7fe] px-2.5 py-0.5"
                      >
                        Destination {index + 1}
                      </Badge>
                      <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1">
                        <FileText className="w-3 h-3 text-[#16a34a]" />
                        <span className="text-[10px] text-[#15803d] uppercase tracking-wider">
                          LR No.
                        </span>
                        <span className="text-xs text-[#166534] tracking-tight">
                          LR-2026-{String(143).padStart(5, "0")}-
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Dealer Search */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">
                            Search Dealer
                          </Label>
                          <Popover
                            open={openDealerPopoverId === entry.id}
                            onOpenChange={(open) =>
                              setOpenDealerPopoverId(open ? entry.id : null)
                            }
                            modal={true}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openDealerPopoverId === entry.id}
                                className="w-full justify-between bg-white border-border h-11 px-4 hover:bg-white"
                              >
                                <span
                                  className={`flex items-center gap-2 truncate ${!selectedDealer ? "text-muted-foreground" : "text-foreground"}`}
                                >
                                  {selectedDealer ? (
                                    <>
                                      <Building2 className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                                      {selectedDealer.name}
                                      <span className="text-muted-foreground text-xs">
                                        — {selectedDealer.location}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Search className="w-4 h-4 shrink-0" />
                                      Search dealer...
                                    </>
                                  )}
                                </span>
                                <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[--radix-popover-trigger-width] p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput placeholder="Type dealer name or location..." />
                                <CommandList>
                                  <CommandEmpty>
                                    <div className="flex flex-col items-center gap-1 py-4">
                                      <Search className="w-5 h-5 text-muted-foreground/40" />
                                      <span className="text-sm text-muted-foreground">
                                        No dealer found
                                      </span>
                                      <span className="text-xs text-muted-foreground/60">
                                        Try a different search term
                                      </span>
                                    </div>
                                  </CommandEmpty>
                                  <CommandGroup heading="Available Dealers">
                                    {dealers.map((d) => (
                                      <CommandItem
                                        key={d.id}
                                        value={`${d.name} ${d.location}`}
                                        onSelect={() => {
                                          updateDealerEntry(
                                            entry.id,
                                            "dealerId",
                                            d.id === entry.dealerId ? "" : d.id,
                                          );
                                          setOpenDealerPopoverId(null);
                                        }}
                                        className="flex items-center justify-between gap-3 py-2.5 px-3"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-8 h-8 rounded-lg bg-[#eef2ff] border border-[#c7d7fe] flex items-center justify-center shrink-0">
                                            <Building2 className="w-3.5 h-3.5 text-[#4338ca]" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm text-foreground truncate">
                                              {d.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground truncate">
                                              {d.location} &middot; {d.distance}{" "}
                                              km
                                            </p>
                                          </div>
                                        </div>
                                        <Check
                                          className={`w-4 h-4 shrink-0 ${entry.dealerId === d.id
                                            ? "text-[#1d4ed8] opacity-100"
                                            : "opacity-0"
                                            }`}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Plant Number Selection */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Plant Number
                          </Label>
                          <Select
                            value={entry.plantNumber}
                            onValueChange={(val) =>
                              updateDealerEntry(entry.id, "plantNumber", val)
                            }
                          >
                            <SelectTrigger className="w-full bg-white border-border h-11">
                              <SelectValue placeholder="Select plant..." />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Set(
                                  mockInvoices
                                    .filter(
                                      (i) =>
                                        i.status === "Pending" ||
                                        i.status === "Delayed",
                                    )
                                    .map((i) => i.plantNumber),
                                ),
                              ).map((plant) => (
                                <SelectItem key={plant} value={plant}>
                                  {plant}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Invoices List for Selected Plant */}
                          {entry.plantNumber && (
                            <div className="mt-3 space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <FileText className="w-3 h-3" />
                                Associated Invoices
                              </Label>
                              <div className="bg-white border border-border rounded-lg p-3 space-y-2">
                                {mockInvoices
                                  .filter(
                                    (i) => i.plantNumber === entry.plantNumber,
                                  )
                                  .map((inv) => (
                                    <div
                                      key={inv.id}
                                      className="flex flex-col gap-2 border-b border-border last:border-0 pb-2 last:pb-0"
                                    >
                                      <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-foreground">
                                          {inv.lrNumber}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-muted-foreground text-[11px]">
                                            {format(
                                              new Date(
                                                inv.invoiceDate + "T00:00:00",
                                              ),
                                              "dd MMM yyyy",
                                            )}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={`px-1.5 py-0 text-[10px] ${inv.status === "Delayed" ? "bg-rose-100 text-rose-700 border-transparent" : "bg-amber-100 text-amber-700 border-transparent"}`}
                                          >
                                            {inv.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {inv.invoiceNumbers.map((invNum) => (
                                          <Badge
                                            key={invNum}
                                            variant="secondary"
                                            className="bg-[#f0f4ff] text-[#1d4ed8] hover:bg-[#f0f4ff] border-0 text-xs font-medium"
                                          >
                                            {invNum}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Dealer Info Card */}
                        {selectedDealer && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-white border border-border rounded-xl p-3.5 space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Navigation className="w-3 h-3" /> Distance
                              </p>
                              <p className="text-foreground font-bold text-[14px]">
                                {selectedDealer.distance} km
                              </p>
                            </div>
                            <div className="bg-white border border-border rounded-xl p-3.5 space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> Est. Delivery
                              </p>
                              <p className="text-sm text-foreground font-bold">
                                ~{selectedDealer.estimatedTime}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Weight Fields */}
                      <div className="space-y-4">
                        <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Package className="w-3.5 h-3.5" />
                          Item Quantities & Weight
                        </h4>

                        {/* Tyres */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Total Tyres
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={entry.totalTyres || ""}
                            onChange={(e) =>
                              updateDealerEntry(
                                entry.id,
                                "totalTyres",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder="0"
                            className="bg-white border-border h-11"
                          />
                        </div>

                        {/* Tubes */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Total Tubes
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={entry.totalTubes || ""}
                            onChange={(e) =>
                              updateDealerEntry(
                                entry.id,
                                "totalTubes",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder="0"
                            className="bg-white border-border h-11"
                          />
                        </div>

                        {/* Flaps */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Total Flaps
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            value={entry.totalFlaps || ""}
                            onChange={(e) =>
                              updateDealerEntry(
                                entry.id,
                                "totalFlaps",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            placeholder="0"
                            className="bg-white border-border h-11"
                          />
                        </div>

                        {/* Auto-calculated Total Quantity */}
                        <div className="bg-[#eef2ff] border border-[#c7d7fe] rounded-xl p-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#4338ca]" />
                            <span className="text-xs text-[#4338ca]">
                              Total Quantity
                            </span>
                          </div>
                          <span className="text-sm text-[#1d4ed8] tracking-tight">
                            {entry.totalTyres +
                              entry.totalTubes +
                              entry.totalFlaps}{" "}
                            pcs
                          </span>
                        </div>

                        {/* Weight */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Weight className="w-3 h-3" />
                            Weight (kg)
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.5"
                            value={entry.weight}
                            onChange={(e) =>
                              updateDealerEntry(
                                entry.id,
                                "weight",
                                e.target.value,
                              )
                            }
                            placeholder="Enter weight in kg"
                            className="bg-white border-border h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                variant="outline"
                onClick={addDealerEntry}
                className="w-full py-6 border-dashed border-2 hover:bg-[#f0f4ff] hover:text-[#1d4ed8] hover:border-[#c7d7fe] transition-colors bg-[#fafbfc]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Destination
              </Button>
            </div>

            <Separator className="my-8" />

            {/* ═══════════ SECTION 2: Vehicle & Driver ═══════════ */}
            <SectionHeader
              icon={<Truck className="w-4 h-4" />}
              title="Vehicle & Driver Assignment"
              description="Assign transport and driver for this shipment"
              number={2}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
              {/* Vehicle Column */}
              <div className="space-y-4">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5" />
                  Vehicle Details
                </h4>
                <div className="space-y-4">
                  {/* Vehicle Type Radio Buttons */}
                  <div className="space-y-2.5">
                    <Label className="text-xs text-muted-foreground">
                      Vehicle Type
                    </Label>
                    <RadioGroup
                      value={vehicleType}
                      onValueChange={(v) => {
                        setVehicleType(v);
                        setVehicleId("");
                        setRentedVehicleNumber("");
                      }}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        htmlFor="vehicle-own"
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${vehicleType === "Own"
                          ? "border-[#1d4ed8] bg-[#eef2ff] ring-1 ring-[#1d4ed8]/20"
                          : "border-border bg-white hover:border-muted-foreground/30"
                          }`}
                      >
                        <RadioGroupItem value="Own" id="vehicle-own" />
                        <div>
                          <p
                            className={`text-sm ${vehicleType === "Own" ? "text-[#1d4ed8]" : "text-foreground"}`}
                          >
                            Own Vehicle
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            From your fleet
                          </p>
                        </div>
                      </label>
                      <label
                        htmlFor="vehicle-rented"
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${vehicleType === "Rented"
                          ? "border-[#ea580c] bg-orange-50 ring-1 ring-orange-400/20"
                          : "border-border bg-white hover:border-muted-foreground/30"
                          }`}
                      >
                        <RadioGroupItem value="Rented" id="vehicle-rented" />
                        <div>
                          <p
                            className={`text-sm ${vehicleType === "Rented" ? "text-[#ea580c]" : "text-foreground"}`}
                          >
                            Rented Vehicle
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            External / hired
                          </p>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Own Vehicle — Searchable Dropdown */}
                  {vehicleType === "Own" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Vehicle Number
                      </Label>
                      <Popover
                        open={vehicleOpen}
                        onOpenChange={setVehicleOpen}
                        modal={true}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={vehicleOpen}
                            className="w-full justify-between bg-white border-border h-10 px-3 hover:bg-white"
                          >
                            <span
                              className={`flex items-center gap-2 truncate ${!selectedVehicle ? "text-muted-foreground" : "text-foreground"}`}
                            >
                              {selectedVehicle ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                                  {selectedVehicle.number}
                                  <span className="text-muted-foreground text-xs">
                                    ({selectedVehicle.capacity} kg)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3.5 h-3.5 shrink-0" />
                                  Search vehicle number...
                                </>
                              )}
                            </span>
                            <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[--radix-popover-trigger-width] p-0"
                          align="start"
                        >
                          <Command>
                            <CommandInput placeholder="Type vehicle number..." />
                            <CommandList>
                              <CommandEmpty>
                                <div className="flex flex-col items-center gap-1 py-3">
                                  <Truck className="w-4 h-4 text-muted-foreground/40" />
                                  <span className="text-sm text-muted-foreground">
                                    No vehicle found
                                  </span>
                                </div>
                              </CommandEmpty>
                              <CommandGroup heading="Own Vehicles">
                                {ownVehicles.map((v) => (
                                  <CommandItem
                                    key={v.id}
                                    value={v.number}
                                    disabled={v.isAssigned}
                                    onSelect={() => {
                                      setVehicleId(
                                        v.id === vehicleId ? "" : v.id,
                                      );
                                      setVehicleOpen(false);
                                    }}
                                    className="flex items-center justify-between gap-2 py-2.5"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        <Truck className="w-3 h-3 text-blue-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm text-foreground truncate">
                                          {v.number}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          Capacity: {v.capacity} kg
                                          {v.isAssigned && (
                                            <span className="text-red-500 ml-1">
                                              (Assigned)
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <Check
                                      className={`w-4 h-4 shrink-0 ${vehicleId === v.id
                                        ? "text-[#1d4ed8] opacity-100"
                                        : "opacity-0"
                                        }`}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Rented Vehicle — Manual Input */}
                  {vehicleType === "Rented" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Vehicle Number
                      </Label>
                      <Input
                        value={rentedVehicleNumber}
                        onChange={(e) =>
                          setRentedVehicleNumber(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. MH04XX1234"
                        className="bg-white border-border h-10 uppercase"
                      />

                      {rentedVehicleNumber && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Enter the full registration number of the rented
                          vehicle
                        </p>
                      )}
                    </div>
                  )}

                  {/* Capacity Info */}
                  {selectedVehicle && vehicleType === "Own" && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50/60 border border-blue-100 rounded-lg">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs text-blue-700">
                        Vehicle capacity:{" "}
                        <span className="text-blue-900">
                          {selectedVehicle.capacity} kg
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Driver Column */}
              <div className="space-y-12">
                <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  Driver Details
                </h4>
                <div className="space-y-4">
                  {vehicleType === "Rented" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Driver Type
                      </Label>
                      <Select
                        value={driverType}
                        onValueChange={(v) => {
                          setDriverType(v);
                          setDriverId("");
                        }}
                      >
                        <SelectTrigger className="bg-white border-border h-10">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Own">Own Driver</SelectItem>
                          <SelectItem value="Rented">Rented Driver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Driver Name
                    </Label>
                    <Select value={driverId} onValueChange={setDriverId}>
                      <SelectTrigger className="bg-white border-border h-10">
                        <SelectValue placeholder="Select driver..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDrivers.map((d) => (
                          <SelectItem
                            key={d.id}
                            value={d.id}
                            disabled={d.isOnTrip}
                          >
                            <span className="flex items-center gap-6">
                              {d.name}
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 rounded-sm ${d.type === "Own"
                                  ? "border-emerald-200 text-emerald-600 bg-emerald-50/60"
                                  : "border-violet-200 text-violet-600 bg-violet-50/60"
                                  }`}
                              >
                                {d.type}
                              </Badge>
                              {d.isOnTrip && (
                                <span className="text-[10px] text-red-500">
                                  (On Trip)
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedDriver && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-700">
                        {selectedDriver.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            {(selectedVehicle?.isAssigned || selectedDriver?.isOnTrip) && (
              <div className="mt-4 space-y-2">
                {selectedVehicle?.isAssigned && (
                  <ValidationWarning message="This vehicle is already assigned to an active shipment." />
                )}
                {selectedDriver?.isOnTrip && (
                  <ValidationWarning message="This driver is currently on an active trip." />
                )}
              </div>
            )}

            {/* ── Summary Card ─────────────────── */}
            <div className="mt-8 bg-[#fafbfc] border border-border rounded-xl p-5">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <SummaryMetric
                  icon={<Hash className="w-4 h-4 text-[#1d4ed8]" />}
                  label="Total Tyres"
                  value={`${totalTyresAll}`}
                />

                <SummaryMetric
                  icon={<Hash className="w-4 h-4 text-[#6366f1]" />}
                  label="Total Tubes"
                  value={`${totalTubesAll}`}
                />

                <SummaryMetric
                  icon={<Hash className="w-4 h-4 text-[#8b5cf6]" />}
                  label="Total Flaps"
                  value={`${totalFlapsAll}`}
                />

                <SummaryMetric
                  icon={<Layers className="w-4 h-4 text-[#1d4ed8]" />}
                  label="Total Quantity"
                  value={`${totalQuantity}`}
                />

                <SummaryMetric
                  icon={<Weight className="w-4 h-4 text-[#1d4ed8]" />}
                  label="Total Weight"
                  value={`${totalWeight} kg`}
                />
              </div>

              {overCapacity && (
                <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      Weight exceeds vehicle capacity
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Total weight ({totalWeight} kg) exceeds the selected
                      vehicle capacity ({selectedVehicle?.capacity} kg) by{" "}
                      {totalWeight - (selectedVehicle?.capacity || 0)} kg. Please reduce
                      items or select a larger vehicle.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom spacer for sticky footer */}
            <div className="h-6" />
          </div>
        </div>

        {/* ── STICKY FOOTER ────────────────────── */}
        <div className="border-t border-border bg-white px-8 py-4 flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-border">
              Save Draft
            </Button>
            <Button variant="outline" className="border bg-red-500 text-white  hover:bg-red-500 hover:text-white">
              cancel Shipment
            </Button>

            <Button
              className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm min-w-[160px]"
              disabled={overCapacity || false}
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Shipment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── SUB-COMPONENTS ─────────────────────────────── */

function SectionHeader({ icon, title, description, number }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-[#eef2ff] border border-[#c7d7fe] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs text-[#4338ca]">{number}</span>
      </div>
      <div>
        <h3 className="text-sm text-foreground flex items-center gap-2 font-medium">
          {icon}
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SummaryMetric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-lg text-foreground tracking-tight font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function ValidationWarning({ message }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span className="text-xs text-amber-700">{message}</span>
    </div>
  );
}
