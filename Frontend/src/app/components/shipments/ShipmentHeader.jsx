import { Button } from "../ui/button";

export function ShipmentHeader({ total, onCreateClick }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-foreground tracking-tight">Shipment Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage all tyre distribution shipments
        </p>
      </div>
      <Button onClick={onCreateClick} className="gap-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white shadow-sm">
        <PlusIcon />
        Create Shipment
      </Button>
    </div>
  );
}

// local helper icon wrapper to avoid importing Plus everywhere
function PlusIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default ShipmentHeader;