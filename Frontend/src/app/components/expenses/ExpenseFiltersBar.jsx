import { Search, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { expenseTypes } from "./data/expensesData";

export function ExpenseFiltersBar({
  searchQuery,
  setSearchQuery,
  setCurrentPage,
  dateFrom,
  setDateFrom,
  dateFromOpen,
  setDateFromOpen,
  dateTo,
  setDateTo,
  dateToOpen,
  setDateToOpen,
  filterShipment,
  setFilterShipment,
  filterVehicle,
  setFilterVehicle,
  filterDriver,
  setFilterDriver,
  filterExpenseType,
  setFilterExpenseType,
  shipmentIds,
  vehicleIds,
  driverNames,
}) {
  return (
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
        <Popover open={dateFromOpen} onOpenChange={setDateFromOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`h-9 px-3 text-xs gap-1.5 border-border bg-white hover:bg-white ${
                !dateFrom ? "text-muted-foreground" : "text-foreground"
              }`}
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
  );
}
export default ExpenseFiltersBar;
