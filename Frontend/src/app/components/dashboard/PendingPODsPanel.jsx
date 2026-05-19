import { FileText, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

export function PendingPODsPanel({ pendingPODs = [] }) {
  return (
    <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Pending PODs & LRs</h3>
          <p className="text-sm text-muted-foreground">Action required</p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {pendingPODs.map((pod, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-3.5 rounded-lg border border-border hover:bg-[#fafbfc] transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#4b6cb7]" />
                <span className="text-sm font-semibold">{pod.id}</span>
              </div>
              <Badge
                variant="outline"
                className={
                  pod.status === "Awaiting Upload"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }
              >
                {pod.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>{pod.dealer}</span>
              <span>{pod.date}</span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full mt-5 bg-[#f8fafc]">
        View All Pending Documents
      </Button>
    </div>
  );
}
export default PendingPODsPanel;
