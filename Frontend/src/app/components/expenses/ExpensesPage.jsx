import { useState, useMemo, useEffect } from "react";
import { ExpenseHeader } from "./ExpenseHeader";
import { ExpenseFiltersBar } from "./ExpenseFiltersBar";
import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { ExpenseTable } from "./ExpenseTable";
import { AddExpenseModal } from "./AddExpenseModal";
import { ViewExpenseDialog } from "./ViewExpenseDialog";
import { ITEMS_PER_PAGE } from "./data/expensesData";

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);

  const shipmentIds = useMemo(
    () =>
      [...new Set(expenses.map((e) => e.lrNumber))].filter(
        (id) => id && id !== "",
      ),
    [expenses],
  );
  const vehicleIds = useMemo(
    () =>
      [...new Set(expenses.map((e) => e.vehicleId))].filter(
        (id) => id && id !== "",
      ),
    [expenses],
  );
  const driverNames = useMemo(
    () =>
      [...new Set(expenses.map((e) => e.driverName))].filter(
        (name) => name && name !== "",
      ),
    [expenses],
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
          (e.vehicleId || "").toLowerCase().includes(q),
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
      <ExpenseHeader
        onAddExpense={() => {
          setAddModalLr(null);
          setAddModalOpen(true);
        }}
      />

      <ExpenseFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateFromOpen={dateFromOpen}
        setDateFromOpen={setDateFromOpen}
        dateTo={dateTo}
        setDateTo={setDateTo}
        dateToOpen={dateToOpen}
        setDateToOpen={setDateToOpen}
        filterShipment={filterShipment}
        setFilterShipment={setFilterShipment}
        filterVehicle={filterVehicle}
        setFilterVehicle={setFilterVehicle}
        filterDriver={filterDriver}
        setFilterDriver={setFilterDriver}
        filterExpenseType={filterExpenseType}
        setFilterExpenseType={setFilterExpenseType}
        shipmentIds={shipmentIds}
        vehicleIds={vehicleIds}
        driverNames={driverNames}
      />

      <ExpenseSummaryCards
        totalExpenses={totalExpenses}
        fuelCost={fuelCost}
        tollCharges={tollCharges}
        maintenance={maintenance}
        otherExpenses={otherExpenses}
      />

      <ExpenseTable
        paginated={paginated}
        filtered={filtered}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        sortField={sortField}
        sortDir={sortDir}
        toggleSort={toggleSort}
        onViewExpense={setViewExpense}
        onAddExpenseForLr={(lrNumber) => {
          setAddModalLr(lrNumber);
          setAddModalOpen(true);
        }}
      />

      <AddExpenseModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        lr={addModalLr}
        onSave={addExpense}
        expenses={expenses}
        shipmentIds={shipmentIds}
      />

      <ViewExpenseDialog
        expense={viewExpense}
        onClose={() => setViewExpense(null)}
      />
    </div>
  );
}
export default ExpensesPage;
