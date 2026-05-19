# GNXT Distribution Hub — System Flow & Status Report

**Generated:** May 2026  
**Purpose:** Complete operational flow, module status, and live tracking readiness guide

---

## THE CORRECT OPERATIONAL FLOW

```
STEP 1          STEP 2          STEP 3          STEP 4          STEP 5
Add Vehicle  →  Add Driver  →  Upload Invoice  →  Create Shipment  →  Track Shipment
(Fleet Mgmt)   (Fleet Mgmt)   (Finance)           (Operations)        (Operations)
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRE-REQUISITES (One-time setup — do before any shipment)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Add Vehicle  →  /vehicles                                               │
│     • Vehicle number, type, model, capacity, insurance expiry, ownership    │
│     • GPS Device IMEI  ← CRITICAL for live tracking                        │
│     • Vehicle gets status: Idle / Available                                 │
│                                                                             │
│  2. Add Driver  →  /drivers                                                 │
│     • Name, age, phone, license number, driver type (Own/Hired/Contract)   │
│     • Driver gets status: Idle                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  BEFORE EACH DISPATCH                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  3. Upload Invoice Sheet  →  /invoices                                      │
│     • Upload Excel/CSV file from the plant                                  │
│     • System parses: Plant Ref No, Customer Name, Invoice No, Date,        │
│       Location, Status                                                      │
│     • Duplicates are automatically skipped                                  │
│     • Invoices get status: Pending                                          │
│     • These become available for shipment creation                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  DISPATCH                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  4. Create Shipment  →  /shipments → "Create Shipment" button               │
│     • Select Plant Reference Number (from uploaded invoices)                │
│     • Select Invoices for that plant                                        │
│     • Enter: Total Tyres, Tubes, Flaps, Weight (kg)                        │
│     • Add multiple destinations if needed (multi-drop)                      │
│     • Select Vehicle (only Available vehicles shown)                        │
│     • Select Driver (only Idle drivers shown)                               │
│     • System auto-generates:                                                │
│         - Shipment ID: SHP-2026-NNNNN                                       │
│         - LR Number:   LR-2026-NNNNN-01 (per destination)                  │
│     • Vehicle status → "On Trip / In Transit"                               │
│     • Driver status  → "Assigned"                                           │
│     • Shipment status → "Pending"                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  IN TRANSIT                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  5. Track Shipment  →  /shipments → View (eye icon) → Shipment Details     │
│     • Shipment Overview: Dealer, Location, Dispatch Date, Qty, Weight      │
│     • Location & GPS Tracking:                                              │
│         - If GPS device is transmitting → Live map with truck marker        │
│         - If no GPS yet → Route diagram (Warehouse → Truck → Dealer)       │
│     • Live GPS panel shows: Coordinates, Speed, Accuracy, Satellites,      │
│       Heading, Altitude, Fix Time                                           │
│     • "Verify on Google Maps" link to confirm real location                 │
│     • POD Section: Upload proof of delivery documents                       │
│     • Vehicle & Driver Details                                              │
│     • Items Breakdown per destination                                       │
│     • Shipment Timeline                                                     │
│     • Action buttons: Contact Driver | Mark as Delivered                   │
│                                                                             │
│  5b. Trip Tracking  →  /trips                                               │
│     • Overview of ALL active vehicles on map                                │
│     • Filter by status: Moving / Idle / Stopped                             │
│     • Click vehicle → /tracking/:vehicleId for detailed tracking           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  DELIVERY                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  6. Mark as Delivered  →  Shipment Details → "Mark as Delivered"            │
│     • Shipment status → "Delivered"                                         │
│     • Vehicle status  → "Available / Idle"                                  │
│     • Driver status   → "Idle"                                              │
│     • Upload POD: Receiver name, remarks, proof images                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│  FINANCE & REPORTING                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  7. Log Expenses  →  /expenses                                              │
│     • Add expense linked to LR Number / Vehicle / Driver                   │
│     • Types: Fuel, Toll, Maintenance, Loading/Unloading,                   │
│              Driver Allowance, Miscellaneous                                │
│     • Summary cards: Total, Fuel, Toll, Maintenance, Other                 │
│     • Filter by shipment, vehicle, driver, type, date range                │
│                                                                             │
│  8. Reports  →  /reports  [DUMMY DATA — needs backend]                      │
│     • Shipment volume trends, KPI cards, export PDF                        │
│                                                                             │
│  9. Dashboard  →  /  [DUMMY DATA — needs backend]                           │
│     • Active shipments, pending PODs, deliveries today                     │
│     • Weekly dispatch vs delivery chart                                     │
│     • Live shipments table, pending PODs panel                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## MODULE STATUS — WHAT IS REAL vs DUMMY

| # | Module | Route | Backend | Frontend | Status |
|---|--------|-------|---------|----------|--------|
| 1 | Invoice Upload | `/invoices` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 2 | Vehicle Management | `/vehicles` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 3 | Driver Management | `/drivers` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 4 | Shipment Creation | `/shipments` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 5 | Shipment View/Detail | `/shipments` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 6 | GPS Webhook (receive) | `/api/gps/webhook` | ✅ Built | N/A | 🟢 READY — awaiting device config |
| 7 | Live Tracking (shipment) | `/shipments` → view | ✅ Built | ✅ Connected | 🟡 LIVE when GPS transmits |
| 8 | Vehicle Tracking Page | `/tracking/:id` | ✅ Built | ✅ Connected | 🟡 LIVE when GPS transmits |
| 9 | Trip Tracking Page | `/trips` | ❌ Not built | ⚠️ Mock data | 🔴 DUMMY DATA |
| 10 | Dashboard | `/` | ❌ Not built | ⚠️ Mock data | 🔴 DUMMY DATA |
| 11 | Expenses | `/expenses` | ✅ Built | ✅ Connected | 🟢 FULLY LIVE |
| 12 | Reports | `/reports` | ❌ Not built | ⚠️ Mock data | 🔴 DUMMY DATA |
| 13 | Dealers | `/dealers` | ❌ Not built | ❌ Placeholder | 🔴 NOT BUILT |
| 14 | Diesel | `/diesel` | ❌ Not built | ❌ Placeholder | 🔴 NOT BUILT |
| 15 | Products | `/products` | ❌ Not built | ❌ Placeholder | 🔴 NOT BUILT |

---

## GPS LIVE TRACKING — WHAT YOU NEED TO DO

### Current State
```
Vehicle KL07DC9716
GPS Device IMEI: 869833082438627
Status: Device exists, IMEI registered in DB
        BUT device is NOT sending to your server yet
        It is sending to the GPS provider's own cloud
