# GNXT Distribution Hub
# Full Project Test Cases, Flow Validation & GPS Tracking Fix Guide

**Document Type:** QA Test Cases + Tracking Setup Guide  
**Date:** May 2026  
**Covers:** Every module, every test case, GPS tracking fix checklist, client information required

---

## PART 1 — COMPLETE OPERATIONAL FLOW

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CORRECT OPERATIONAL SEQUENCE                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SETUP (one-time)                                                    │
│  ─────────────────                                                   │
│  1. Add Vehicle  →  2. Add Driver                                    │
│                                                                      │
│  PER DISPATCH                                                        │
│  ─────────────────                                                   │
│  3. Upload Invoice Excel  →  4. Create Shipment                      │
│                                                                      │
│  IN TRANSIT                                                          │
│  ─────────────────                                                   │
│  5. Track Shipment (GPS map)  →  6. Mark as Delivered + Upload POD  │
│                                                                      │
│  FINANCE                                                             │
│  ─────────────────                                                   │
│  7. Log Expenses  →  8. View Reports / Dashboard                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## PART 2 — MODULE-BY-MODULE TEST CASES

---

### MODULE 1 — VEHICLE MANAGEMENT
**Route:** `/vehicles`  
**Status:** 🟢 FULLY LIVE (real database)  
**Backend:** `GET/POST/PUT/PATCH/DELETE /api/vehicles`

#### TC-V-01: Add a new vehicle
```
Steps:
  1. Go to /vehicles
  2. Click "Add Vehicle"
  3. Fill in:
     - Vehicle Number:    KL07DC9716
     - Vehicle Type:      Truck
     - Model:             Tata 407
     - Max Capacity:      5000 kg
     - Insurance Expiry:  31/12/2027
     - Ownership:         Company
     - GPS Device IMEI:   869833082438627   ← CRITICAL for tracking
  4. Click "Add Vehicle"

Expected Result:
  ✅ Vehicle appears in the list
  ✅ Status shows "Idle"
  ✅ Availability shows "Available"
  ✅ IMEI is saved (visible in edit mode)

Verify in DB:
  GET http://localhost:5000/api/vehicles
  → Find KL07DC9716 with gpsImei: "869833082438627"
```

#### TC-V-02: Vehicle becomes unavailable when assigned to shipment
```
Steps:
  1. Create a shipment with vehicle KL07DC9716 (see TC-S-01)

Expected Result:
  ✅ Vehicle status changes to "In Transit"
  ✅ Vehicle availability changes to "On Trip"
  ✅ Vehicle no longer appears in "Available" dropdown when creating another shipment
```

#### TC-V-03: Vehicle returns to available after delivery
```
Steps:
  1. Mark shipment as Delivered (see TC-S-05)

Expected Result:
  ✅ Vehicle status changes back to "Idle"
  ✅ Vehicle availability changes back to "Available"
```

#### TC-V-04: Edit vehicle IMEI
```
Steps:
  1. Click edit (pencil icon) on any vehicle
  2. Update GPS Device IMEI field
  3. Save

Expected Result:
  ✅ IMEI updated in database
  ✅ GPS tracking will use new IMEI for matching
```

---

### MODULE 2 — DRIVER MANAGEMENT
**Route:** `/drivers`  
**Status:** 🟢 FULLY LIVE (real database)  
**Backend:** `GET/POST/PUT/DELETE /api/drivers`

#### TC-D-01: Add a new driver
```
Steps:
  1. Go to /drivers
  2. Click "Add Driver"
  3. Fill in:
     - Name:           Arun Kumar
     - Age:            34
     - Phone:          +91 94470 12345
     - License Number: KL0720210012345
     - Driver Type:    Own
  4. Save

Expected Result:
  ✅ Driver appears in list
  ✅ Trip Status shows "Idle"
  ✅ Phone and License are unique (duplicate rejected with error)
```

