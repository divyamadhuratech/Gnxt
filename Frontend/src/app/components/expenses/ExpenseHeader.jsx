import { Plus } from "lucide-react";
import { Button } from "../ui/button";

export function ExpenseHeader({ onAddExpense }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl tracking-tight text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and manage shipment-related costs
        </p>
      </div>
      <Button
        onClick={onAddExpense}
        className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Expense
      </Button>
    </div>
  );
}
export default ExpenseHeader;
