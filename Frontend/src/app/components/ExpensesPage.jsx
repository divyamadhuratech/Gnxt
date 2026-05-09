import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Wallet, Fuel, CircleDollarSign, Wrench, MoreHorizontal, ChevronLeft, ChevronRight, CalendarDays, Eye, X, Upload, CreditCard, Banknote, Smartphone, FileText, } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { format } from "date-fns";

/* ── TYPES ────────��──────────────────────── */

const HIGH_EXPENSE_THRESHOLD = 5000;

const expenseTypes = [
  "Fuel",
  "Toll",
  "Maintenance",
  "Loading/Unloading",
  "Driver Allowance",
  "Miscellaneous",
];

const ITEMS_PER_PAGE = 8;

/* ── COMPONENT ─────────────────────────────── */

export function ExpensesPage() {

  const [expenses, setExpenses] = useState([]);

  const shipmentIds = useMemo(
  () =>
    [...new Set(expenses.map((e) => e.lrNumber))]
      .filter((id) => id && id !== ""),
  [expenses]
);
 const vehicleIds = useMemo(
  () =>
    [...new Set(expenses.map((e) => e.vehicleId))]
      .filter((id) => id && id !== ""),
  [expenses]
);
  const driverNames = useMemo(
  () =>
    [...new Set(expenses.map((e) => e.driverName))]
      .filter((name) => name && name !== ""),
  [expenses]
);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShipment, setFilterShipment] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterDriver, setFilterDriver] = useState("all");
  const [filterExpenseType, setFilterExpenseType] = useState("all");
  const [dateFrom, setDateFrom] = useState();
  const [dateTo, setDateTo] = useState();
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalLr, setAddModalLr] = useState(null);
  const [viewExpense, setViewExpense] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/expenses");

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filtered + sorted data
  const filtered = useMemo(() => {
    let data = [...expenses];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (e) =>
          (e.lrNumber || "").toLowerCase().includes(q) ||
          (e.driverName || "").toLowerCase().includes(q) ||
          (e.vehicleId || "").toLowerCase().includes(q)
      );
    }
    if (filterShipment !== "all")
      data = data.filter((e) => e.lrNumber === filterShipment);
    if (filterVehicle !== "all")
      data = data.filter((e) => e.vehicleId === filterVehicle);
    if (filterDriver !== "all")
      data = data.filter((e) => e.driverName === filterDriver);
    if (filterExpenseType !== "all")
      data = data.filter((e) => e.expenseType === filterExpenseType);
    if (dateFrom) data = data.filter((e) => new Date(e.date) >= dateFrom);
    if (dateTo) data = data.filter((e) => new Date(e.date) <= dateTo);

    data.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return data;
  }, [
    searchQuery,
    filterShipment,
    filterVehicle,
    filterDriver,
    filterExpenseType,
    dateFrom,
    dateTo,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Summary calculations
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const fuelCost = expenses
    .filter((e) => e.expenseType === "Fuel")
    .reduce((s, e) => s + e.amount, 0);
  const tollCharges = expenses
    .filter((e) => e.expenseType === "Toll")
    .reduce((s, e) => s + e.amount, 0);
  const maintenance = expenses
    .filter((e) => e.expenseType === "Maintenance")
    .reduce((s, e) => s + e.amount, 0);
  const otherExpenses = totalExpenses - fuelCost - tollCharges - maintenance;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterShipment("all");
    setFilterVehicle("all");
    setFilterDriver("all");
    setFilterExpenseType("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  const addExpense = async (newExpense) => {
    try {
      const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to save expense");
      }

      const savedExpense = await response.json();

      setExpenses((prev) => [...prev, savedExpense]);

    } catch (err) {
      console.error(err);
    }
  };

  const hasActiveFilters =
    searchQuery ||
    filterShipment !== "all" ||
    filterVehicle !== "all" ||
    filterDriver !== "all" ||
    filterExpenseType !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* ── Header ──────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track and manage shipment-related costs
          </p>
    
        </div>
        <Button
          onClick={() => {
            setAddModalLr(null);
            setAddModalOpen(true);
          }}
          className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      {/* ── Filters Bar ─────────────────────── */}
      <div className="bg-white border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search LR number, driver..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 bg-[#f5f6f8] border-transparent text-sm focus:border-border focus:bg-white"
            />
          </div>

          {/* Date From */}
          <Popover
            open={dateFromOpen}
            onOpenChange={setDateFromOpen}
            modal={true}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 px-3 text-xs gap-1.5 border-border bg-white hover:bg-white ${!dateFrom ? "text-muted-foreground" : "text-foreground"}`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                {dateFrom
                  ? dateFrom.toDateString() === new Date().toDateString()
                    ? "Today"
                    : format(dateFrom, "dd MMM yyyy")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => {
                  setDateFrom(d ?? undefined);
                  setDateFromOpen(false);
                  setCurrentPage(1);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover open={dateToOpen} onOpenChange={setDateToOpen} modal={true}>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => {
                  setDateTo(d ?? undefined);
                  setDateToOpen(false);
                  setCurrentPage(1);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* LR Number */}
          <Select
            value={filterShipment}
            onValueChange={(v) => {
              setFilterShipment(v);
              setCurrentPage(1);
            }}
          >
            <SelectContent>
              <SelectItem value="all">All LR Numbers</SelectItem>
              {shipmentIds.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Vehicle */}
          <Select
            value={filterVehicle}
            onValueChange={(v) => {
              setFilterVehicle(v);
              setCurrentPage(1);
            }}
          >
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicleIds.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Driver */}
          <Select
            value={filterDriver}
            onValueChange={(v) => {
              setFilterDriver(v);
              setCurrentPage(1);
            }}
          >
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {driverNames.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Expense Type */}
          <Select
            value={filterExpenseType}
            onValueChange={(v) => {
              setFilterExpenseType(v);
              setCurrentPage(1);
            }}
          >
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {expenseTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard
          icon={<Wallet className="w-4 h-4 text-[#1d4ed8]" />}
          label="Total Expenses"
          amount={totalExpenses}
          accent="blue"
        />
        <SummaryCard
          icon={<Fuel className="w-4 h-4 text-[#ea580c]" />}
          label="Fuel Cost"
          amount={fuelCost}
          accent="orange"
        />
        <SummaryCard
          icon={<CircleDollarSign className="w-4 h-4 text-[#7c3aed]" />}
          label="Toll Charges"
          amount={tollCharges}
          accent="purple"
        />
        <SummaryCard
          icon={<Wrench className="w-4 h-4 text-[#059669]" />}
          label="Maintenance"
          amount={maintenance}
          accent="green"
        />
        <SummaryCard
          icon={<MoreHorizontal className="w-4 h-4 text-[#6b7280]" />}
          label="Other Expenses"
          amount={otherExpenses}
          accent="gray"
        />
      </div>

      {/* ── Expenses Table ───────────────────── */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f9fb] hover:bg-[#f8f9fb]">
                <SortableHead
                  label="LR Number"
                  field="lrNumber"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Date"
                  field="date"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Driver Name"
                  field="driverName"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Vehicle ID"
                  field="vehicleId"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Expense Type"
                  field="expenseType"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Amount (₹)"
                  field="amount"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                  className="text-right"
                />
                <TableHead className="text-xs text-muted-foreground">
                  Payment
                </TableHead>
                <SortableHead
                  label="Status"
                  field="status"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <TableHead className="text-xs text-muted-foreground text-right w-[80px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Wallet className="w-8 h-8 opacity-30" />
                      <p className="text-sm">No expenses found</p>
                      <p className="text-xs">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((expense, idx) => (
                  <TableRow
                    key={expense.id}
                    className={`transition-colors hover:bg-[#f8f9fb] ${idx % 2 === 1 ? "bg-[#fbfbfc]" : ""
                      } ${expense.amount >= HIGH_EXPENSE_THRESHOLD
                        ? "border-l-2 border-l-red-300"
                        : ""
                      }`}
                  >
                    <TableCell className="text-sm text-foreground">
                      <span className="bg-[#f0f4ff] text-[#1d4ed8] px-2 py-0.5 rounded text-xs tracking-tight">
                        {expense.lrNumber}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(
                        new Date(expense.date + "T00:00:00"),
                        "dd MMM yyyy",
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {expense.driverName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tracking-tight">
                      {expense.vehicleId}
                    </TableCell>
                    <TableCell>
                      <ExpenseTypeBadge type={expense.expenseType} />
                    </TableCell>
                    <TableCell className="text-sm text-right tabular-nums">
                      <span
                        className={
                          expense.amount >= HIGH_EXPENSE_THRESHOLD
                            ? "text-red-600"
                            : "text-foreground"
                        }
                      >
                        ₹{expense.amount.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentModeBadge mode={expense.paymentMode} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={expense.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            className="gap-2 text-xs"
                            onClick={() => setViewExpense(expense)}
                          >
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-xs"
                            onClick={() => {
                              setAddModalLr(expense.lrNumber);
                              setAddModalOpen(true);
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            –{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length} expenses
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className={`w-8 h-8 text-xs ${page === currentPage ? "bg-[#1d4ed8] hover:bg-[#1e40af] text-white" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Add Expense Modal ──────────────── */}
      <AddExpenseModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        lr={addModalLr}
        onSave={addExpense}
        expenses={expenses}
        shipmentIds={shipmentIds}
        expenseTypes={expenseTypes}
      />
      {/* ── View Expense Dialog ────────────── */}
      <ViewExpenseDialog
        expense={viewExpense}
        onClose={() => setViewExpense(null)}
      />
    </div>
  );
}