#### TC-D-02: Driver becomes assigned when shipment created
```
Steps:
  1. Create shipment with this driver (see TC-S-01)

Expected Result:
  ✅ Driver trip status changes to "Assigned"
  ✅ Assigned vehicle shows vehicle number
  ✅ Driver no longer appears in "Available" dropdown
```

#### TC-D-03: Duplicate phone/license rejected
```
Steps:
  1. Try to add another driver with same phone number

Expected Result:
  ✅ Error: "Phone number already registered"
```

---

### MODULE 3 — INVOICE UPLOAD
**Route:** `/invoices`  
**Status:** 🟢 FULLY LIVE (real database)  
**Backend:** `POST /api/invoices/upload`, `GET /api/invoices`

#### TC-I-01: Upload valid Excel file
```
Steps:
  1. Go to /invoices
  2. Click "Upload Invoice Sheet"
  3. Select a valid .xlsx or .csv file

Excel column names accepted:
  - "Plant Reference Number" or "Plant No" or "Plant"
  - "Customer Name" or "Customer"
  - "Invoice" or "Invoice Number" or "Invoice #"
  - "Invoice Date" or "Date"
  - "District" or "Location" or "City" or "Dealer Location"

Expected Result:
  ✅ Invoices appear in the table grouped by plant
  ✅ Status shows "Pending"
  ✅ Duplicate rows are silently skipped
  ✅ Count of inserted records shown
```

#### TC-I-02: Duplicate upload handling
```
Steps:
  1. Upload the same file twice

Expected Result:
  ✅ Second upload shows 0 new records inserted
  ✅ No duplicate entries in database
  ✅ No error thrown
```

#### TC-I-03: Invoice status update
```
Steps:
  1. Find an invoice in the list
  2. Change status dropdown

Expected Result:
  ✅ Status updates immediately
  ✅ Persisted in database (refresh page → still updated)
```

#### TC-I-04: Invoices available in shipment creation
```
Steps:
  1. Upload invoices with plant number "PLT-001"
  2. Go to Create Shipment
  3. Select plant "PLT-001"

Expected Result:
  ✅ Invoices for PLT-001 appear in the invoice selector
  ✅ Only "Pending" status invoices are shown
```

---

### MODULE 4 — SHIPMENT CREATION
**Route:** `/shipments` → "Create Shipment"  
**Status:** 🟢 FULLY LIVE (real database)  
**Backend:** `POST /api/shipments`, `GET /api/shipments/next-id`

#### TC-S-01: Create a basic shipment
```
Pre-conditions:
  - At least 1 vehicle with status "Available"
  - At least 1 driver with status "Idle"
  - At least 1 invoice with status "Pending"

Steps:
  1. Go to /shipments
  2. Click "Create Shipment"
  3. Section 1 — Destinations:
     - Select Plant Reference Number (from dropdown)
     - Select invoices for that plant
     - Enter: Total Tyres = 50, Tubes = 50, Flaps = 20
     - Enter: Weight = 800 kg
  4. Section 2 — Vehicle & Driver:
     - Select vehicle: KL07DC9716
     - Select driver: Arun Kumar
  5. Click "Create Shipment"

Expected Result:
  ✅ Success banner: "Shipment SHP-2026-NNNNN created successfully"
  ✅ Shipment ID auto-generated: SHP-2026-NNNNN
  ✅ LR Number auto-generated: LR-2026-NNNNN-01
  ✅ Shipment appears in list with status "Pending"
  ✅ Vehicle status → "On Trip / In Transit"
  ✅ Driver status → "Assigned"
  ✅ Customer name and delivery location auto-filled from invoice
```

#### TC-S-02: Create multi-destination shipment
```
Steps:
  1. Create Shipment
  2. Add first destination (Plant A)
  3. Click "Add Another Destination"
  4. Add second destination (Plant B — different plant)
  5. Submit

Expected Result:
  ✅ Two destinations created
  ✅ Two LR numbers: LR-2026-NNNNN-01, LR-2026-NNNNN-02
  ✅ Totals summed across both destinations
```

