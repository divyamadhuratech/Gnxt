# Project Plan: Role-Based Access Control (RBAC) Permissions

Enforce dynamic, flexible role permissions (`view`, `create`, `edit`, `delete`) per module across both the frontend and backend.

## Overview
- **Goal**: Restrict users dynamically based on permissions assigned to their roles.
- **Rules**:
  - `Super Admin` always has full access (cannot be modified).
  - All other roles can have their permissions edited in the settings panel.
  - Changes must be applied dynamically to the frontend rendering and backend APIs.

## Success Criteria
- Permissions are strictly checked on both frontend and backend.
- Modifying permissions immediately takes effect without code deployment.
- Unauthorized actions are blocked and return appropriate errors (`403 Forbidden`).

## File Structure & Proposed Changes
- `backend/src/middleware/auth.middleware.js`: Add `requirePermission` middleware.
- `backend/src/routes/*.routes.js`: Apply authentication and permission middleware.
- `Frontend/src/main.jsx`: Patch `window.fetch` to inject JWT token.
- `Frontend/src/app/context/AuthContext.jsx`: Expose `hasPermission` utility.
- `Frontend/src/app/components/Layout.jsx`: Filter visible menu items.
- `Frontend/src/app/components/shipments/*.jsx`: Enforce permissions on shipment actions.

## Task Breakdown

### Task 1: Backend Middleware Setup
- **Agent**: `backend-specialist`
- **Skills**: `nodejs-best-practices`
- **INPUT**: Existing `auth.middleware.js`
- **OUTPUT**: Updated `auth.middleware.js` with `requirePermission` factory.
- **VERIFY**: Check middleware exports.

### Task 2: Backend Routes Protection
- **Agent**: `backend-specialist`
- **Skills**: `api-patterns`
- **INPUT**: Unsecured routes
- **OUTPUT**: Routes protected by `authenticate` and `requirePermission` middleware.
- **VERIFY**: Ensure HTTP requests block requests when permissions are lacking.

### Task 3: Global Fetch Injection
- **Agent**: `frontend-specialist`
- **Skills**: `react-best-practices`
- **INPUT**: `main.jsx` without fetch interceptor.
- **OUTPUT**: `main.jsx` intercepting fetches to automatically add the `Authorization` header.
- **VERIFY**: API requests carry Bearer tokens.

### Task 4: UI Permission Checks & Layout Updates
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **INPUT**: Pages without dynamic action visibility.
- **OUTPUT**: Layout and component action buttons hidden/disabled when unauthorized.
- **VERIFY**: Login as non-admin, verify buttons are hidden.

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-06-02
