// import { Eye, FileCheck } from "lucide-react";
// import { TableRow, TableCell } from "../ui/table";
// import { Badge } from "../ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
// import { getPODConfig, statusConfig, createdByOptions } from "./_import_placeholder";
// import { STATUS_STYLES, getPODConfig as utilGetPOD, statusConfig as utilStatusConfig } from "./utils/shipmentStyles";
// // import DeleteButton from "../invoices/DeleteButton"; // reuse existing delete button if available, otherwise implement similar
// import DeleteButton from "../invoices/DeleteButton";
// // The import alias above "_import_placeholder" is not real — we use util functions from shipmentStyles.js
// // For clarity in this file, import directly from utils:
// import { getPODConfig as podFor, isWithinDateRange } from "./utils/shipmentStyles";

// export function PlantRow({
//   shipment,
//   setSelectedShipment,
//   setViewSheetOpen,
//   shipmentData,
//   setShipmentData,
//   onDeleted,
// }) {
//   const sc = utilStatusConfig[shipment.status] || { label: shipment.status || "N/A", className: "bg-gray-50 text-gray-700 border-gray-200" };
//   const pod = podFor(shipment.status);

//   return (
//     <TableRow className="group cursor-default">
//       <TableCell className="pl-5">
//         <span className="text-sm font-medium text-foreground">{shipment.lrNumber}</span>
//       </TableCell>

//       <TableCell>
//         <span className="text-sm font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">{shipment.plantNumber || "PL-001"}</span>
//       </TableCell>

//       <TableCell>
//         <span className="text-sm text-[#1d4ed8]">{shipment.id}</span>
//       </TableCell>

//       <TableCell>
//         <div>
//           <p className="text-sm text-foreground">{shipment.dealerName}</p>
//           <p className="text-xs text-muted-foreground mt-0.5">{shipment.dealerLocation}</p>
//         </div>
//       </TableCell>

//       <TableCell>
//         <div className="flex items-center gap-2">
//           <PackageIcon />
//           <div>
//             <span className="text-sm text-foreground">{shipment.totalWeight} kg</span>
//             <p className="text-xs text-muted-foreground mt-0.5">{shipment.items} {shipment.items === 1 ? "item" : "items"}</p>
//           </div>
//         </div>
//       </TableCell>

//       <TableCell>
//         <div>
//           <p className="text-sm text-foreground">{shipment.driverName}</p>
//           <p className="text-xs text-muted-foreground mt-0.5">{shipment.driverPhone}</p>
//         </div>
//       </TableCell>

//       <TableCell>
//         <div className="flex items-center gap-2">
//           <div>
//             <p className="text-sm text-foreground">{shipment.vehicleNumber}</p>
//             <Badge variant="outline" className={`mt-0.5 text-[10px] px-1.5 py-0 rounded-sm ${shipment.vehicleType === "Own" ? "border-blue-200 text-blue-600 bg-blue-50/60" : "border-orange-200 text-orange-600 bg-orange-50/60"}`}>
//               {shipment.vehicleType}
//             </Badge>
//           </div>
//         </div>
//       </TableCell>

//       <TableCell>
//         <span className="text-sm text-muted-foreground">{shipment.date}</span>
//       </TableCell>

//       <TableCell>
//         <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border ${sc.className}`}>{sc.label}</span>
//       </TableCell>

//       <TableCell>
//         <span
//           className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${pod.className}${shipment.status === "Delivered" ? " cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-colors" : ""}`}
//           role={shipment.status === "Delivered" ? "button" : undefined}
//           onClick={
//             shipment.status === "Delivered"
//               ? () => {
//                   setSelectedShipment(shipment);
//                   setViewSheetOpen(true);
//                 }
//               : undefined
//           }
//         >
//           {pod.icon && <FileCheck className="w-3 h-3" />}
//           {pod.label}
//           {shipment.status === "Delivered" && <Eye className="w-3 h-3 ml-0.5 opacity-60" />}
//         </span>
//       </TableCell>

//       <TableCell>
//         <Select
//           value={shipment.createdBy || "Admin"}
//           onValueChange={(value) => {
//             setShipmentData((prev) => prev.map((s) => (s.id === shipment.id ? { ...s, createdBy: value } : s)));
//           }}
//         >
//           <SelectTrigger className="h-8 w-[120px] bg-white border-border text-xs">
//             <SelectValue placeholder="Select User" />
//           </SelectTrigger>
//           <SelectContent>
//             {["Admin", "Manager", "Operator"].map((user) => (
//               <SelectItem key={user} value={user}>
//                 {user}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </TableCell>

