import { Truck } from "lucide-react";

export function LiveShipmentsTable({ currentShipments = [] }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-white">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Live Shipments</h3>
          <p className="text-sm text-muted-foreground">Active shipments currently in progress</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-[#fafbfc] uppercase border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Shipment ID</th>
              <th className="px-6 py-4 font-medium">Vehicle / Driver</th>
              <th className="px-6 py-4 font-medium">Destination</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {currentShipments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm">No active shipments at the moment</p>
                </td>
              </tr>
            ) : (
              currentShipments.map((shipment, i) => (
                <tr key={i} className="hover:bg-[#fafbfc] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{shipment.id}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{shipment.items}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{shipment.vehicle}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {shipment.driver}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium">{shipment.destination}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                      shipment.status === "In Transit"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : shipment.status === "Pending"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : shipment.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {shipment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LiveShipmentsTable;
