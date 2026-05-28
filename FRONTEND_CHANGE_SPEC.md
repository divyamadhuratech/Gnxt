# Change Request Specification

## Overview
This document captures the requested UI and behavior changes for the GNXT frontend. It is written against the existing React codebase.

## 1. Vehicle / Fleet Management
### Goal
Make vehicle registration simpler and only enforce the truly required fields.

### Required changes
- File: `Frontend/src/app/components/Vechicles_Mgmt/AddVehicleSheet.jsx`
- Update the vehicle form validation logic so only the following fields are required:
  - `vehicleNo`
  - `ownership`
- Convert `Vehicle Type` from a dropdown select to a free-text input field.
- Remove the `GPS Device IMEI` field entirely from the add/edit vehicle sheet.
- Mark other fields as optional in the UI:
  - `Model`
  - `Max Capacity`
  - `Insurance Expiry`
  - `Vehicle Type` (now text entry)
- Keep `Vehicle Number` and `Ownership` visually required with a trailing `*`.

### Backend alignment
- File: `backend/src/controllers/vehicleController.js`
- Update `createVehicle` validation to stop requiring `type`, `model`, `capacityKg`, and `insuranceExpiry`.
- Update `updateVehicle` if there is any server-side requirement or strict payload validation for these fields.
- Ensure `gpsImei` is optional and can be omitted without failing vehicle create/update.

## 2. Shipment Creation - Plant Selection UX
### Goal
Allow shipment creators to select one plant number and then optionally add additional related plant numbers that share the same customer/location.

### Required changes
- Files:
  - `Frontend/src/app/components/shipments/CreateShipmentSheet.jsx`
  - `Frontend/src/app/components/shipments/create/DestinationEntry.jsx`

### Behavior
- When a destination entry selects a `Plant Number`, keep the current invoice fetch behavior.
- After plant selection, also fetch or derive a related-plant list for the same plant customer/location.
- Display the related plant numbers as additional selectable options in the destination card below the plant selector. Use the same `customerName` / `deliveryLocation` or invoice metadata to infer the group.
- Allow the user to add one of the related plants to the same shipment by creating a new destination entry for that plant.
- Each related plant option must be removable after it is added.
- Keep the existing duplicate plant contract rule only across the final set of selected destination entries, but allow the same customer/location to appear via different plant numbers.
- Consider an API for related plants such as `GET /api/shipments/related-plants/:plantRef`, or derive related plants from existing invoice metadata available via `GET /api/shipments/invoices-by-plant/:plantRef`.

### Data and display
- Use `customerName` and `location` metadata from invoices to determine related plants.
- Show related plants grouped by same customer/location, not by exact plant number.
- Related plants should be presented with a simple `Add` / `Remove` action and should become new destination entries when selected.

## 3. Expenses Page Enhancements
### Goal
Add shipment-specific weight tracking and Excel export for filtered expense data.

### Required changes
- Files:
  - `Frontend/src/app/components/expenses/ExpensesPage.jsx`
  - `Frontend/src/app/components/expenses/ExpenseFiltersBar.jsx`
  - `Frontend/src/app/components/expenses/ExpenseTable.jsx`

### Add total kg per shipment
- Add a new column to the main expense trips table called `Total kg per shipment`.
- Calculate the total weight per grouped trip/shipment from the expense objects currently rendered in `ExpensesPage.jsx`.
- Display the calculated weight in `ExpenseTable.jsx` on the parent trip row.
- Use a consistent unit label: `kg`.

### Add export-to-Excel
- Add an export button in the expenses page header or filters bar.
- Export only the currently filtered expense rows, using the same filter state as the visible table.
- The exported file should include at minimum:
  - Trip / Shipment ID
  - Driver Name
  - Vehicle ID
  - Total Expense Amount
  - Total kg per shipment
  - Date
  - Dealer / Customer (if available via the shipment or expense payload)
  - Any filtered fields needed for context
- Ensure export works after filtering by:
  - Date
  - Dealer
  - Vehicle