#### TC-S-03: Duplicate plant rejected
```
Steps:
  1. Create Shipment
  2. Add destination with Plant A
  3. Add another destination — select same Plant A

Expected Result:
  ✅ Error: "Duplicate plant: PLT-001 — each destination must use a different plant"
```

#### TC-S-04: Draft save and restore
```
Steps:
  1. Open Create Shipment
  2. Fill in some fields
  3. Click "Save Draft"
  4. Close the sheet
  5. Reopen Create Shipment

Expected Result:
  ✅ "Draft restored" banner appears
  ✅ Previously entered data is restored
  ✅ "Discard draft" button clears it
```

#### TC-S-05: Edit existing shipment
```
Steps:
  1. Find a shipment with status "Pending"
  2. Click pencil (edit) icon
  3. Change vehicle or driver
  4. Click "Update Shipment"

Expected Result:
  ✅ Shipment updated
  ✅ Old vehicle freed (status → Available)
  ✅ New vehicle marked On Trip
```

---

### MODULE 5 — SHIPMENT LIST & VIEW
**Route:** `/shipments`  
**Status:** 🟢 FULLY LIVE (real database)

#### TC-SV-01: View shipment details
```
Steps:
  1. Go to /shipments
  2. Click eye icon on any shipment

Expected Result:
  ✅ Sheet opens with:
     - Shipment Overview (dealer, location, dispatch date, qty, weight)
     - Location & GPS Tracking section
     - POD section
     - Vehicle & Driver details
     - Items breakdown per destination
     - Shipment timeline
```

#### TC-SV-02: Search and filter shipments
```
Steps:
  1. Type shipment ID in search box
  2. Filter by status (Pending / In Transit / Delivered / Cancelled)
  3. Filter by date

Expected Result:
  ✅ List filters in real time
  ✅ Status counts update in filter bar
```

#### TC-SV-03: Mark shipment as Delivered
```
Steps:
  1. Open shipment with status "In Transit"
  2. Click "Mark as Delivered"

Expected Result:
  ✅ Status changes to "Delivered"
  ✅ Vehicle freed → Available
  ✅ Driver freed → Idle
  ✅ Delivery date recorded
  ✅ Timeline shows "Delivered" step completed
```

#### TC-SV-04: Cancel shipment
```
Steps:
  1. Open shipment with status "Pending"
  2. Click "Cancel Shipment"

Expected Result:
  ✅ Status changes to "Cancelled"
  ✅ Vehicle freed → Available
  ✅ Driver freed → Idle
```

#### TC-SV-05: Delete shipment
```
Steps:
  1. Click trash icon on any shipment row
  2. Confirm deletion

Expected Result:
  ✅ Shipment removed from list
  ✅ Removed from database
```

---

### MODULE 6 — GPS TRACKING (SHIPMENT DETAIL VIEW)
**Route:** `/shipments` → View → Location & GPS Tracking  
**Status:** 🟡 LIVE WHEN GPS DEVICE TRANSMITS (backend ready)

#### TC-GPS-01: GPS Live badge appears when device is transmitting
```
Pre-condition: GPS device has been configured to send to your webhook

Steps:
  1. Open shipment details for a vehicle with GPS device
  2. Look at the "Location & GPS Tracking" section

Expected Result (when GPS is live):
  ✅ Green "GPS Live · XX km/h" badge in header
  ✅ Green "REAL DATA" panel showing:
     - Coordinates (lat/lng)
     - Speed in km/h
     - GPS Quality (High/Moderate/Low)
     - Satellites count
     - Heading in degrees
     - Altitude in metres
     - Fix timestamp
  ✅ "Verify on Google Maps" link opens correct location
  ✅ Leaflet map shows truck marker at real coordinates
  ✅ Map auto-updates every 10 seconds

Expected Result (when GPS is NOT transmitting):
  ✅ Amber "No GPS Signal" badge
  ✅ Route diagram shown (Warehouse → Truck → Dealer)
  ✅ "Awaiting GPS fix" message
```

