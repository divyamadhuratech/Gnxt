import { useEffect, useState } from "react";
import { Building2, Package, Hash, Weight, Layers, FileText, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { format } from "date-fns";

const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

export function DestinationEntry({
  entry,
  index,
  canRemove,
  onRemove,
  onUpdate,
  lrNumber,
  usedPlantNumbers = [], // plant numbers already selected in other entries
}) {
  const [plantNumbers, setPlantNumbers] = useState([]);
  const [invoices, setInvoices]         = useState([]);
  const [loadingPlants, setLoadingPlants]   = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // Fetch plant numbers on mount
  useEffect(() => {
    setLoadingPlants(true);
    fetch(`${API_BASE_URL}/shipments/plant-numbers`)
      .then((r) => r.json())
      .then((res) => setPlantNumbers(res.success ? res.data : []))
      .catch(() => setPlantNumbers([]))
      .finally(() => setLoadingPlants(false));
  }, []);

  // Fetch invoices when plant changes — also auto-fill customerName + location
  useEffect(() => {
    if (!entry.plantReferenceNumber) { setInvoices([]); return; }
    setLoadingInvoices(true);
    fetch(`${API_BASE_URL}/shipments/invoices-by-plant/${encodeURIComponent(entry.plantReferenceNumber)}`)
      .then((r) => r.json())
      .then((res) => {
        const list = res.success ? res.data : [];
        setInvoices(list);
        // Auto-fill customerName and deliveryLocation from first invoice for this plant
        if (list.length > 0) {
          const first = list[0];
          if (!entry.customerName && first.customerName) {
            onUpdate(entry.id, "customerName", first.customerName);
          }
          if (!entry.deliveryLocation && first.location) {
            onUpdate(entry.id, "deliveryLocation", first.location);
          }
        }
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoadingInvoices(false));
  }, [entry.plantReferenceNumber]);

  return (
    <div className="p-5 border border-border rounded-xl bg-[#fafbfc] space-y-6 relative shadow-sm">
      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(entry.id)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {/* Destination badge + LR number preview */}
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-[#f0f4ff] text-[#1d4ed8] border-[#c7d7fe] px-2.5 py-0.5">
          Destination {index + 1}
        </Badge>
        <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg px-3 py-1">
          <FileText className="w-3 h-3 text-[#16a34a]" />
          <span className="text-[10px] text-[#15803d] uppercase tracking-wider">LR No.</span>
          <span className="text-xs text-[#166534] tracking-tight">
            {lrNumber || `LR-${new Date().getFullYear()}-XXXXX-${String(index + 1).padStart(2, "0")}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Plant + Invoices */}
        <div className="space-y-4">
          {/* Plant Number */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> Plant Number
            </Label>
            <Select
              value={entry.plantReferenceNumber || ""}
              onValueChange={(val) => {
                onUpdate(entry.id, "plantReferenceNumber", val);
                onUpdate(entry.id, "invoiceIds", []);
              }}
              disabled={loadingPlants}
            >
              <SelectTrigger className="w-full bg-white border-border h-11">
                <SelectValue placeholder={loadingPlants ? "Loading..." : "Select plant..."} />
              </SelectTrigger>
              <SelectContent>
                {plantNumbers.map((plant) => {
                  const isUsed = usedPlantNumbers.includes(plant);
                  return (
                    <SelectItem
                      key={plant}
                      value={plant}
                      disabled={isUsed}
                      className={isUsed ? "opacity-40 cursor-not-allowed" : ""}
                    >
                      <span className="flex items-center justify-between w-full gap-3">
                        {plant}
                        {isUsed && (
                          <span className="text-[10px] text-muted-foreground ml-2">Already selected</span>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Associated Invoices — show only date + invoice number */}
          {entry.plantReferenceNumber && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Associated Invoices
              </Label>
              <div className="bg-white border border-border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {loadingInvoices ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">No pending invoices for this plant</p>
                ) : (
                  invoices.map((inv) => {
                    const isSelected = (entry.invoiceIds || []).includes(inv._id);
                    return (
                      <div
                        key={inv._id}
                        onClick={() => {
                          const current = entry.invoiceIds || [];
                          const updated = isSelected
                            ? current.filter((id) => id !== inv._id)
                            : [...current, inv._id];
                          onUpdate(entry.id, "invoiceIds", updated);
                          // Auto-fill delivery location from first selected invoice
                          if (!isSelected && inv.location && !entry.deliveryLocation) {
                            onUpdate(entry.id, "deliveryLocation", inv.location);
                          }
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-[#1d4ed8] bg-[#f0f4ff]"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-sm font-medium ${isSelected ? "text-[#1d4ed8]" : "text-foreground"}`}>
                            {inv.invoiceNumber}
                          </span>
                          {inv.location && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              📍 {inv.location}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {inv.invoiceDate
                            ? format(new Date(inv.invoiceDate), "dd MMM yyyy")
                            : "—"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              {(entry.invoiceIds?.length > 0) && (
                <p className="text-[11px] text-[#1d4ed8]">{entry.invoiceIds.length} invoice{entry.invoiceIds.length > 1 ? "s" : ""} selected</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Quantities & Weight */}
        <div className="space-y-4">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Package className="w-3.5 h-3.5" /> Item Quantities & Weight
          </h4>

          {[
            { field: "totalTyres", label: "Total Tyres" },
            { field: "totalTubes", label: "Total Tubes" },
            { field: "totalFlaps", label: "Total Flaps" },
          ].map(({ field, label }) => (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> {label}
              </Label>
              <Input
                type="number"
                min={0}
                value={entry[field] || ""}
                onChange={(e) => onUpdate(entry.id, field, parseInt(e.target.value) || 0)}
                placeholder="0"
                className="bg-white border-border h-11"
              />
            </div>
          ))}

          {/* Auto total */}
          <div className="bg-[#eef2ff] border border-[#c7d7fe] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#4338ca]" />
              <span className="text-xs text-[#4338ca]">Total Quantity</span>
            </div>
            <span className="text-sm text-[#1d4ed8] tracking-tight">
              {(entry.totalTyres || 0) + (entry.totalTubes || 0) + (entry.totalFlaps || 0)} pcs
            </span>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Weight className="w-3 h-3" /> Weight (kg)
            </Label>
            <Input
              type="number"
              min={0}
              step="0.5"
              value={entry.weightKg || ""}
              onChange={(e) => onUpdate(entry.id, "weightKg", e.target.value)}
              placeholder="Enter weight in kg"
              className="bg-white border-border h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationEntry;
