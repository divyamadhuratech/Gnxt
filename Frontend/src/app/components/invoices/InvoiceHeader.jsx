import { FileText, Upload, Loader2, History, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

export function InvoiceHeader({ total, uploading, onFileUpload, isHistory, onHistoryToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          {isHistory ? "Invoice History" : "Invoices"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHistory
            ? `${total > 0 ? `${total} delivered plant records` : "Delivered invoices archive"}`
            : total > 0
            ? `${total} plant records`
            : "Manage and track customer invoices"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Upload — only in main view */}
        {!isHistory && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={onFileUpload}
              disabled={uploading}
            />
            <div className="inline-flex items-center gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors">
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</>
              ) : (
                <><Upload className="w-4 h-4" />Upload Sheet</>
              )}
            </div>
          </label>
        )}

        <Button
          variant={isHistory ? "default" : "outline"}
          className={isHistory ? "bg-[#1d4ed8] hover:bg-[#1e40af] text-white gap-2" : "gap-2"}
          onClick={onHistoryToggle}
        >
          {isHistory ? (
            <><ArrowLeft className="w-4 h-4" />Back to Invoices</>
          ) : (
            <><History className="w-4 h-4" />History</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default InvoiceHeader;