```

### The 3-Step Fix

```
STEP 1 — Ask the client:
  "Which GPS platform/app do you use to see this vehicle's location?"
  (Examples: TrackSolid, Teltonika, iStartek, Concox, GPSGate, etc.)

STEP 2 — In that platform's settings, add your webhook URL:
  URL:     http://YOUR_SERVER_IP:5000/api/gps/webhook
  Method:  POST
  Format:  JSON
  
  The setting is usually called one of:
  • "HTTP Push"
  • "Webhook URL"  
  • "Callback URL"
  • "Third-party push"
  • "Data forwarding"

STEP 3 — Verify it works:
  Check your backend logs for incoming POST requests to /api/gps/webhook
  OR call: GET http://localhost:5000/api/gps/location/KL07DC9716
  If it returns fresh coordinates → tracking is live
```

### For Production (when deploying to a real server)
```
Your server must be:
  • Publicly accessible (not localhost)
  • URL example: https://gnxt.yourdomain.com/api/gps/webhook
  • HTTPS recommended (some GPS platforms require it)
  • Port 5000 must be open in firewall/security group
```

### Test Without the Real Device (simulate right now)
```bash
# Run this to simulate the GPS device sending fixes every 5 seconds:
node backend/src/scripts/simulateGps.js

# Then open the shipment SHP-2026-00002 details
# The map will show the truck moving in Kochi, Kerala
# This proves the full pipeline works end-to-end
```

---

## WHAT TO BUILD NEXT (Priority Order)

### 🔴 HIGH PRIORITY — Connect real data

**1. Dashboard — connect to real backend data**
```
Currently shows: Hardcoded numbers (32 active, 18 pending, etc.)
Should show:     Real counts from MongoDB

APIs needed:
  GET /api/dashboard/stats
    → count shipments by status
    → count pending PODs
    → count vehicles on trip
    → today's deliveries

  GET /api/dashboard/chart
    → daily dispatch vs delivery counts for last 7 days
```

**2. Trip Tracking Page — connect to real GPS + shipments**
```
Currently shows: Hardcoded vehicle list
Should show:     Real active shipments + their GPS locations

APIs needed:
  GET /api/gps/all  ← already built ✅
  GET /api/shipments?status=In Transit  ← already built ✅
  
  Just need to merge these two in the frontend
```

**3. Reports — connect to real data**
```
Currently shows: Hardcoded chart data
Should show:     Real shipment history aggregated by date

APIs needed:
  GET /api/reports/shipments?from=&to=
    → aggregate shipments by date, status, vehicle, driver