- If dealer is not currently part of the expense model, derive it from related shipment or invoice metadata and expose it in the filtered export.
- Use a client-side Excel/CSV download implementation unless a backend export endpoint is preferred.

### Filter updates
- The current expense filters already support:
  - shipmen`t` selection (`filterShipment`)
  - vehicle selection (`filterVehicle`)
  - driver selection (`filterDriver`)
  - date selection (`filterDate`)
- Add dealer filter support if requested in the same filter row, populating options from either the `shipments` API or expense entries.
- Update the export button to combine all active filters.

## 4. Invoice Upload - Column Validation & Dynamic Keyword Matching
### Goal
Validate that uploaded Excel/CSV sheets contain required column headers before processing invoice data, using standard keywords, fuzzy pattern matches, and a premium visual status layout.

### Required changes
- Files:
  - `backend/src/controllers/invoice.controller.js`
  - `backend/src/utils/mapInvoice.js`
  - `Frontend/src/app/components/invoices/InvoicesPage.jsx`

### Column validation logic
- When a file is uploaded via `/api/invoices/upload`, the backend must validate that the sheet contains at least one matching column from each required column group, supporting exact matches and regex/fuzzy patterns:
  - **Plant Reference**: `Plant Reference Number`, `Plant No`, `Plant` (Fuzzy: any column containing `plant`)
  - **Customer Name**: `Customer Name`, `Customer` (Fuzzy: any column containing `customer name`, `client`, or `dealer`)
  - **Invoice Number**: `Invoice`, `Invoice Number`, `Invoice #`, `Invoice No` (Fuzzy: any column containing `invoice` and `no` or `num` or `#`)
  - **Invoice Date**: `Invoice Date`, `Date`, `Invoice Dt` (Fuzzy: any column containing `invoice date`, `invoice dt`, or `date` or `dt`)
  - **Location**: `District`, `Location`, `City`, `Dealer Location`, `Delivery Location`, `Address`, `Customer Location` (Fuzzy: any column containing `location`, `district`, `city`, `address`, or `delivery`)
- If any required column group is missing, return a validation error containing:
  - `success: false`
  - `validationError: true`
  - `missingColumns: [...]`
  - `headers: [...]` (all detected headers in the sheet)

### Frontend dynamic rendering
- Display validation errors using a premium interactive mapping component in `InvoicesPage.jsx`:
  - Show a clear vertical checklist comparing the expected required GNXT fields and their matching status.
  - Render a grid showing all raw columns detected in the sheet, so the user knows exactly why the system couldn't match a specific column.
  - Show accepting conditions (list of standard keywords) for the missing columns.

## 5. Notes for Implementation
- Keep the existing `localStorage` draft behavior in shipment creation intact.
- Preserve the expandable group rows in `ExpenseTable.jsx` and add the new weight column only at the parent group row level.
- When changing `AddVehicleSheet.jsx`, keep the existing edit mode behavior and disabled vehicle number field while editing.
- The shipment creation enhancement should not require a full redesign, only a new related-plant action area adjacent to the plant selector.
- Document any new API contract clearly in code comments and ensure the frontend requests align with backend endpoints.

## 6. Files to touch
- Frontend:
  - `Frontend/src/app/components/Vechicles_Mgmt/AddVehicleSheet.jsx`
  - `Frontend/src/app/components/shipments/CreateShipmentSheet.jsx`
  - `Frontend/src/app/components/shipments/create/DestinationEntry.jsx`
  - `Frontend/src/app/components/expenses/ExpensesPage.jsx`
  - `Frontend/src/app/components/expenses/ExpenseFiltersBar.jsx`
  - `Frontend/src/app/components/expenses/ExpenseTable.jsx`
  - `Frontend/src/app/components/invoices/InvoicesPage.jsx`
- Backend:
  - `backend/src/controllers/vehicleController.js`
  - `backend/src/controllers/shipment.controller.js` (if related-plant API is added)
  - `backend/src/controllers/invoice.controller.js` (for column validation)
  - `backend/src/utils/mapInvoice.js` (for column group definitions)

---

This spec is intended to be precise enough for implementation by the frontend team while leaving room for a clean integration with the existing codebase.
