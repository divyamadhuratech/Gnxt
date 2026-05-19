import { useState, useMemo, useEffect } from "react";
import { ExpenseHeader } from "./ExpenseHeader";
import { ExpenseFiltersBar } from "./ExpenseFiltersBar";
import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { ExpenseTable } from "./ExpenseTable";
import { AddExpenseModal } from "./AddExpenseModal";
import { EditExpenseModal } from "./EditExpenseModal";
import { ViewExpenseDialog } from "./ViewExpenseDialog";
import { ITEMS_PER_PAGE } from "./data/expensesData";

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShipment, setFilterShipment] = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterDriver, setFilterDriver] = useState("all");
  const [filterExpenseType, setFilterExpenseType] = useState("all");
  const [filterDate, setFilterDate] = useState();
  const [dateOpen, setDateOpen] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState("tripId");
  const [sortDir, setSortDir] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalTripId, setAddModalTripId] = useState(null);
  const [viewExpense, setViewExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const [expRes, shipRes] = await Promise.all([
        fetch("http://localhost:5000/api/expenses"),
        fetch("http://localhost:5000/api/shipments?limit=1000")
      ]);
      if (!expRes.ok) throw new Error("Failed to fetch expenses");
      if (!shipRes.ok) throw new Error("Failed to fetch shipments");
      
      const expData = await expRes.json();
      const shipData = await shipRes.json();
      
      setExpenses(expData);
      setShipments(shipData.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter dropdown data
  const shipmentIds = useMemo(() => {
    const ids = expenses.map((e) => e.tripId || e.lrNumber).filter(Boolean);
    return [...new Set(ids)];
  }, [expenses]);

  const vehicleIds = useMemo(() => {
    const ids = expenses.map((e) => e.vehicleId).filter(Boolean);
    return [...new Set(ids)];
  }, [expenses]);

  const driverNames = useMemo(() => {
    const names = expenses.map((e) => e.driverName).filter(Boolean);
    return [...new Set(names)];
  }, [expenses]);

  // Filtered + sorted + grouped by Trip ID
  const processedData = useMemo(() => {
    let data = [...expenses];

    // 1. Grouping by Trip ID (or fallback)
    const groupedMap = new Map();
    data.forEach((e) => {
      const key = e.tripId || e.lrNumber || `manual-${e.driverName}-${e.vehicleId}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          tripId: e.tripId || "No Trip ID",
          lrNumber: e.lrNumber || "N/A",
          driverName: e.driverName || "N/A",
          vehicleId: e.vehicleId || "N/A",
          date: e.date,
          status: e.status || "Pending",
          paymentMode: e.paymentMode || "Cash",
          amount: 0,
          breakdown: []
        });
      }

      const grp = groupedMap.get(key);
      grp.breakdown.push({
        ...e,
        amount: e.totalAmount !== undefined ? e.totalAmount : (e.amount || 0)
      });
      grp.amount += (e.totalAmount !== undefined ? e.totalAmount : (e.amount || 0));
    });

    let groupedData = Array.from(groupedMap.values());

    // 2. Filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      groupedData = groupedData.filter(
        (g) =>
          g.tripId.toLowerCase().includes(q) ||
          g.driverName.toLowerCase().includes(q) ||
          g.vehicleId.toLowerCase().includes(q) ||
          g.breakdown.some((e) => (e.lrNumber || "").toLowerCase().includes(q))
      );
    }
    if (filterShipment !== "all") {
      groupedData = groupedData.filter(
        (g) => g.tripId === filterShipment || g.breakdown.some((e) => e.lrNumber === filterShipment)
      );
    }
    if (filterVehicle !== "all") {
      groupedData = groupedData.filter((g) => g.vehicleId === filterVehicle);
    }
    if (filterDriver !== "all") {
      groupedData = groupedData.filter((g) => g.driverName === filterDriver);
    }
    if (filterExpenseType !== "all") {
      groupedData = groupedData.filter((g) =>
        g.breakdown.some((e) => e.items?.some((item) => item.expenseType === filterExpenseType))
      );
    }
    if (filterDate) {
      const target = new Date(filterDate);
      groupedData = groupedData.filter((g) =>
        g.breakdown.some((e) => {
          const ed = new Date(e.date);
          return ed.getFullYear() === target.getFullYear() &&
                 ed.getMonth() === target.getMonth() &&
                 ed.getDate() === target.getDate();
        })
      );
    }

    // 3. Sorting
    groupedData.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return groupedData;
  }, [
    searchQuery,
    filterShipment,
    filterVehicle,
    filterDriver,
    filterExpenseType,
    filterDate,
    sortField,
    sortDir,
    expenses,
  ]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / ITEMS_PER_PAGE));
  const paginated = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Summary calculations
  const totalExpenses = expenses.reduce((s, e) => s + (e.totalAmount !== undefined ? e.totalAmount : (e.amount || 0)), 0);
  
  const getAmountByType = (type) => {
    return expenses.reduce((sum, e) => {
      if (e.items && e.items.length > 0) {
        return sum + e.items.filter((item) => item.expenseType === type).reduce((s, i) => s + (i.amount || 0), 0);
      }
      return sum + (e.expenseType === type ? (e.amount || 0) : 0);
    }, 0);
  };

  const fuelCost = getAmountByType("Fuel");
  const tollCharges = getAmountByType("Toll");
  const maintenance = getAmountByType("Maintenance");
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
    setFilterDate(undefined);
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
      if (Array.isArray(savedExpense)) {
        setExpenses((prev) => [...savedExpense, ...prev]);
      } else {
        setExpenses((prev) => [savedExpense, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateExpense = async (id, payload) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update expense");
      
      const { data } = await response.json();
      setExpenses((prev) => prev.map((e) => (e._id === id ? { ...e, ...data } : e)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete expense");
      
      setExpenses((prev) => prev.filter((e) => e._id !== id));
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
    filterDate;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      <ExpenseHeader
        onAddExpense={() => {
          setAddModalTripId(null);
          setAddModalOpen(true);
        }}
      />

      <ExpenseFiltersBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setCurrentPage={setCurrentPage}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        dateOpen={dateOpen}
        setDateOpen={setDateOpen}
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
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
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
        filtered={processedData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        sortField={sortField}
        sortDir={sortDir}
        toggleSort={toggleSort}
        onViewExpense={setViewExpense}
        onAddExpenseForTrip={(tripId) => {
          setAddModalTripId(tripId);
          setAddModalOpen(true);
        }}
        onEditExpense={(expense) => {
          setEditExpense(expense);
          setEditModalOpen(true);
        }}
        onDeleteExpense={deleteExpense}
      />

      <AddExpenseModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        tripId={addModalTripId}
        onSave={addExpense}
        shipments={shipments}
      />

      <ViewExpenseDialog
        expense={viewExpense}
        onClose={() => setViewExpense(null)}
      />

      <EditExpenseModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        expense={editExpense}
        onSave={updateExpense}
      />
    </div>
  );
}
export default ExpensesPage;
