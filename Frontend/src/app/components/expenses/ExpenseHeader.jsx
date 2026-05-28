import { Plus, Download } from "lucide-react";
import { Button } from "../ui/button";

export function ExpenseHeader({ onAddExpense, onExport }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl tracking-tight text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and manage shipment-related costs
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onExport}
          variant="outline"
          className="border-border gap-2 hover:bg-[#f8f9fb]"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Export to Excel
        </Button>
        <Button
          onClick={onAddExpense}
          className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>
    </div>
  );
}
export default ExpenseHeader;