#### TC-GPS-02: Webhook receives GPS data correctly
```
Test using curl (run in terminal):

curl -X POST http://localhost:5000/api/gps/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "t": "G",
    "time": 1748000000000,
    "device_id": "869833082438627",
    "hd": 92.5,
    "sp": 45.0,
    "refid": "test-001",
    "ns": 9,
    "alt": 7.2,
    "geo": {"lat": 9.9312, "lng": 76.2673, "acc": 3},
    "vehicle_id": "KL07DC9716"
  }'

Expected Result:
  ✅ HTTP 200 response: {"ok": true}
  ✅ GET http://localhost:5000/api/gps/location/KL07DC9716
     returns fresh coordinates with correct speed/heading
```

#### TC-GPS-03: Map shows correct location
```
Steps:
  1. Send GPS fix with known coordinates (e.g., 9.9312, 76.2673)
  2. Open shipment details
  3. Click "Verify on Google Maps" link

Expected Result:
  ✅ Google Maps opens at exactly those coordinates
  ✅ Location matches where the vehicle physically is
  ✅ If coordinates are wrong → GPS device is sending wrong data
```

#### TC-GPS-04: GPS polling updates map automatically
```
Steps:
  1. Run simulator: node backend/src/scripts/simulateGps.js
  2. Open shipment details
  3. Watch the map for 30 seconds

Expected Result:
  ✅ Truck marker moves on map every 10 seconds
  ✅ Speed value updates
  ✅ "Last Updated" timestamp refreshes
  ✅ No page refresh needed
```

---

### MODULE 7 — VEHICLE TRACKING PAGE
**Route:** `/tracking/:vehicleId`  
**Status:** 🟡 LIVE WHEN GPS DEVICE TRANSMITS

#### TC-VT-01: Open tracking page for a vehicle
```
Steps:
  1. Navigate to /tracking/KL07DC9716

Expected Result:
  ✅ Page loads with vehicle number in header
  ✅ KPI cards show: Departed Time, Est. Delivery, Distance, ETA, % Complete
  ✅ Live Map section shows route visualization
  ✅ Fuel Information table shows calculated values
  ✅ Timeline of Movement shows shipment steps
  ✅ Right panel: Quick Actions, Driver Info, Shipment Info
```

#### TC-VT-02: GPS Live banner on tracking page
```
Pre-condition: GPS data exists for vehicle

Expected Result:
  ✅ Green banner: "Live GPS active — XX km/h · Satellites: 9 · Accuracy: High"
  ✅ "GPS Live" badge in header
  ✅ Refresh button triggers immediate GPS poll
```

---

### MODULE 8 — TRIP TRACKING PAGE
**Route:** `/trips`  
**Status:** 🔴 DUMMY DATA (frontend only — needs backend connection)

#### TC-TT-01: Current state (dummy)
```
Steps:
  1. Go to /trips

Current Result (DUMMY):
  ⚠️ Shows hardcoded vehicle list (not from database)
  ⚠️ KPI cards show fake numbers
  ⚠️ Filters work on mock data only

Expected Result (when connected to real backend):
  ✅ Shows real active shipments from /api/shipments?status=In Transit
  ✅ GPS locations from /api/gps/all
  ✅ Real vehicle counts and statuses
```

**ACTION REQUIRED:** Connect TripTrackingPage to real APIs.

---

### MODULE 9 — DASHBOARD
**Route:** `/`  
**Status:** 🔴 DUMMY DATA (frontend only — needs backend connection)

#### TC-DB-01: Current state (dummy)
```
Steps:
  1. Go to / (Dashboard)

Current Result (DUMMY):
  ⚠️ "Active Shipments: 32" — hardcoded
  ⚠️ "Pending PODs: 18" — hardcoded
  ⚠️ "Vehicles on Trip: 45" — hardcoded
  ⚠️ Weekly chart — hardcoded data
  ⚠️ Live Shipments table — hardcoded 4 shipments
  ⚠️ Pending PODs panel — hardcoded 3 PODs

Expected Result (when connected to real backend):
  ✅ All numbers from real MongoDB counts
  ✅ Chart from real daily shipment aggregation
```