//       <TableCell className="pr-5 text-center">
//         <button
//           className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
//           onClick={() => {
//             setSelectedShipment(shipment);
//             setViewSheetOpen(true);
//           }}
//         >
//           <Eye className="w-4 h-4" />
//         </button>
//       </TableCell>
//     </TableRow>
//   );
// }

// function PackageIcon() {
//   return (
//     <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//       <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l6 3.46a2 2 0 0 0 2 0l6-3.46A2 2 0 0 0 21 16z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//     </svg>
//   );
// }

// export default PlantRow;

import { Eye, FileCheck } from "lucide-react";
import { TableRow, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getPODConfig, statusConfig } from "./utils/shipmentStyles";
import DeleteButton from "../invoices/DeleteButton";

export function PlantRow({
  shipment,
  setSelectedShipment,
  setViewSheetOpen,
  setShipmentData,
  onDeleted,
}) {
  const sc = statusConfig[shipment.status] || { 
    label: shipment.status || "N/A", 
    className: "bg-gray-50 text-gray-700 border-gray-200" 
  };
  const pod = getPODConfig(shipment.status);

  const handleDelete = () => {
    // Remove shipment from data
    setShipmentData((prev) => prev.filter((s) => s.id !== shipment.id));
    
    // Call onDeleted callback if provided
    if (onDeleted) {
      onDeleted(shipment.id);
    }
  };

  return (
    <TableRow className="group cursor-default">
      <TableCell className="pl-5">
        <span className="text-sm font-medium text-foreground">{shipment.lrNumber}</span>
      </TableCell>

      <TableCell>
        <span className="text-sm font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded-sm">
          {shipment.plantNumber || "PL-001"}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-sm text-[#1d4ed8]">{shipment.id}</span>
      </TableCell>

      <TableCell>
        <div>
          <p className="text-sm text-foreground">{shipment.dealerName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{shipment.dealerLocation}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <PackageIcon />
          <div>
            <span className="text-sm text-foreground">{shipment.totalWeight} kg</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shipment.items} {shipment.items === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div>
          <p className="text-sm text-foreground">{shipment.driverName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{shipment.driverPhone}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div>
            <p className="text-sm text-foreground">{shipment.vehicleNumber}</p>
            <Badge 
              variant="outline" 
              className={`mt-0.5 text-[10px] px-1.5 py-0 rounded-sm ${
                shipment.vehicleType === "Own" 
                  ? "border-blue-200 text-blue-600 bg-blue-50/60" 
                  : "border-orange-200 text-orange-600 bg-orange-50/60"
              }`}
            >
              {shipment.vehicleType}
            </Badge>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="text-sm text-muted-foreground">{shipment.date}</span>
      </TableCell>

      <TableCell>
        <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border ${sc.className}`}>
          {sc.label}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${pod.className}${
            shipment.status === "Delivered" 
              ? " cursor-pointer hover:bg-emerald-100 hover:border-emerald-300 transition-colors" 
              : ""
          }`}
          role={shipment.status === "Delivered" ? "button" : undefined}
          onClick={
            shipment.status === "Delivered"
              ? () => {
                  setSelectedShipment(shipment);
                  setViewSheetOpen(true);
                }
              : undefined
          }
        >
          {pod.icon && <FileCheck className="w-3 h-3" />}
          {pod.label}
          {shipment.status === "Delivered" && <Eye className="w-3 h-3 ml-0.5 opacity-60" />}
        </span>
      </TableCell>

      <TableCell>
        <Select
          value={shipment.createdBy || "Admin"}
          onValueChange={(value) => {
            setShipmentData((prev) => 
              prev.map((s) => (s.id === shipment.id ? { ...s, createdBy: value } : s))
            );
          }}
        >
          <SelectTrigger className="h-8 w-[120px] bg-white border-border text-xs">
            <SelectValue placeholder="Select User" />
          </SelectTrigger>
          <SelectContent>
            {["Admin", "Manager", "Operator"].map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className="pr-5">
        <div className="flex items-center gap-2">
          {/* View Button */}
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelectedShipment(shipment);
              setViewSheetOpen(true);
            }}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <DeleteButton 
            onDelete={handleDelete}
            itemName={shipment.lrNumber}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function PackageIcon() {
  return (
    <svg 
      className="w-3.5 h-3.5 text-muted-foreground shrink-0" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
    >
      <path 
        d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l6 3.46a2 2 0 0 0 2 0l6-3.46A2 2 0 0 0 21 16z" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PlantRow;