/* ── SUB-COMPONENTS ──────────────────────────── */
function SummaryCard({ icon, label, amount, accent }) {
  const bgMap = {
    blue: "bg-blue-50/60 border-blue-100",
    orange: "bg-orange-50/60 border-orange-100",
    purple: "bg-violet-50/60 border-violet-100",
    green: "bg-emerald-50/60 border-emerald-100",
    gray: "bg-gray-50/60 border-gray-100",
  };

  return (
    <div className={`rounded-xl border p-4 ${bgMap[accent]} transition-colors`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg text-foreground tabular-nums tracking-tight">
        ₹{amount.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function SortableHead({ label, field, current, dir, onSort, className = "" }) {
  const isActive = current === field;
  return (
    <TableHead className={`text-xs text-muted-foreground ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${className.includes("text-right") ? "ml-auto" : ""} ${isActive ? "text-foreground" : ""}`}
      >
        {label}
      </button>
    </TableHead>
  );
}

function ExpenseTypeBadge({ type }) {
  const styles = {
    Fuel: "bg-orange-50 text-orange-700 border-orange-200",
    Toll: "bg-violet-50 text-violet-700 border-violet-200",
    Maintenance: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Loading/Unloading": "bg-blue-50 text-blue-700 border-blue-200",
    "Driver Allowance": "bg-amber-50 text-amber-700 border-amber-200",
    Miscellaneous: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${styles[type]}`}
    >
      {type}
    </Badge>
  );
}

function PaymentModeBadge({ mode }) {
  const iconMap = {
    Cash: <Banknote className="w-3 h-3" />,
    UPI: <Smartphone className="w-3 h-3" />,
    Card: <CreditCard className="w-3 h-3" />,
  };

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {iconMap[mode]}
      {mode}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-2 py-0.5 ${status === "Approved"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200"
        }`}
    >
      {status}
    </Badge>
  );
}

/* ── Add Expense Modal ──────────────────────── */

function AddExpenseModal({ open, onOpenChange, lr, onSave, expenses, shipmentIds }) {
  const [entries, setEntries] = useState([{ id: 1 }]);
  const [openDatePopovers, setOpenDatePopovers] = useState({});
  const [entryDates, setEntryDates] = useState({});
  const [entryAmounts, setEntryAmounts] = useState({});
  const [entryTypes, setEntryTypes] = useState({});
  const [entryLiters, setEntryLiters] = useState({});
  const [lrSearch, setLrSearch] = useState("");
  const [selectedLr, setSelectedLr] = useState(lr);
  const [lrDropdownOpen, setLrDropdownOpen] = useState(false);

  const filteredLrs = shipmentIds.filter((lr) =>
    (lr || "").toLowerCase().includes(lrSearch.toLowerCase()),
  );

  let nextId =
    entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;

  const addEntry = () => {
    setEntries((prev) => [...prev, { id: nextId }]);
  };

  const removeEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setOpenDatePopovers((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setEntryDates((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setEntryAmounts((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setEntryTypes((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setEntryLiters((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const totalAmount = entries.reduce(
    (sum, e) => sum + (entryAmounts[e.id] || 0),
    0,
  );

  const handleSave = async () => {

    if (!selectedLr && !lr) {
      alert("Please select LR Number");
      return;
    }

    const payload = entries.map((entry) => ({
      id: crypto.randomUUID(),
      lrNumber: selectedLr || lr,
      date: entryDates[entry.id]
        ? format(entryDates[entry.id], "yyyy-MM-dd")
        : null,
      driverName: expenses.find(
        (e) => e.lrNumber === (selectedLr || lr)
      )?.driverName || "",

      vehicleId: expenses.find(
        (e) => e.lrNumber === (selectedLr || lr)
      )?.vehicleId || "",

      expenseType: entryTypes[entry.id] || "",
      amount: entryAmounts[entry.id] || 0,
      liters: entryLiters[entry.id] || null,
      paymentMode: "Cash",
      status: "Pending",
    }));

    for (const expense of payload) {
      await onSave(expense);
    }

    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base tracking-tight">
            Add Expense
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Record a new shipment-related expense
          </DialogDescription>
        </DialogHeader>
        <Separator className="mt-4" />
        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* LR Number - read-only when opened from table action, search when opened from header */}
          {lr ? (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">LR Number</Label>
              <div className="flex items-center gap-2 h-10 px-3 bg-[#f8f9fb] border border-border rounded-md">
                <FileText className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span className="bg-[#f0f4ff] text-[#1d4ed8] px-2 py-0.5 rounded text-xs tracking-tight">
                  {lr}
                </span>
                {(() => {
                  const lrExp = expenses.find((e) => e.lrNumber === lr);
                  return lrExp ? (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {lrExp.driverName} &middot; {lrExp.vehicleId}
                    </span>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                LR Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search LR number..."
                  value={selectedLr ?? lrSearch}
                  onChange={(e) => {
                    setLrSearch(e.target.value);
                    setSelectedLr(null);
                    setLrDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (!selectedLr) setLrDropdownOpen(true);
                  }}
                  className="pl-9 h-10 bg-white border-border text-sm"
                />

                {selectedLr && (
                  <button
                    onClick={() => {
                      setSelectedLr(null);
                      setLrSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {lrDropdownOpen && !selectedLr && lrSearch.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-[160px] overflow-y-auto">
                    {filteredLrs.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                        No LR numbers found
                      </div>
                    ) : (
                      filteredLrs.map((lr) => {
                        const lrExpenses = expenses.filter(
                          (e) => e.lrNumber === lr,
                        );
                        const driver = lrExpenses[0]?.driverName ?? "";
                        const vehicle = lrExpenses[0]?.vehicleId ?? "";
                        return (
                          <button
                            key={lr}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#f0f4ff] transition-colors flex items-center justify-between gap-2"
                            onClick={() => {
                              setSelectedLr(lr);
                              setLrSearch("");
                              setLrDropdownOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="bg-[#f0f4ff] text-[#1d4ed8] px-1.5 py-0.5 rounded text-xs tracking-tight">
                                {lr}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {driver}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {vehicle}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="border border-border rounded-lg p-4 space-y-4 bg-[#f8f9fb]/50 relative"
            >
              {/* Entry header */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Expense Entry {idx + 1}
                </span>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-muted-foreground hover:text-red-600"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              {/* Date */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Popover
                  open={openDatePopovers[entry.id] ?? false}
                  onOpenChange={(o) =>
                    setOpenDatePopovers((prev) => ({ ...prev, [entry.id]: o }))
                  }
                  modal={true}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-10 text-sm bg-white border-border hover:bg-white gap-2 ${!entryDates[entry.id] ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      {entryDates[entry.id]
                        ? format(entryDates[entry.id], "dd MMM yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={entryDates[entry.id]}
                      onSelect={(d) => {
                        setEntryDates((prev) => ({
                          ...prev,
                          [entry.id]: d ?? undefined,
                        }));
                        setOpenDatePopovers((prev) => ({
                          ...prev,
                          [entry.id]: false,
                        }));
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expense Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Expense Type
                  </Label>
                  <Select
                    value={entryTypes[entry.id] ?? ""}
                    onValueChange={(v) => {
                      setEntryTypes((prev) => ({ ...prev, [entry.id]: v }));
                      if (v !== "Fuel")
                        setEntryLiters((prev) => {
                          const n = { ...prev };
                          delete n[entry.id];
                          return n;
                        });
                    }}
                  >
                    <SelectTrigger className="h-10 bg-white border-border text-sm">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Mode */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Payment Mode
                  </Label>
                  <Select>
                    <SelectTrigger className="h-10 bg-white border-border text-sm">
                      <SelectValue placeholder="Select mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    className="pl-7 h-10 bg-white border-border"
                    onChange={(e) =>
                      setEntryAmounts((prev) => ({
                        ...prev,
                        [entry.id]: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Liters Consumed — only when Fuel is selected */}
              {entryTypes[entry.id] === "Fuel" && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Liters Consumed
                  </Label>
                  <div className="relative">
                    <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      placeholder="0.0"
                      value={entryLiters[entry.id] ?? ""}
                      onChange={(e) =>
                        setEntryLiters((prev) => ({
                          ...prev,
                          [entry.id]: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="pl-9 pr-12 h-10 bg-white border-border text-sm"
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      Ltrs
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Entry Button */}
          <Button
            variant="outline"
            className="w-full gap-2 text-xs border-dashed border-border text-muted-foreground hover:text-[#1d4ed8] hover:border-[#1d4ed8]/30"
            onClick={addEntry}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense Entry
          </Button>

          {/* Total Expense */}
          <div className="flex items-center justify-between bg-[#f0f4ff] border border-[#1d4ed8]/20 rounded-lg px-4 py-3">
            <span className="text-xs text-[#1d4ed8]">Total Trip Expense</span>
            <span className="text-sm text-[#1d4ed8] tabular-nums">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              placeholder="Add any additional details..."
              className="bg-white border-border resize-none h-20 text-sm"
            />
          </div>

          {/* Upload Receipt */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Upload Receipt
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#1d4ed8]/30 hover:bg-[#f0f4ff]/30 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Drag & drop or{" "}
                <span className="text-[#1d4ed8] hover:underline">browse</span>{" "}
                to upload
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                PNG, JPG, PDF up to 5MB
              </p>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            Save Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── View Expense Dialog ────────────────────── */

function ViewExpenseDialog({ expense, onClose }) {
  if (!expense) return null;

  return (
    <Dialog open={!!expense} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-base tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1d4ed8]" />
            Expense Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {expense.id}
          </DialogDescription>
        </DialogHeader>
        <Separator className="mt-4" />
        <div className="px-6 py-5 space-y-4">
          <DetailRow label="LR Number" value={expense.lrNumber} />
          <DetailRow
            label="Date"
            value={format(new Date(expense.date + "T00:00:00"), "dd MMM yyyy")}
          />
          <DetailRow label="Driver" value={expense.driverName} />
          <DetailRow label="Vehicle" value={expense.vehicleId} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Type</span>
            <ExpenseTypeBadge type={expense.expenseType} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Amount</span>
            <span className="text-sm text-foreground tabular-nums">
              ₹{expense.amount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Payment</span>
            <PaymentModeBadge mode={expense.paymentMode} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <StatusBadge status={expense.status} />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <Button variant="outline" onClick={onClose} className="border-border">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}