```

### 🟡 MEDIUM PRIORITY — New features

**4. Dealers module**
```
Currently: Placeholder page
Need:      Dealer model, CRUD API, frontend page
           Dealers should be linked to invoice customerName
```

**5. POD (Proof of Delivery) — save to backend**
```
Currently: POD upload is frontend-only (images stored in state, lost on close)
Need:      POST /api/shipments/:id/pod
           Save receiver name, remarks, image URLs to DB
```

**6. GPS History Trail on map**
```
Currently: Map shows only current position
Need:      Draw the route trail using GET /api/gps/history/:vehicleNo
           Already built in backend ✅ — just needs frontend map polyline
```

### 🟢 LOWER PRIORITY

**7. Diesel tracking** — `/diesel` is placeholder  
**8. Products/Inventory** — `/products` is placeholder  
**9. Settings** — `/settings` is placeholder  

---

## BACKEND API REFERENCE

```
Base URL: http://localhost:5000/api

INVOICES
  POST   /invoices/upload          Upload Excel/CSV
  GET    /invoices                 List (grouped by plant)
  PATCH  /invoices/:id/status      Update status
  DELETE /invoices/:id             Delete

VEHICLES
  GET    /vehicles                 List all
  POST   /vehicles                 Create (include gpsImei field)
  PUT    /vehicles/:id             Update
  PATCH  /vehicles/:id/status      Update status
  DELETE /vehicles/:id             Delete
  GET    /vehicles/stats           Fleet statistics

DRIVERS
  GET    /drivers                  List all
  POST   /drivers                  Create
  PUT    /drivers/:id              Update
  DELETE /drivers/:id              Delete
  GET    /drivers/search?q=        Search

SHIPMENTS
  GET    /shipments                List (filter: status, search, page)
  POST   /shipments                Create
  GET    /shipments/:id            Get detail (populated)
  PATCH  /shipments/:id/status     Update status
  PUT    /shipments/:id            Edit shipment
  DELETE /shipments/:id            Delete
  GET    /shipments/next-id        Preview next IDs
  GET    /shipments/plant-numbers  Available plant numbers
  GET    /shipments/invoices-by-plant/:ref  Invoices for plant

GPS TRACKING
  POST   /gps/webhook              ← GPS device sends here (configure in GPS platform)
  GET    /gps/location/:vehicleNo  Latest fix for one vehicle
  GET    /gps/history/:vehicleNo   Last 500 fixes (for trail)
  GET    /gps/all                  Latest fix for all vehicles

EXPENSES
  GET    /expenses                 List (filter: lr, vehicle, driver, type, date)
  POST   /expenses                 Create
  PUT    /expenses/:id             Update
  DELETE /expenses/:id             Delete
  GET    /expenses/summary         Aggregated totals by type
```

---

## LIVE TRACKING CHECKLIST

Before going live with real GPS tracking, verify each item:

- [ ] Vehicle `KL07DC9716` added in app with IMEI `869833082438627`
- [ ] Shipment created and assigned to this vehicle
- [ ] Backend server deployed to a public IP/domain (not localhost)
- [ ] Port 5000 open in firewall
- [ ] GPS platform webhook URL configured to `https://yourdomain.com/api/gps/webhook`
- [ ] Test: `GET /api/gps/location/KL07DC9716` returns fresh coordinates
- [ ] Open shipment details → GPS Live badge appears (green)
- [ ] Coordinates match vehicle's actual physical location on Google Maps

---

## DATA FLOW DIAGRAM

```
Excel File
    │
    ▼
POST /api/invoices/upload
    │  parse + deduplicate
    ▼
Invoice DB (status: Pending)
    │
    │  used in
    ▼
POST /api/shipments  ←── Vehicle DB + Driver DB
    │  auto-generate IDs
    │  denormalize customer/location
    ▼
Shipment DB (status: Pending → In Transit → Delivered)
    │                              ▲
    │                              │ PATCH /api/shipments/:id/status
    │
    │  tracked by
    ▼
GPS Device (in vehicle)
    │
    │  POST /api/gps/webhook  ← configure in GPS platform
    ▼
VehicleLocation DB (latest fix + 500-point history)
    │
    │  polled every 10s by
    ▼
Frontend Map (Leaflet / OpenStreetMap)
    │  shows truck marker at real coordinates
    │  updates automatically as vehicle moves
    ▼
Shipment Details → Location & GPS Tracking section
Trip Tracking Page → /tracking/:vehicleId
```

---

*This document reflects the system state as of May 2026.*  
*Modules marked 🔴 DUMMY DATA should be connected to real backend before production use.*
