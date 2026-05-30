import { useEffect, useState } from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceFiltersBar from "./InvoiceFiltersBar";
import InvoiceTable from "./InvoiceTable";
import { AlertCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import InvoiceHistorySheet from "./InvoiceHistorySheet";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const itemsPerPage = 15;

export function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrorData, setValidationErrorData] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchInvoices = async (
    search = "",
    status = "All",
    page = 1,
    hideLoading = false
  ) => {
    if (!hideLoading) {
      setLoading(true);
    }
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

  // Auto-refresh the invoices list every 30 seconds to move delivered plants to history seamlessly
  useEffect(() => {
    const interval = setInterval(() => {
      // Pass a flag to hide loading state if desired, or just use the current implementation 
      // where it shows a spinner. If we want it completely seamless, we could add a "hideLoading" parameter 
      // but for now we just call it.
      fetchInvoices(searchQuery, statusFilter, currentPage, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [searchQuery, statusFilter, currentPage]);

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
    setValidationErrorData(null);

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
        // Check if it's a validation error
        if (result.validationError) {
          setValidationErrorData({
            missingColumns: result.missingColumns || [],
            headers: result.headers || [],
          });
        } else {
          throw new Error(result.message || "Upload failed");
        }
        return;
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
        onHistoryClick={() => setHistoryOpen(true)}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {validationErrorData && (
        <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-5 text-red-800 text-sm space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 text-base">Invalid Excel Sheet Format</h3>
                <p className="text-xs text-red-700/90 mt-0.5">
                  The system was unable to automatically map some of the required columns. Please adjust your spreadsheet headers and try again.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setValidationErrorData(null)}
              className="text-red-700 hover:bg-red-100/50 hover:text-red-900 h-8 px-2 flex items-center"
            >
              <X className="w-4 h-4 mr-1.5" /> Dismiss
            </Button>
          </div>

          {/* Checklist comparisons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
            {[
              {
                id: "Plant Reference",
                label: "Plant Reference",
                keywords: "Plant, Plant No, Plant Reference Number",
              },
              {
                id: "Customer Name",
                label: "Customer Name",
                keywords: "Customer Name, Customer",
              },
              {
                id: "Invoice Number",
                label: "Invoice Number",
                keywords: "Invoice, Invoice No, Invoice Number, Invoice #",
              },
              {
                id: "Invoice Date",
                label: "Invoice Date",
                keywords: "Invoice Date, Date, Invoice Dt",
              },
              {
                id: "Location",
                label: "Location",
                keywords: "District, Location, Customer Location, Delivery Location, City, Address",
              },
            ].map((col) => {
              const isMissing = validationErrorData.missingColumns.includes(col.id);
              return (
                <div
                  key={col.id}
                  className={`p-3.5 border rounded-xl flex flex-col justify-between gap-2.5 transition-all ${
                    isMissing
                      ? "bg-red-50/50 border-red-200 shadow-inner"
                      : "bg-emerald-50/50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isMissing ? "text-red-950" : "text-emerald-950"}`}>
                      {col.label}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        isMissing
                          ? "bg-red-200/60 text-red-800"
                          : "bg-emerald-200/60 text-emerald-800"
                      }`}
                    >
                      {isMissing ? "Missing" : "Matched"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-medium">Accepted terms:</span>
                    <span className="text-[10px] font-mono leading-relaxed block truncate text-slate-600" title={col.keywords}>
                      {col.keywords}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detected Headers */}
          {validationErrorData.headers?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-red-200/50">
              <span className="text-xs font-semibold text-slate-700 block">
                📋 Headers Detected in Sheet ({validationErrorData.headers.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {validationErrorData.headers.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-1 bg-white border border-red-100 rounded text-slate-600 shadow-sm"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
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

      <InvoiceHistorySheet 
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />
    </div>
  );
}

export default InvoicesPage;