**ACTION REQUIRED:** Build dashboard stats API and connect frontend.

---

### MODULE 10 — EXPENSES
**Route:** `/expenses`  
**Status:** 🟢 FULLY LIVE (real database)  
**Backend:** `GET/POST/PUT/DELETE /api/expenses`

#### TC-E-01: Add an expense
```
Steps:
  1. Go to /expenses
  2. Click "Add Expense"
  3. Fill in:
     - LR Number:     LR-2026-00002-01  (from a real shipment)
     - Expense Type:  Fuel
     - Amount:        ₹4500
     - Date:          today
     - Description:   Fuel fill at Kochi pump
  4. Save

Expected Result:
  ✅ Expense appears in list
  ✅ Summary cards update (Total Expenses, Fuel Cost)
  ✅ Linked to correct shipment LR number
```

#### TC-E-02: Filter expenses
```
Steps:
  1. Filter by Expense Type: Fuel
  2. Filter by date range

Expected Result:
  ✅ Only fuel expenses shown
  ✅ Summary cards recalculate for filtered data
```

#### TC-E-03: Summary cards accuracy
```
Steps:
  1. Add expenses of different types
  2. Check summary cards

Expected Result:
  ✅ Total Expenses = sum of all amounts
  ✅ Fuel Cost = sum of Fuel type only
  ✅ Toll Charges = sum of Toll type only
  ✅ Maintenance = sum of Maintenance type only
  ✅ Other = Total - Fuel - Toll - Maintenance
```

---

### MODULE 11 — REPORTS
**Route:** `/reports`  
**Status:** 🔴 DUMMY DATA (frontend only)

#### TC-R-01: Current state
```
Current Result (DUMMY):
  ⚠️ "Total Shipments: 1,284" — hardcoded
  ⚠️ Chart data — hardcoded
  ⚠️ Export PDF — not implemented
```

**ACTION REQUIRED:** Build reports aggregation API.

---

### MODULE 12 — DEALERS
**Route:** `/dealers`  
**Status:** 🔴 NOT BUILT (placeholder page)

**ACTION REQUIRED:** Build dealer model, API, and frontend page.

---

## PART 3 — GPS TRACKING: EXACT ISSUE AND FIX

### Why Tracking Is Not Working Right Now

```
WHAT YOU HAVE:
  ✅ GPS device installed in vehicle KL07DC9716
  ✅ Device IMEI: 869833082438627
  ✅ Your backend webhook ready at: POST /api/gps/webhook
  ✅ Frontend map ready to display live location

WHAT IS MISSING:
  ❌ The GPS device does not know your server URL
  
  The device currently sends location data to:
    → GPS Provider's own cloud server (e.g., TrackSolid, Teltonika, etc.)
  
  It needs to ALSO send to:
    → Your server: POST http://YOUR_SERVER_IP:5000/api/gps/webhook
```

### The Fix — Step by Step

```
STEP 1: Find out which GPS platform the client uses
  Ask: "Which app or website do you use to see this vehicle's location?"
  
  Common platforms:
  • TrackSolid (app by Concox)
  • Teltonika Configurator
  • iStartek Platform
  • GPSGate
  • Queclink
  • Any custom platform

STEP 2: Log into that platform
  Use the client's credentials to access the GPS platform dashboard

STEP 3: Find the webhook/HTTP push setting
  Look for one of these menu items:
  • "Webhook"
  • "HTTP Push"
  • "Callback URL"
  • "Third-party Integration"
  • "Data Forwarding"
  • "API Push"
  • "Server Settings"

STEP 4: Enter your server URL
  URL:     http://YOUR_PUBLIC_IP:5000/api/gps/webhook
  Method:  POST
  Format:  JSON
  
  For production (recommended):
  URL:     https://gnxt.yourdomain.com/api/gps/webhook

STEP 5: Save and verify
  Wait 30 seconds, then call:
  GET http://localhost:5000/api/gps/location/KL07DC9716
  
  If it returns fresh coordinates → TRACKING IS LIVE ✅
  If it returns 404 → device not yet sending → check platform settings
```

