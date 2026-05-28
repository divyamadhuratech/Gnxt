import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  Search,
  History,
  Eye,
  Package,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  XCircle,
  Truck,
  FileCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "../ui/utils";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    "In Transit": { cls: "bg-blue-50 text-blue-700 border-blue-200",         icon: <Truck className="w-3 h-3" /> },
    "Pending":    { cls: "bg-amber-50 text-amber-700 border-amber-200",       icon: <Clock className="w-3 h-3" /> },
    "Cancelled":  { cls: "bg-red-50 text-red-700 border-red-200",             icon: <XCircle className="w-3 h-3" /> },
    "Delivered":  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const cfg = map[status] || { cls: "bg-gray-50 text-gray-600 border-gray-200", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border font-medium ${cfg.cls}`}>
      {cfg.icon}{status}
    </span>
  );
}

// ─── POD badge ───────────────────────────────────────────────────────────────
function PodBadge({ status }) {
  if (status === "Signed")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
        <CheckCircle2 className="w-3 h-3" />Signed
      </span>
    );
  if (status === "Not Generated")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-gray-50 text-gray-600 border-gray-200 font-medium">
        <XCircle className="w-3 h-3" />Not Generated
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200 font-medium">
      <Clock className="w-3 h-3" />Pending
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────
const BASE_COLS = [
  {
    label: "Shipment ID",
    key: "id",
    render: (v, row) => (
      <>
        <span className="font-medium text-[#1d4ed8]">{v}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{row.items}</p>
      </>
    ),
  },
  { label: "Destination", key: "destination" },
  { label: "Driver",      key: "driver" },
  { label: "Vehicle",     key: "vehicle" },
];

const VIEW_COLS = {
  "Active Shipments": [
    ...BASE_COLS,
    { label: "ETA",    key: "eta",    render: (v) => <span className="text-sm text-muted-foreground">{v}</span> },
    { label: "Status", key: "status", render: (v) => <StatusBadge status={v} /> },
    { label: "",       key: "_view",  render: () => <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Button> },
  ],
  "Pending Dispatch": [
    ...BASE_COLS,
    { label: "Status", key: "status", render: (v) => <StatusBadge status={v} /> },
    { label: "",       key: "_view",  render: () => <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Button> },
  ],
  "Cancelled Dispatch": [
    ...BASE_COLS,
    { label: "Status", key: "status", render: (v) => <StatusBadge status={v} /> },
    { label: "",       key: "_view",  render: () => <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Button> },
  ],
  "Deliveries Today": [
    ...BASE_COLS,
    { label: "Delivered", key: "eta",       render: (v) => <span className="text-sm text-muted-foreground">{v}</span> },
    { label: "POD",       key: "podStatus", render: (v) => <PodBadge status={v} /> },
    { label: "",          key: "_view",     render: () => <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></Button> },
  ],
};

// ─── Views that support history toggle ───────────────────────────────────────
const HAS_HISTORY = new Set(["Active Shipments", "Deliveries Today"]);
// Views that support POD filter
const HAS_POD_FILTER = new Set(["Deliveries Today"]);

// ─── Main component ───────────────────────────────────────────────────────────
export function StatDetailView({ activeStatView, viewData, onBack }) {
  // All filter state lives here — stable, no parent re-renders
  const [searchQuery, setSearchQuery]   = useState("");
  const [podFilter, setPodFilter]       = useState("all");
  const [dateFilter, setDateFilter]     = useState(undefined);
  const [showHistory, setShowHistory]   = useState(false);

  const columns   = VIEW_COLS[activeStatView] || [];
  const hasHistory   = HAS_HISTORY.has(activeStatView);
  const hasPodFilter = HAS_POD_FILTER.has(activeStatView);

  // Pick current vs history dataset
  const baseData = showHistory
    ? (viewData.history || [])
    : (viewData.current || []);

  // Apply filters
  const tableData = useMemo(() => {
    return baseData.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.id.toLowerCase().includes(q) ||
        item.driver.toLowerCase().includes(q) ||
        item.vehicle.toLowerCase().includes(q);

      // POD filter (Deliveries Today only)
      const matchesPod =
        !hasPodFilter ||
        podFilter === "all" ||
        item.podStatus === podFilter;

      // Date filter (history mode)
      let matchesDate = true;
      if (showHistory && dateFilter) {
        const itemDate = item.deliveryDate || item.dispatchDate;
        if (itemDate) {
          const d = new Date(itemDate);
          d.setHours(0, 0, 0, 0);
          matchesDate = d.toDateString() === dateFilter.toDateString();
        }
      }

      return matchesSearch && matchesPod && matchesDate;
    });
  }, [baseData, searchQuery, podFilter, dateFilter, showHistory, hasPodFilter]);

  const handleHistoryToggle = () => {
    setShowHistory((prev) => {
      if (prev) setDateFilter(undefined); // clear date when leaving history
      return !prev;
    });
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {activeStatView}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {showHistory
              ? `Historical records for ${activeStatView.toLowerCase()}.`
              : `Detailed view of all ${activeStatView.toLowerCase()}.`}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Shipment ID, Driver, Vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-white border-border"
          />
        </div>

        {/* POD filter — Deliveries Today only */}
        {hasPodFilter && (
          <Select value={podFilter} onValueChange={setPodFilter}>
            <SelectTrigger className="w-[170px] h-9 bg-white border-border">
              <div className="flex items-center gap-2">
                <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="All PODs" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PODs</SelectItem>
              <SelectItem value="Signed">Signed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Not Generated">Not Generated</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Date picker — history mode only */}
        {hasHistory && showHistory && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[220px] justify-start text-left font-normal bg-white h-9 border-border",
                    !dateFilter && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? format(dateFilter, "PPP") : "All Time"}
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
                Clear
              </Button>
            )}
          </div>
        )}

        {/* History toggle */}
        {hasHistory && (
          <Button
            variant={showHistory ? "default" : "outline"}
            onClick={handleHistoryToggle}
            className={
              showHistory
                ? "bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                : "bg-white border-border"
            }
          >
            <History className="w-4 h-4 mr-2" />
            {showHistory ? "Current" : "History"}
          </Button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-[#fafbfc]">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={
                      i === 0
                        ? "pl-5"
                        : i === columns.length - 1
                        ? "pr-5 text-center w-[60px]"
                        : ""
                    }
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-foreground">No records found</p>
                      <p className="text-xs text-muted-foreground">
                        {showHistory
                          ? "No historical records match your filters."
                          : "No data available at the moment."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-[#fafbfe] transition-colors">
                    {columns.map((col, ci) => (
                      <TableCell
                        key={ci}
                        className={
                          ci === 0
                            ? "pl-5"
                            : ci === columns.length - 1
                            ? "pr-5 text-center"
                            : ""
                        }
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : (
                            <span className="text-sm text-foreground">
                              {item[col.key] ?? "—"}
                            </span>
                          )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
export default StatDetailView;
