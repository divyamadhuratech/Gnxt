import { format } from "date-fns";
import { FileText, Banknote, Smartphone, CreditCard } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Separator } from "../ui/separator";

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
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${styles[type]}`}>
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
      className={`text-[10px] px-2 py-0.5 ${
        status === "Approved"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {status}
    </Badge>
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

export function ViewExpenseDialog({ expense, onClose }) {
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
export default ViewExpenseDialog;
