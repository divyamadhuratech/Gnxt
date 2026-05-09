import { useState, useEffect } from "react";
import DealerHeader from "./DealerHeader";
import DealerFiltersBar from "./DealerFiltersBar";
import DealerTable from "./DealerTable";
import AddDealerSheet from "./AddDealerSheet";

const API_BASE_URL = "http://localhost:5000/api/dealers";

export function DealersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [dealers, setDealers] = useState([]);
  const [cities, setCities] = useState([]);
  const [expandedDealer, setExpandedDealer] = useState(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [newDealer, setNewDealer] = useState({
    name: "",
    location: "",
    city: "",
    state: "Maharashtra",
    phone: "",
  });

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      const data = await res.json();
      setDealers(data);
      const uniqueCities = [...new Set(data.map((d) => d.city))].sort();
      setCities(uniqueCities);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = dealers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery);
    const matchesCity = cityFilter === "all" || d.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const toggleHistory = (dealerId) => {
    setExpandedDealer((prev) => (prev === dealerId ? null : dealerId));
  };

  const handleAddDealer = async () => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDealer),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error adding dealer:", error);
        return;
      }

      const savedDealer = await res.json();
      setDealers((prev) => [...prev, savedDealer]);
      setAddSheetOpen(false);
      setNewDealer({
        name: "",
        location: "",
        city: "",
        state: "Maharashtra",
        phone: "",
      });
      await fetchDealers();
    } catch (error) {
      console.error("Error adding dealer:", error);
    }
  };

  const handleEditDealer = (dealer) => {
    setEditingDealer(dealer._id);
    setNewDealer({
      name: dealer.name,
      location: dealer.location,
      city: dealer.city,
      state: dealer.state,
      phone: dealer.phone,
    });
    setAddSheetOpen(true);
  };

  const handleUpdateDealer = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/${editingDealer}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDealer),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error updating dealer:", error);
        return;
      }

      const updatedDealer = await res.json();
      setDealers((prev) =>
        prev.map((d) => (d._id === editingDealer ? updatedDealer : d))
      );
      setAddSheetOpen(false);
      setEditingDealer(null);
      setNewDealer({
        name: "",
        location: "",
        city: "",
        state: "Maharashtra",
        phone: "",
      });
      await fetchDealers();
    } catch (error) {
      console.error("Error updating dealer:", error);
    }
  };

  const handleDeleteDealer = async (dealerId) => {
    if (window.confirm("Are you sure you want to delete this dealer?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/${dealerId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          console.error("Error deleting dealer");
          return;
        }

        setDealers((prev) => prev.filter((d) => d._id !== dealerId));
      } catch (error) {
        console.error("Error deleting dealer:", error);
      }
    }
  };

  const handleDealerChange = (updateFn) => {
    setNewDealer((prev) => updateFn(prev));
  };

  const handleClearFilters = () => {
    setCityFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="h-full flex flex-col">
      <DealerHeader
        dealers={dealers}
        cities={cities}
        onAddDealerClick={() => {
          setEditingDealer(null);
          setNewDealer({
            name: "",
            location: "",
            city: "",
            state: "Maharashtra",
            phone: "",
          });
          setAddSheetOpen(true);
        }}
      />

      <DealerFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        cities={cities}
        onClearFilters={handleClearFilters}
      />

      <DealerTable
        dealers={filtered}
        totalDealers={dealers.length}
        expandedDealer={expandedDealer}
        toggleHistory={toggleHistory}
        onEditDealer={handleEditDealer}
        onDeleteDealer={handleDeleteDealer}
        loading={loading}
      />

      <AddDealerSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        newDealer={newDealer}
        onDealerChange={handleDealerChange}
        onAddDealer={handleAddDealer}
        onUpdateDealer={handleUpdateDealer}
        isEditing={editingDealer !== null}
      />
    </div>
  );
}