---

## PART 4 — EXACT INFORMATION TO GET FROM CLIENT

### Information Required for GPS Tracking

Ask the client for ALL of the following:

```
┌─────────────────────────────────────────────────────────────────────┐
│  REQUIRED FROM CLIENT                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. GPS PLATFORM NAME                                               │
│     "Which app/website do you use to track vehicles?"               │
│     Answer needed: e.g., "TrackSolid", "Teltonika", "iStartek"     │
│                                                                     │
│  2. GPS PLATFORM LOGIN CREDENTIALS                                  │
│     Username / Email: _______________                               │
│     Password:         _______________                               │
│     OR: Ask them to configure the webhook themselves                │
│                                                                     │
│  3. CONFIRM DEVICE IS ACTIVE                                        │
│     "Can you currently see the vehicle's location in your app?"     │
│     If YES → device is working, just needs webhook configured       │
│     If NO  → device may be offline, SIM issue, or not activated    │
│                                                                     │
│  4. FOR EACH VEHICLE — CONFIRM THESE DETAILS:                       │
│     Vehicle Registration Number: KL07DC9716                         │
│     GPS Device IMEI:             869833082438627                    │
│     SIM Card Number (optional):  _______________                    │
│     Device Model (optional):     _______________                    │
│                                                                     │
│  5. WEBHOOK SUPPORT CONFIRMATION                                    │
│     "Does your GPS platform support HTTP webhook/push?"             │
│     If YES → proceed with configuration                             │
│     If NO  → need alternative approach (see below)                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### If the GPS Platform Does NOT Support Webhooks

```
Alternative options:

OPTION A — Use the GPS platform's API (polling)
  • Ask client for their GPS platform's API key
  • Build a backend job that polls their API every 30s
  • Fetch location and store in your VehicleLocation DB
  • No changes needed to frontend

OPTION B — Reconfigure the device directly
  • Some GPS devices accept SMS commands to change server
  • Send SMS to device SIM: "SERVER,0,IP,PORT#"
  • Device then sends directly to your server
  • Requires knowing the device model and SIM number

OPTION C — Use a middleware service
  • Services like Traccar (open source) can receive from
    many device types and forward to your webhook
```

---

## PART 5 — SERVER DEPLOYMENT CHECKLIST FOR LIVE TRACKING

Before the GPS device can send to your server, the server must be publicly accessible:

```
□ 1. Deploy backend to a cloud server (AWS, DigitalOcean, Azure, etc.)
     OR use ngrok for testing: ngrok http 5000
     → gives you a public URL like: https://abc123.ngrok.io

□ 2. Your webhook URL will be:
     https://abc123.ngrok.io/api/gps/webhook  (ngrok testing)
     https://yourdomain.com/api/gps/webhook   (production)

□ 3. Test the public URL is reachable:
     curl -X POST https://your-url/api/gps/webhook \
       -H "Content-Type: application/json" \
       -d '{"t":"G","time":1748000000000,"device_id":"869833082438627",
            "hd":90,"sp":40,"refid":"test","ns":8,"alt":10,
            "geo":{"lat":9.9312,"lng":76.2673,"acc":3},
            "vehicle_id":"KL07DC9716"}'
     
     Expected: {"ok": true}

□ 4. Configure GPS platform with this public URL

□ 5. Verify: GET https://your-url/api/gps/location/KL07DC9716
     Should return fresh coordinates within 30 seconds of vehicle moving
```

---

## PART 6 — QUICK VERIFICATION COMMANDS

Run these to verify each part of the system is working:

```bash
# 1. Check backend is running
curl http://localhost:5000/health
# Expected: {"message":"Server is running"}

