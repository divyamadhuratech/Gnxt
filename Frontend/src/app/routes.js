import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { ShipmentList } from "./components/shipments/ShipmentList";
import { TripTrackingPage } from "./components/TripTrackingPage";
import { VehicleTrackingPage } from "./components/VehicleTrackingPage";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { DriversPage } from "./components/drivers/DriversPage";
import { VehiclesPage } from "./components/Vechicles_Mgmt/VehiclesPage";
import { DealersPage } from "./components/DealersPage";
import { ReportsPage } from "./components/ReportsPage";
import { ExpensesPage } from "./components/ExpensesPage";
import { InvoicesPage } from "./components/invoices/InvoicesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "shipments", Component: ShipmentList },
      { path: "trips", Component: TripTrackingPage },
      { path: "tracking/:vehicleId", Component: VehicleTrackingPage },
      { path: "diesel", Component: PlaceholderPage },
      { path: "vehicles", Component: VehiclesPage },
      { path: "drivers", Component: DriversPage },
      { path: "dealers", Component: DealersPage },
      { path: "products", Component: PlaceholderPage },
      { path: "reports", Component: ReportsPage },
      { path: "invoices", Component: InvoicesPage },
      { path: "expenses", Component: ExpensesPage },
      { path: "settings", Component: PlaceholderPage },
      { path: "help", Component: PlaceholderPage },
      { path: "*", Component: PlaceholderPage },
    ],
  },
]);
