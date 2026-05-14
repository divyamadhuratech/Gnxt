import { format } from "date-fns";
import {
  Eye,
  Plus,
  Wallet,
  Fuel,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Smartphone,
  CreditCard,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { HIGH_EXPENSE_THRESHOLD, ITEMS_PER_PAGE } from "./data/expensesData";

function SortableHead({ label, field, current, dir, onSort, className = "" }) {
  const isActive = current === field;
  return (
    <TableHead className={`text-xs text-muted-foreground ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          className.includes("text-right") ? "ml-auto" : ""
        } ${isActive ? "text-foreground" : ""}`}
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

export function ExpenseTable({
  paginated,
  filtered,
  currentPage,
  setCurrentPage,
  totalPages,
  sortField,
  sortDir,
  toggleSort,
  onViewExpense,
  onAddExpenseForLr,
}) {
  return (
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
              <TableHead className="text-xs text-muted-foreground">Payment</TableHead>
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
                  className={`transition-colors hover:bg-[#f8f9fb] ${
                    idx % 2 === 1 ? "bg-[#fbfbfc]" : ""
                  } ${expense.amount >= HIGH_EXPENSE_THRESHOLD ? "border-l-2 border-l-red-300" : ""}`}
                >
                  <TableCell className="text-sm text-foreground">
                    <span className="bg-[#f0f4ff] text-[#1d4ed8] px-2 py-0.5 rounded text-xs tracking-tight">
                      {expense.lrNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(expense.date + "T00:00:00"), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{expense.driverName}</TableCell>
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
                          onClick={() => onViewExpense(expense)}
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 text-xs"
                          onClick={() => onAddExpenseForLr(expense.lrNumber)}
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
          –{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} expenses
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
              className={`w-8 h-8 text-xs ${
                page === currentPage ? "bg-[#1d4ed8] hover:bg-[#1e40af] text-white" : ""
              }`}
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
  );
}
export default ExpenseTable;
