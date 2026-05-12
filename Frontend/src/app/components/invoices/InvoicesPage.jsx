import { useEffect, useState } from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceFiltersBar from "./InvoiceFiltersBar";
import InvoiceTable from "./InvoiceTable";
import { AlertCircle } from "lucide-react";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const itemsPerPage = 15;

export function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchInvoices = async (
    search = "",
    status = "All",
    page = 1
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        status: status === "All" ? "" : status,
        page,
        limit: itemsPerPage,
      });

      const res = await fetch(
        `${API_BASE_URL}/invoices?${params}`
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      setInvoices(result.data || []);
      setTotal(result.pagination.total || 0);
      setTotalPages(result.pagination.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(searchQuery, statusFilter, currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchInvoices(searchQuery, statusFilter, 1);
  }, [searchQuery, statusFilter]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid Excel or CSV file");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${API_BASE_URL}/invoices/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setSuccess(
        `✅ ${result.data.invoicesAdded} invoices uploaded successfully`
      );

      fetchInvoices(searchQuery, statusFilter, currentPage);

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleted = (invoiceId) => {
    setInvoices((prev) =>
      prev
        .map((plant) => ({
          ...plant,
          invoices: plant.invoices.filter(
            (inv) => inv._id !== invoiceId
          ),
        }))
        .filter((plant) => plant.invoices.length > 0)
    );
  };

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <InvoiceHeader
        total={total}
        uploading={uploading}
        onFileUpload={handleFileUpload}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          {success}
        </div>
      )}

      <InvoiceFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <InvoiceTable
        invoices={invoices}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={setCurrentPage}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export default InvoicesPage;