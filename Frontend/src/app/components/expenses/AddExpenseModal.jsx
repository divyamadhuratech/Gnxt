import { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Fuel,
  CalendarDays,
  X,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { expenseTypes } from "./data/expensesData";

export function AddExpenseModal({ open, onOpenChange, lr, onSave, expenses, shipmentIds }) {
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
      driverName:
        expenses.find((e) => e.lrNumber === (selectedLr || lr))?.driverName || "",
      vehicleId:
        expenses.find((e) => e.lrNumber === (selectedLr || lr))?.vehicleId || "",
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
          <DialogTitle className="text-base tracking-tight">Add Expense</DialogTitle>
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
                        const lrExpenses = expenses.filter((e) => e.lrNumber === lr);
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
                              <span className="text-xs text-muted-foreground">{driver}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{vehicle}</span>
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
                <span className="text-xs text-muted-foreground">Expense Entry {idx + 1}</span>
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
                      className={`w-full justify-start h-10 text-sm bg-white border-border hover:bg-white gap-2 ${
                        !entryDates[entry.id] ? "text-muted-foreground" : "text-foreground"
                      }`}
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
                  <Label className="text-xs text-muted-foreground">Expense Type</Label>
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
                  <Label className="text-xs text-muted-foreground">Payment Mode</Label>
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
                  <Label className="text-xs text-muted-foreground">Liters Consumed</Label>
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
            <Label className="text-xs text-muted-foreground">Upload Receipt</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-[#1d4ed8]/30 hover:bg-[#f0f4ff]/30 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Drag & drop or{" "}
                <span className="text-[#1d4ed8] hover:underline">browse</span> to upload
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, PDF up to 5MB</p>
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
          <Button
            onClick={handleSave}
            className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Save Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default AddExpenseModal;
