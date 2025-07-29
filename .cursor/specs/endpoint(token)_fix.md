# API Endpoint & Token Issues - Detailed Fix Guide

## Overview

This document outlines the specific issues found during API endpoint testing and provides step-by-step solutions to fix them. The main problems are related to token handling, endpoint paths, and response consistency.

---

## Issue 1: Token Handling Problems

### Problem

Most endpoints are failing with `{"status":"fail","message":"No token provided!"}` even when a valid token is obtained from login.

### Root Cause

The test script is not properly sending the authentication token in the correct header format.

### Solution Steps

#### Step 1.1: Verify Token Header Format

- **Current Issue:** Test script may not be sending token in `x-access-token` header
- **Fix:** Ensure all authenticated requests include:
  ```
  headers: {
    'x-access-token': token,
    'Content-Type': 'application/json'
  }
  ```

#### Step 1.2: Check Token Storage & Retrieval

- **Current Issue:** Token obtained from login may not be properly stored/retrieved
- **Fix:** Verify token is stored and retrieved correctly in test script:
  ```javascript
  // After successful login
  const token = response.data.employee_token;
  // Store for subsequent requests
  ```

#### Step 1.3: Update Test Script Token Logic

- **File:** `server/test-api-endpoints.js`
- **Action:** Review and fix token passing logic for all authenticated endpoints

---

## Issue 2: Incorrect Endpoint Paths

### Problem

Some endpoints return HTML error pages (404) instead of JSON responses.

### Root Cause

Test script is using incorrect endpoint paths that don't match the actual route definitions.

### Solution Steps

#### Step 2.1: Verify Employee Endpoint Path

- **Current Test:** `GET /api/employee`
- **Actual Route:** Check `server/routes/employee.routes.js`
- **Fix:** Update test script to use correct path (likely `/api/employees` for GET all)

#### Step 2.2: Map All Endpoint Paths

- **Action:** Create a complete mapping of test endpoints vs actual routes:
  ```
  Test Script Path → Actual Route Path
  GET /api/customer → GET /api/customers
  GET /api/employee → GET /api/employees
  POST /api/employee → POST /api/employee
  GET /api/service → GET /api/services
  POST /api/service → POST /api/service
  ```

#### Step 2.3: Update Test Script Paths

- **File:** `server/test-api-endpoints.js`
- **Action:** Correct all endpoint paths to match actual route definitions

---

## Issue 3: Response Format Inconsistency

### Problem

Some endpoints return inconsistent status formats (e.g., `"status":"true"` instead of `"status":"success"`).

### Root Cause

Different controllers are using different response formats.

### Solution Steps

#### Step 3.1: Standardize Response Format

- **Standard Format:**

  ```javascript
  // Success Response
  {
    "status": "success",
    "message": "Operation completed successfully",
    "data": { ... }
  }

  // Error Response
  {
    "status": "fail",
    "message": "Error description"
  }
  ```

#### Step 3.2: Update Controllers

- **Files to Update:**
  - `server/controllers/employee.controller.js`
  - `server/controllers/customer.controller.js`
  - `server/controllers/service.controller.js`
  - `server/controllers/vehicle.controller.js`
  - `server/controllers/order.controller.js`

#### Step 3.3: Fix Employee Creation Response

- **Current:** Returns `"status":"true"`
- **Fix:** Change to `"status":"success"`

---

## Issue 4: Missing Test Data Dependencies

### Problem

Vehicle and Order tests fail because no customers exist in the database.

### Root Cause

Customer creation fails, so dependent tests can't run.

### Solution Steps

#### Step 4.1: Fix Customer Creation First

- **Priority:** Fix customer endpoint before testing vehicles/orders
- **Action:** Ensure `POST /api/customer` works correctly

#### Step 4.2: Create Test Data Setup

- **Action:** Add test data creation to test script:

  ```javascript
  // Create test customer first
  const customerResponse = await createTestCustomer(token);
  const customerId = customerResponse.data.customer_id;

  // Then create vehicle using customer ID
  const vehicleResponse = await createTestVehicle(token, customerId);
  ```

#### Step 4.3: Add Cleanup Logic

- **Action:** Add cleanup to remove test data after tests:
  ```javascript
  // Clean up test data
  await deleteTestCustomer(token, customerId);
  ```

---

## Issue 5: Authentication Middleware Problems

### Problem

Valid token requests are being rejected with "No token provided!" error.

### Root Cause

Token validation logic may have issues or token format problems.

### Solution Steps

#### Step 5.1: Debug Token Validation

- **File:** `server/middlewares/auth.middleware.js`
- **Action:** Add debug logging to see what's happening:
  ```javascript
  console.log("Token received:", token);
  console.log("Token type:", typeof token);
  ```

#### Step 5.2: Verify JWT Secret

- **Action:** Ensure `JWT_SECRET` environment variable is set correctly
- **Check:** Verify secret matches the one used for token creation

#### Step 5.3: Test Token Manually

- **Action:** Use Postman to test a protected endpoint with the token from login
- **Headers:** Include `x-access-token: [token]`

---

## Implementation Priority Order

### Phase 1: Critical Fixes (Do First)

1. **Fix Token Header Format** - Update test script to send tokens correctly
2. **Verify Endpoint Paths** - Map and correct all endpoint paths
3. **Debug Authentication Middleware** - Add logging to understand token rejection

### Phase 2: Response Standardization

4. **Standardize Response Formats** - Update all controllers to use consistent format
5. **Fix Employee Creation Response** - Change "true" to "success"

### Phase 3: Test Data & Dependencies

6. **Fix Customer Creation** - Ensure customer endpoints work
7. **Add Test Data Setup** - Create proper test data creation/cleanup
8. **Test Dependent Endpoints** - Test vehicles and orders with valid data

### Phase 4: Final Validation

9. **Rerun Complete Test Suite** - Verify all endpoints work correctly
10. **Document Working Endpoints** - Create endpoint documentation

---

## Testing Strategy

### After Each Fix

1. **Test Individual Endpoint** - Use Postman to test the specific endpoint
2. **Run Related Test** - Run the specific test in the test script
3. **Verify Response Format** - Ensure response matches expected format

### Final Validation

1. **Run Complete Test Suite** - Execute full test script
2. **Manual API Testing** - Test all endpoints via Postman
3. **Frontend Integration** - Test with actual frontend application

---

## Files to Modify

### Backend Files

- `server/test-api-endpoints.js` - Fix token handling and endpoint paths
- `server/controllers/*.js` - Standardize response formats
- `server/middlewares/auth.middleware.js` - Add debug logging

### Documentation

- Update API documentation with correct endpoint paths
- Document expected request/response formats

---

_This guide provides a systematic approach to fixing the API issues. Each step should be implemented and tested before moving to the next one._