# 2. Check vehicles in DB
curl http://localhost:5000/api/vehicles
# Expected: JSON array with KL07DC9716

# 3. Check GPS data for vehicle
curl http://localhost:5000/api/gps/location/KL07DC9716
# Expected: {"success":true,"data":{"lat":9.9312,"lng":76.2673,...}}

# 4. Send a test GPS fix manually
curl -X POST http://localhost:5000/api/gps/webhook \
  -H "Content-Type: application/json" \
  -d '{"t":"G","time":1748000000000,"device_id":"869833082438627","hd":92.5,"sp":45.0,"refid":"manual-test","ns":9,"alt":7.2,"geo":{"lat":9.9312,"lng":76.2673,"acc":3},"vehicle_id":"KL07DC9716"}'
# Expected: {"ok":true}

# 5. Verify GPS fix was stored
curl http://localhost:5000/api/gps/location/KL07DC9716
# Expected: fresh fixTime timestamp

# 6. Run GPS simulator (proves full pipeline works)
node backend/src/scripts/simulateGps.js
# Then open shipment SHP-2026-00002 details → map should update live
```

---

## PART 7 — WHAT TO FOCUS ON (PRIORITY ORDER)

### 🔴 IMMEDIATE — For Live Tracking

| Priority | Task | Who Does It |
|----------|------|-------------|
| 1 | Get GPS platform name from client | You (ask client) |
| 2 | Configure webhook URL in GPS platform | You + client |
| 3 | Deploy backend to public server OR use ngrok | You |
| 4 | Verify real GPS data flowing | You |

### 🟡 SHORT TERM — Connect Dummy Pages to Real Data

| Priority | Task | Effort |
|----------|------|--------|
| 5 | Dashboard — build stats API + connect frontend | Medium |
| 6 | Trip Tracking — connect to real shipments + GPS | Medium |
| 7 | Reports — build aggregation API | Medium |

### 🟢 MEDIUM TERM — New Features

| Priority | Task | Effort |
|----------|------|--------|
| 8 | POD upload — save to backend (currently lost on close) | Small |
| 9 | GPS history trail on map (polyline) | Small |
| 10 | Dealers module — model + API + frontend | Medium |
| 11 | Diesel tracking module | Medium |

---

## PART 8 — KNOWN ISSUES TO FIX

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | Map box empty when GPS data exists | TrackingSection.jsx | Fixed — Leaflet CSS now imported directly |
| 2 | Dashboard shows hardcoded numbers | DashboardPage.jsx | Build /api/dashboard/stats endpoint |
| 3 | Trip Tracking shows mock vehicles | TripTrackingPage.jsx | Connect to /api/shipments + /api/gps/all |
| 4 | Reports shows hardcoded chart | ReportsPage.jsx | Build /api/reports/shipments endpoint |
| 5 | POD images lost when sheet closes | ViewShipmentSheet.jsx | Build POST /api/shipments/:id/pod |
| 6 | Dealers page is placeholder | DealersPage.jsx | Build full dealers module |
| 7 | GPS tracking only works on localhost | All GPS features | Deploy to public server |

---

## PART 9 — EXCEL INVOICE FORMAT REFERENCE

Your Excel file must have these column headers (exact names):

```
Required columns:
  "Plant Reference Number"  or  "Plant No"  or  "Plant"
  "Customer Name"           or  "Customer"
  "Invoice"                 or  "Invoice Number"  or  "Invoice #"
  "Invoice Date"            or  "Date"

Optional columns:
  "District"  or  "Location"  or  "City"  or  "Dealer Location"

Notes:
  • Date can be Excel serial number or text (DD/MM/YYYY, YYYY-MM-DD)
  • Duplicate rows (same plant + customer + invoice + date) are skipped
  • Empty plant reference rows are skipped
  • File formats accepted: .xlsx, .xls, .csv
```

---

*End of Document*  
*Generated: May 2026 | GNXT Distribution Hub*
