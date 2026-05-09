import { useEffect, useState } from "react";
import {
  Search,
  FileText,
  Filter,
  Upload,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  "In Transit": "bg-blue-100 text-blue-700",
  Delivered: "bg-emerald-100 text-emerald-700",
};

function StatusBadge({ status }) {
  return (
    <div
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </div>
  );
}

function DeleteButton({ invoiceId, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      onDeleted(invoiceId);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}

function PlantRow({ plant, onDeleted }) {
  const [expanded, setExpanded] = useState(false);

  const invoices = plant.invoices ?? [];

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const first = invoices[0];
  const rest = invoices.slice(1);

  return (
    <>
      <TableRow
        className="hover:bg-muted/40 cursor-pointer"
        onClick={() => rest.length > 0 && setExpanded((p) => !p)}
      >
        {/* Expand */}
        <TableCell className="pl-4 w-8">
          {rest.length > 0 ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : null}
        </TableCell>

        {/* Plant */}
        <TableCell>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {plant.plantNumber}
            </span>

            {invoices.length > 1 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                +{invoices.length - 1}
              </span>
            )}
          </div>
        </TableCell>

        {/* Customer */}
        <TableCell>
          <span className="text-sm text-foreground">
            {plant.customerName}
          </span>
        </TableCell>

        {/* Invoice */}
        <TableCell>
          <span className="text-sm text-[#1d4ed8] font-medium">
            {first?.invoiceNumber || "—"}
          </span>
        </TableCell>

        {/* Date */}
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {first?.invoiceDate
              ? formatDate(first.invoiceDate)
              : "—"}
          </span>
        </TableCell>

        {/* Status */}
        <TableCell>
          <StatusBadge status={plant.status} />
        </TableCell>

        {/* Delete */}
        <TableCell
          onClick={(e) => e.stopPropagation()}
        >
          {first && (
            <DeleteButton
              invoiceId={first._id}
              onDeleted={onDeleted}
            />
          )}
        </TableCell>
      </TableRow>

      {/* Expanded Rows */}
      {expanded &&
        rest.map((inv) => (
          <TableRow
            key={inv._id}
            className="bg-blue-50/30 hover:bg-blue-50/50"
          >
            <TableCell className="pl-4" />
            <TableCell />
            <TableCell />

            <TableCell>
              <span className="text-sm text-[#1d4ed8] font-medium pl-2">
                {inv.invoiceNumber}
              </span>
            </TableCell>

            <TableCell>
              <span className="text-sm text-muted-foreground">
                {formatDate(inv.invoiceDate)}
              </span>
            </TableCell>

            <TableCell />

            <TableCell
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteButton
                invoiceId={inv._id}
                onDeleted={onDeleted}
              />
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}

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

  const itemsPerPage = 15;

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

  // FILE UPLOAD
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

  // DELETE UPDATE UI
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Invoices
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {total > 0
              ? `${total} plant records`
              : "Manage and track customer invoices"}
          </p>
        </div>

        {/* Upload + History */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleFileUpload}
              disabled={uploading}
            />

            <div className="inline-flex items-center gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-md text-sm font-medium">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Sheet
                </>
              )}
            </div>
          </label>

          <Button>History</Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search by Plant No, Customer, or Invoice #..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="pl-9 h-9 bg-white border-border"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[160px] h-9 bg-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="All">
              All Status
            </SelectItem>

            <SelectItem value="Pending">
              Pending
            </SelectItem>

            <SelectItem value="In Transit">
              In Transit
            </SelectItem>

            <SelectItem value="Delivered">
              Delivered
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
              <Loader2 className="w-6 h-6 animate-spin text-[#1d4ed8]" />
            </div>
          )}

          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8 pl-4" />
                <TableHead>Plant No.</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {invoices.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-[300px] text-center"
                  >
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((plant) => (
                  <PlantRow
                    key={plant._id}
                    plant={plant}
                    onDeleted={handleDeleted}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Page{" "}
            <span className="font-medium text-foreground">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {totalPages}
            </span>{" "}
            —{" "}
            <span className="font-medium text-foreground">
              {total}
            </span>{" "}
            plants
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((p) => p - 1)
              }
            >
              Prev
            </Button>

            {Array.from(
              {
                length: Math.min(5, totalPages),
              },
              (_, i) => {
                const page =
                  Math.max(
                    1,
                    Math.min(
                      currentPage - 2,
                      totalPages - 4
                    )
                  ) + i;

                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={
                      currentPage === page
                        ? "default"
                        : "outline"
                    }
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </Button>
                );
              }
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage((p) => p + 1)
              }
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}