import { useState, useRef } from "react";
import { FileText, Download, Edit, XCircle, Phone, CheckCircle2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
import { ShipmentOverview }    from "./view/ShipmentOverview";
import { TrackingSection }     from "./view/TrackingSection";
import { PODSection }          from "./view/PODSection";
import { VehicleDriverDetails } from "./view/VehicleDriverDetails";
import { ItemsBreakdown }      from "./view/ItemsBreakdown";
import { ShipmentTimeline }    from "./view/ShipmentTimeline";
import { shipmentDetails, defaultShipmentDetail } from "./data/shipmentMockData";

const statusConfig = {
  Pending:    { className: "bg-amber-50 text-amber-700 border-amber-200",     dotColor: "bg-amber-500"  },
  "In Transit":{ className: "bg-blue-50 text-blue-700 border-blue-200",       dotColor: "bg-blue-500"   },
  Delivered:  { className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotColor: "bg-emerald-500" },
  Cancelled:  { className: "bg-red-50 text-red-700 border-red-200",           dotColor: "bg-red-500"    },
};

export function ViewShipmentSheet({ open, onOpenChange, shipment }) {
  const [podImages, setPodImages]             = useState([]);
  const [podRemarks, setPodRemarks]           = useState("");
  const [podReceiverName, setPodReceiverName] = useState("");
  const [podUploading, setPodUploading]       = useState(false);
  const [podViewImage, setPodViewImage]       = useState(null);
  const fileInputRef = useRef(null);

  if (!shipment) return null;

  const detail   = shipmentDetails[shipment.id] ?? defaultShipmentDetail;
  const sc       = statusConfig[shipment.status] ?? statusConfig["Pending"];
  const totalQty = detail.items.reduce((s, i) => s + i.quantity, 0);
  const totalWt  = detail.items.reduce((s, i) => s + i.totalWeight, 0);
  const loadUtil = Math.round((totalWt / detail.vehicleCapacity) * 100);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-none w-full sm:w-[80%] p-0 gap-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-white shrink-0">
          <div>
            <SheetTitle className="text-lg tracking-tight">Shipment Details</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-0.5">
              Complete shipment information and tracking
            </SheetDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#f0f4ff] border border-[#c7d7fe] rounded-lg px-4 py-2">
              <p className="text-[10px] text-[#4b6cb7] tracking-wide uppercase">Shipment ID</p>
              <p className="text-sm text-[#1d4ed8] tracking-tight">{shipment.id}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${sc.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
              {shipment.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-6 space-y-8">
            <ShipmentOverview shipment={shipment} detail={detail} totalQty={totalQty} totalWt={totalWt} />
            <TrackingSection  shipment={shipment} detail={detail} />
            <PODSection
              shipment={shipment} detail={detail} totalQty={totalQty}
              podImages={podImages}           setPodImages={setPodImages}
              podRemarks={podRemarks}         setPodRemarks={setPodRemarks}
              podReceiverName={podReceiverName} setPodReceiverName={setPodReceiverName}
              podUploading={podUploading}     setPodUploading={setPodUploading}
              podViewImage={podViewImage}     setPodViewImage={setPodViewImage}
              fileInputRef={fileInputRef}
            />
            <VehicleDriverDetails shipment={shipment} detail={detail} loadUtil={loadUtil} />
            <ItemsBreakdown       detail={detail} totalQty={totalQty} totalWt={totalWt} />
            <ShipmentTimeline     detail={detail} />

            {/* Image preview modal */}
            {podViewImage && (
              <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-8" onClick={() => setPodViewImage(null)}>
                <div className="relative max-w-3xl max-h-[80vh] bg-white rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 z-10" onClick={() => setPodViewImage(null)}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <img src={podViewImage} alt="POD Preview" className="max-w-full max-h-[80vh] object-contain" />
                </div>
              </div>
            )}
            <div className="h-4" />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-white px-8 py-4 flex items-center justify-between shrink-0">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex items-center gap-3">
            {shipment.status === "Pending" && (
              <>
                <Button variant="outline" className="border-border gap-2"><XCircle className="w-4 h-4" />Cancel Shipment</Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"><Edit className="w-4 h-4" />Edit Shipment</Button>
              </>
            )}
            {shipment.status === "In Transit" && (
              <>
                <Button variant="outline" className="border-border gap-2"><Phone className="w-4 h-4" />Contact Driver</Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"><CheckCircle2 className="w-4 h-4" />Mark as Delivered</Button>
              </>
            )}
            {shipment.status === "Delivered" && (
              <>
                <Button variant="outline" className="border-border gap-2"><FileText className="w-4 h-4" />View Proof of Delivery</Button>
                <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"><Download className="w-4 h-4" />Download Invoice</Button>
              </>
            )}
            {shipment.status === "Cancelled" && (
              <Button className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm"><Edit className="w-4 h-4" />Re-create Shipment</Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ViewShipmentSheet;
