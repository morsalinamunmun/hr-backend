# Parcel Delivery API

## Project Overview

This project is a secure, modular, and role-based backend API for a parcel delivery system, inspired by real-world courier services. It's built using Express.js and Mongoose, designed to handle user authentication, role-based authorization, and comprehensive parcel lifecycle management.

Users can register as `senders` or `receivers`, while `admins` manage the overall system. The API supports core parcel operations like creating delivery requests, tracking status, and managing cancellations or deliveries.

## ✨ Features

*   ** JWT-based Authentication**: Secure user login and session management.
*   ** Role-based Authorization**:
    *   \`sender\`: Can create parcels, view their sent parcels, and cancel parcels (if not dispatched).
    *   \`receiver\`: Can view incoming parcels, confirm delivery, and see their delivery history.
    *   \`admin\` / \`super_admin\`: Can view and manage all users and parcels, update delivery statuses, and block/unblock users or parcels.
*   ** Parcel & Status Management**:
    *   Unique tracking IDs for each parcel (e.g., \`TRK-YYYYMMDD-xxxxxx\`).
    *   Detailed status logs embedded within each parcel document, tracking changes (status, location, timestamp, updatedBy, note).
    *   Predefined status transition rules to ensure logical flow (e.g., \`Requested\` -> \`Approved\` -> \`Dispatched\` -> \`In Transit\` -> \`Delivered\`).
*   ** Modular Code Architecture**: Organized into distinct modules for \`auth\`, \`user\`, and \`parcel\`.
*   ** RESTful API Endpoints**: Clear and intuitive endpoints for all operations.
*   ** Data Validation**: Robust input validation using Zod.
*   ** Error Handling**: Centralized error handling for consistent responses.

##  Tech Stack

*   **Backend Framework**: Node.js, Express.js
*   **Database**: MongoDB
*   **ODM**: Mongoose
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs
*   **Validation**: Zod
*   **Language**: TypeScript

##  Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   MongoDB (local or cloud instance like MongoDB Atlas)
*   Git

### Installation

1.  **Clone the repository**:
    \`\`\`bash
    git clone <your-repo-url>
    cd <your-repo-name>
    \`\`\`

2.  **Install dependencies**:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Environment Variables**:
    Create a \`.env\` file in the root directory and add the following:
    \`\`\`env
    PORT=3000
    DATABASE_URL=mongodb://localhost:27017/parcel-delivery-db
    JWT_ACCESS_SECRET=your_jwt_secret_key
    JWT_ACCESS_EXPIRES_IN=1d
    BCRYPT_SALT_ROUND=10
    \`\`\`
    *Replace \`your_jwt_secret_key\` with a strong, random string.*

4.  **Run the application**:
    \`\`\`bash
    npm run dev
    \`\`\`
    The API will be running on \`http://localhost:3000\`.

##  API Endpoints

All endpoints are prefixed with \`/api/v1\`.

###  Authentication & User Registration

#### 1. Register User
*   **URL**: \`/auth/register\`
*   **Method**: \`POST\`
*   **Description**: Registers a new user with a specified role (\`sender\`, \`receiver\`, \`admin\`, \`super_admin\`, \`guide\`).
*   **Authentication**: None
*   **Request Body**:
    \`\`\`json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "Password123!",
      "role": "sender" // or "receiver", "admin", "super_admin", "guide"
    }
    \`\`\`
*   **How it works**:
    1.  Receives user details including \`name\`, \`email\`, \`password\`, and \`role\`.
    2.  Checks if a user with the given email already exists.
    3.  Hashes the password using \`bcryptjs\`.
    4.  Creates a new user record in the database with the specified role.
    5.  Returns the newly created user object (excluding password).
*   **Success Response (201 CREATED)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 201,
      "message": "User Created Successfully",
      "data": {
        "_id": "65c7d8e9f0a1b2c3d4e5f6a7",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "sender",
        "isActive": true,
        "isVerified": false
      }
    }
    \`\`\`
*   **Error Response (400 BAD REQUEST)**:
    \`\`\`json
    {
      "success": false,
      "message": "User Already Exist",
      "err": { "statusCode": 400 }
    }
    \`\`\`

#### 2. Login User
*   **URL**: \`/auth/login\`
*   **Method**: \`POST\`
*   **Description**: Authenticates a user and returns a JWT access token for subsequent authenticated requests.
*   **Authentication**: None
*   **Request Body**:
    \`\`\`json
    {
      "email": "john.doe@example.com",
      "password": "Password123!"
    }
    \`\`\`
*   **How it works**:
    1.  Receives \`email\` and \`password\`.
    2.  Verifies the user's credentials against the database.
    3.  If valid, generates a JWT containing \`userId\`, \`email\`, and \`role\`.
    4.  Returns the JWT access token and basic user information. This token must be included in the \`Authorization\` header as \`Bearer <token>\` for protected routes.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "User Logged In Successfully",
      "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "_id": "65c7d8e9f0a1b2c3d4e5f6a7",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "sender"
        }
      }
    }
    \`\`\`
*   **Error Response (401 UNAUTHORIZED)**:
    \`\`\`json
    {
      "success": false,
      "message": "Invalid credentials",
      "err": { "statusCode": 401 }
    }
    \`\`\`

###  User Management (Admin Only)

These endpoints require an \`admin\` or \`super_admin\` JWT token.

#### 1. Get All Users
*   **URL**: \`/user/users\`
*   **Method**: \`GET\`
*   **Description**: Retrieves a list of all registered users in the system.
*   **Authentication**: Required (Admin, Super Admin)
*   **How it works**:
    1.  Authenticates the request using the provided JWT.
    2.  Checks if the authenticated user has \`admin\` or \`super_admin\` role.
    3.  Fetches all user records from the database, excluding sensitive information like passwords.
    4.  Returns an array of user objects and pagination metadata.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "All Users Retrieved Successfully",
      "data": [
        {
          "_id": "65c7d8e9f0a1b2c3d4e5f6a7",
          "name": "John Doe",
          "email": "john.doe@example.com",
          "role": "sender",
          "isActive": true
        }
      ],
      "meta": {
        "total": 1
      }
    }
    \`\`\`
*   **Error Response (403 FORBIDDEN)**:
    \`\`\`json
    {
      "success": false,
      "message": "You don't have permission to access this resource",
      "err": { "statusCode": 403 }
    }
    \`\`\`

#### 2. Toggle User Block Status
*   **URL**: \`/user/toggle-block/:id\`
*   **Method**: \`PATCH\`
*   **Description**: Blocks or unblocks a user by toggling their \`isActive\` status. Blocked users cannot log in or access features.
*   **Authentication**: Required (Admin, Super Admin)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the user to block/unblock.
*   **How it works**:
    1.  Authenticates the request and verifies admin role.
    2.  Finds the user by \`id\`.
    3.  Toggles the \`isActive\` status of the user.
    4.  Returns the updated user object.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "User blocked successfully",
      "data": {
        "_id": "65c7d8e9f0a1b2c3d4e5f6a7",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "sender",
        "isActive": false // User is now blocked
      }
    }
    \`\`\`
*   **Error Response (400 BAD REQUEST)**:
    \`\`\`json
    {
      "success": false,
      "message": "You cannot block yourself",
      "err": { "statusCode": 400 }
    }
    \`\`\`

###  Parcel Management (Sender)

These endpoints require a \`sender\` JWT token.

#### 1. Create Parcel Delivery Request
*   **URL**: \`/parcels\`
*   **Method**: \`POST\`
*   **Description**: Creates a new parcel delivery request. The \`senderId\` is automatically taken from the authenticated user's token.
*   **Authentication**: Required (Sender)
*   **Request Body**:
    \`\`\`json
    {
      "receiverId": "65c7d8e9f0a1b2c3d4e5f6a8", // Must be a valid existing Receiver User ID (24-character ObjectId)
      "type": "Document",
      "weight": 2.5,
      "fee": 120,
      "deliveryDate": "2025-08-05T00:00:00.000Z"
    }
    \`\`\`
*   **How it works**:
    1.  Authenticates the sender and extracts their \`userId\`.
    2.  Validates the \`receiverId\` to ensure it's a valid MongoDB ObjectId and corresponds to an existing \`receiver\` user.
    3.  Generates a unique \`trackingId\` (e.g., \`TRK-YYYYMMDD-xxxxxx\`).
    4.  Creates the parcel record with initial \`status: "Requested"\` and logs this status change.
    5.  Populates \`senderId\` and \`receiverId\` with user details before returning the parcel.
*   **Success Response (201 CREATED)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 201,
      "message": "Parcel Created Successfully",
      "data": {
        "_id": "65c7d8e9f0a1b2c3d4e5f6a9",
        "trackingId": "TRK-20250801-123456",
        "senderId": "65c7d8e9f0a1b2c3d4e5f6a7",
        "receiverId": {
          "_id": "65c7d8e9f0a1b2c3d4e5f6a8",
          "name": "Receiver Name",
          "email": "receiver@example.com",
          "phone": "1234567890"
        },
        "type": "Document",
        "weight": 2.5,
        "fee": 120,
        "deliveryDate": "2025-08-05T00:00:00.000Z",
        "status": "Requested",
        "statusLogs": [
          {
            "status": "Requested",
            "updatedBy": "65c7d8e9f0a1b2c3d4e5f6a7",
            "timestamp": "2025-08-01T12:00:00.000Z"
          }
        ],
        "createdAt": "2025-08-01T12:00:00.000Z"
      }
    }
    \`\`\`
*   **Error Response (404 NOT FOUND)**:
    \`\`\`json
    {
      "success": false,
      "message": "Receiver not found",
      "err": { "statusCode": 404 }
    }
    \`\`\`

#### 2. Get My Sent Parcels
*   **URL**: \`/parcels/me\`
*   **Method**: \`GET\`
*   **Description**: Retrieves all parcels created by the authenticated sender.
*   **Authentication**: Required (Sender)
*   **How it works**:
    1.  Authenticates the sender and extracts their \`userId\`.
    2.  Queries the database for parcels where \`senderId\` matches the authenticated user's ID.
    3.  Returns an array of parcel objects, populated with receiver details.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Sender's Parcels Retrieved",
      "data": [
        // Array of parcel objects
      ]
    }
    \`\`\`

#### 3. Cancel Parcel
*   **URL**: \`/parcels/cancel/:id\`
*   **Method**: \`PATCH\`
*   **Description**: Allows a sender to cancel their parcel if it has not yet been dispatched.
*   **Authentication**: Required (Sender)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the parcel to cancel.
*   **How it works**:
    1.  Authenticates the sender and verifies parcel ownership.
    2.  Checks the current status of the parcel.
    3.  If the status allows cancellation (i.e., \`Requested\` or \`Approved\`), updates the parcel \`status\` to \`Cancelled\` and adds a new status log entry.
    4.  Returns the updated parcel object.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Cancelled Successfully",
      "data": {
        // Updated parcel object with status "Cancelled"
      }
    }
    \`\`\`
*   **Error Response (400 BAD REQUEST)**:
    \`\`\`json
    {
      "success": false,
      "message": "Cannot cancel dispatched parcel",
      "err": { "statusCode": 400 }
    }
    \`\`\`

###  Parcel Management (Receiver)

These endpoints require a \`receiver\` JWT token.

#### 1. Get My Incoming Parcels
*   **URL**: \`/parcels/incoming\`
*   **Method**: \`GET\`
*   **Description**: Retrieves all parcels that are addressed to the authenticated receiver.
*   **Authentication**: Required (Receiver)
*   **How it works**:
    1.  Authenticates the receiver and extracts their \`userId\`.
    2.  Queries the database for parcels where \`receiverId\` matches the authenticated user's ID.
    3.  Returns an array of parcel objects, populated with sender details.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Incoming Parcels Retrieved",
      "data": [
        // Array of parcel objects
      ]
    }
    \`\`\`

#### 2. Confirm Parcel Delivery
*   **URL**: \`/parcels/confirm-delivery/:id\`
*   **Method**: \`PATCH\`
*   **Description**: Allows a receiver to confirm the delivery of a parcel. This is only possible if the parcel's current status is \`In Transit\`.
*   **Authentication**: Required (Receiver)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the parcel to confirm delivery for.
*   **How it works**:
    1.  Authenticates the receiver and verifies that the parcel is indeed addressed to them.
    2.  Checks if the parcel's current \`status\` is \`In Transit\`.
    3.  If conditions are met, updates the parcel \`status\` to \`Delivered\` and adds a new status log entry.
    4.  Returns the updated parcel object.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Delivery Confirmed",
      "data": {
        // Updated parcel object with status "Delivered"
      }
    }
    \`\`\`
*   **Error Response (400 BAD REQUEST)**:
    \`\`\`json
    {
      "success": false,
      "message": "Parcel must be in transit to confirm delivery",
      "err": { "statusCode": 400 }
    }
    \`\`\`

#### 3. Get My Delivery History
*   **URL**: \`/parcels/delivery-history\`
*   **Method**: \`GET\`
*   **Description**: Retrieves all parcels that have been successfully delivered to the authenticated receiver.
*   **Authentication**: Required (Receiver)
*   **How it works**:
    1.  Authenticates the receiver and extracts their \`userId\`.
    2.  Queries the database for parcels where \`receiverId\` matches the authenticated user's ID and \`status\` is \`Delivered\`.
    3.  Returns an array of delivered parcel objects, populated with sender details.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Delivery History Retrieved",
      "data": [
        // Array of delivered parcel objects
      ]
    }
    \`\`\`

###  Parcel Management (Admin)

These endpoints require an \`admin\` or \`super_admin\` JWT token.

#### 1. Get All Parcels
*   **URL**: \`/parcels/all\`
*   **Method**: \`GET\`
*   **Description**: Retrieves all parcels in the system. Supports optional query parameters for filtering and pagination.
*   **Authentication**: Required (Admin, Super Admin)
*   **Query Parameters (Optional)**:
    *   \`status\`: Filter by parcel status (e.g., \`?status=Requested\`)
    *   \`page\`: Page number for pagination (default: 1)
    *   \`limit\`: Number of items per page (default: 10)
    *   \`search\`: Search by \`trackingId\` (case-insensitive).
*   **How it works**:
    1.  Authenticates the request and verifies admin role.
    2.  Applies filters based on query parameters (\`status\`, \`search\`).
    3.  Applies pagination (\`page\`, \`limit\`).
    4.  Fetches all matching parcel records, populated with sender and receiver details.
    5.  Returns an array of parcel objects along with pagination metadata.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "All Parcels Retrieved",
      "data": [
        // Array of parcel objects
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 50,
        "pages": 5
      }
    }
    \`\`\`

#### 2. Update Parcel Status
*   **URL**: \`/parcels/status/:id\`
*   **Method**: \`PATCH\`
*   **Description**: Updates the status of a parcel. This endpoint enforces strict status transition rules.
*   **Authentication**: Required (Admin, Super Admin)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the parcel to update.
*   **Request Body**:
    \`\`\`json
    {
      "status": "Approved", // e.g., "Approved", "Dispatched", "In Transit", "Delivered", "Cancelled", "Returned"
      "location": "Dhaka Hub", // Optional: Current location of the parcel
      "note": "Parcel approved for delivery" // Optional: Any relevant notes
    }
    \`\`\`
*   **How it works**:
    1.  Authenticates the request and verifies admin role.
    2.  Finds the parcel by \`id\`.
    3.  Checks if the parcel is blocked (blocked parcels cannot have their status updated).
    4.  **Crucially, it validates the requested \`status\` change against predefined \`validTransitions\`**:
        *   \`Requested\` -> \`Approved\` or \`Cancelled\`
        *   \`Approved\` -> \`Dispatched\` or \`Cancelled\`
        *   \`Dispatched\` -> \`In Transit\` or \`Returned\`
        *   \`In Transit\` -> \`Delivered\` or \`Returned\`
        *   \`Delivered\`, \`Cancelled\` have no outgoing transitions (final states).
        *   \`Returned\` -> \`Requested\` (for re-delivery).
    5.  If the transition is valid, updates the parcel \`status\` and adds a new status log entry with \`updatedBy\` as the admin's ID.
    6.  Returns the updated parcel object.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Status Updated Successfully",
      "data": {
        // Updated parcel object with new status and status log
      }
    }
    \`\`\`
*   **Error Response (400 BAD REQUEST)**:
    \`\`\`json
    {
      "success": false,
      "message": "Cannot change status from Requested to In Transit",
      "err": { "statusCode": 400 }
    }
    \`\`\`

#### 3. Toggle Parcel Block Status
*   **URL**: \`/parcels/toggle-block/:id\`
*   **Method**: \`PATCH\`
*   **Description**: Blocks or unblocks a parcel. A blocked parcel cannot have its status updated.
*   **Authentication**: Required (Admin, Super Admin)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the parcel to block/unblock.
*   **How it works**:
    1.  Authenticates the request and verifies admin role.
    2.  Finds the parcel by \`id\`.
    3.  Toggles the \`isBlocked\` boolean field.
    4.  Adds a status log entry indicating the block/unblock action.
    5.  Returns the updated parcel object.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Blocked Successfully",
      "data": {
        // Updated parcel object with isBlocked: true/false
      }
    }
    \`\`\`

###  Shared Parcel Endpoints (Sender/Receiver/Admin)

These endpoints are accessible by \`sender\` (for their own parcels), \`receiver\` (for their incoming parcels), and \`admin\`/\`super_admin\` (for any parcel).

#### 1. Get Parcel Status Logs
*   **URL**: \`/parcels/:id/status-logs\`
*   **Method**: \`GET\`
*   **Description**: Retrieves the detailed status history (logs) for a specific parcel.
*   **Authentication**: Required (Sender, Receiver, Admin, Super Admin)
*   **Path Parameters**:
    *   \`id\`: The MongoDB \`_id\` of the parcel.
*   **How it works**:
    1.  Authenticates the user and extracts their \`userId\` and \`role\`.
    2.  Finds the parcel by \`id\`.
    3.  **Checks access permissions**:
        *   If the user is the \`sender\` of the parcel.
        *   If the user is the \`receiver\` of the parcel.
        *   If the user is an \`admin\` or \`super_admin\`.
    4.  If authorized, returns a structured object containing parcel details and a sorted list of all status log entries.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Status Logs Retrieved Successfully",
      "data": {
        "parcelId": "65c7d8e9f0a1b2c3d4e5f6a9",
        "trackingId": "TRK-20250801-123456",
        "currentStatus": "In Transit",
        "sender": { "_id": "...", "name": "...", "email": "...", "phone": "..." },
        "receiver": { "_id": "...", "name": "...", "email": "...", "phone": "..." },
        "statusLogs": [
          {
            "status": "In Transit",
            "location": "On the way to destination",
            "note": "Parcel is now in transit",
            "updatedBy": "65c7d8e9f0a1b2c3d4e5f6aa", // Admin ID
            "timestamp": "2025-08-01T12:30:00.000Z"
          },
          {
            "status": "Dispatched",
            "location": "Warehouse A",
            "note": "Parcel dispatched from warehouse",
            "updatedBy": "65c7d8e9f0a1b2c3d4e5f6aa",
            "timestamp": "2025-08-01T12:20:00.000Z"
          }
          // ... more logs
        ],
        "createdAt": "2025-08-01T12:00:00.000Z",
        "updatedAt": "2025-08-01T12:30:00.000Z"
      }
    }
    \`\`\`

###  Public Parcel Tracking

#### 1. Track Parcel by Tracking ID
*   **URL**: \`/parcels/track/:trackingId\`
*   **Method**: \`GET\`
*   **Description**: Allows anyone to track a parcel using its unique tracking ID without requiring any authentication.
*   **Authentication**: None
*   **Path Parameters**:
    *   \`trackingId\`: The unique tracking ID of the parcel (e.g., \`TRK-20250801-123456\`).
*   **How it works**:
    1.  Receives the \`trackingId\` from the URL.
    2.  Queries the database for a parcel matching the \`trackingId\`.
    3.  If found, returns public-facing parcel details including current status, type, weight, delivery date, and a simplified list of status logs. Sensitive information like full user emails are omitted.
    4.  If not found, returns a \`404 NOT FOUND\` error.
*   **Success Response (200 OK)**:
    \`\`\`json
    {
      "success": true,
      "statusCode": 200,
      "message": "Parcel Tracking Information Retrieved",
      "data": {
        "trackingId": "TRK-20250801-123456",
        "currentStatus": "In Transit",
        "type": "Document",
        "weight": 2.5,
        "deliveryDate": "2025-08-05T00:00:00.000Z",
        "sender": { "name": "Sender Name", "phone": "01XXXXXXXXX" },
        "receiver": { "name": "Receiver Name", "phone": "01XXXXXXXXX" },
        "statusLogs": [
          {
            "status": "In Transit",
            "location": "On the way to destination",
            "timestamp": "2025-08-01T12:30:00.000Z",
            "note": "Parcel is now in transit"
          },
          {
            "status": "Dispatched",
            "location": "Warehouse A",
            "timestamp": "2025-08-01T12:20:00.000Z",
            "note": "Parcel dispatched from warehouse"
          }
          // ... more logs
        ],
        "isBlocked": false
      }
    }
    \`\`\`
*   **Error Response (404 NOT FOUND)**:
    \`\`\`json
    {
      "success": false,
      "message": "Parcel not found with this tracking ID",
      "err": { "statusCode": 404 }
    }
    \`\`\`

##  Step-by-Step Usage Example: Parcel Creation to Delivery

This section demonstrates a typical flow of how a parcel moves through the system, involving different user roles.

### Scenario: Sender creates a parcel, Admin processes it, Receiver confirms delivery.

**Prerequisites**:
*   You have a running instance of the API.
*   You have registered at least one user for each role: \`sender\`, \`receiver\`, \`admin\`.
*   You have obtained JWT tokens for each of these users by logging them in via \`POST /api/v1/auth/login\`.

---

**Step 1: Register Users (if not already done)**

*   **Register Sender**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/register
    Content-Type: application/json

    {
      "name": "Sender User",
      "email": "sender@example.com",
      "password": "Password123!",
      "role": "sender"
    }
    \`\`\`
    *Copy the \`_id\` from the response for future use.*

*   **Register Receiver**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/register
    Content-Type: application/json

    {
      "name": "Receiver User",
      "email": "receiver@example.com",
      "password": "Password123!",
      "role": "receiver"
    }
    \`\`\`
    *Copy the \`_id\` from the response for future use (this will be your \`receiverId\`).*

*   **Register Admin**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/register
    Content-Type: application/json

    {
      "name": "Admin User",
      "email": "admin@example.com",
      "password": "Password123!",
      "role": "admin"
    }
    \`\`\`
    *Copy the \`_id\` from the response for future use.*

---

**Step 2: Login Users to get JWT Tokens**

*   **Login Sender**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/login
    Content-Type: application/json

    {
      "email": "sender@example.com",
      "password": "Password123!"
    }
    \`\`\`
    *Copy the \`accessToken\` from the response. This is your \`<SENDER_JWT_TOKEN>\`.*

*   **Login Receiver**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/login
    Content-Type: application/json

    {
      "email": "receiver@example.com",
      "password": "Password123!"
    }
    \`\`\`
    *Copy the \`accessToken\` from the response. This is your \`<RECEIVER_JWT_TOKEN>\`.*

*   **Login Admin**:
    \`\`\`http
    POST http://localhost:3000/api/v1/auth/login
    Content-Type: application/json

    {
      "email": "admin@example.com",
      "password": "Password123!"
    }
    \`\`\`
    *Copy the \`accessToken\` from the response. This is your \`<ADMIN_JWT_TOKEN>\`.*

---

**Step 3: Sender Creates a Parcel**

*   **Action**: Sender initiates a delivery request.
*   **Endpoint**: \`POST /api/v1/parcels\`
*   **Authorization**: \`Bearer <SENDER_JWT_TOKEN>\`
*   **Request Body**:
    \`\`\`json
    {
      "receiverId": "<RECEIVER_USER_ID_FROM_STEP_1>",
      "type": "Electronics",
      "weight": 1.5,
      "fee": 150,
      "deliveryDate": "2025-08-10T10:00:00.000Z"
    }
    \`\`\`
*   **Result**: Parcel is created with \`status: "Requested"\`.
    *Copy the \`_id\` of the created parcel from the response. This is your \`<PARCEL_ID>\`.*
    *Copy the \`trackingId\` as well. This is your \`<TRACKING_ID>\`.*

---

**Step 4: Admin Processes the Parcel (Status Transitions)**

*   **Action**: Admin updates the parcel status through its lifecycle.
*   **Endpoint**: \`PATCH /api/v1/parcels/status/:id\`
*   **Authorization**: \`Bearer <ADMIN_JWT_TOKEN>\`
*   **Path Parameter**: \`id\` = \`<PARCEL_ID>\`

    **4.1. Change Status to \`Approved\`**:
    \`\`\`http
    PATCH http://localhost:3000/api/v1/parcels/status/<PARCEL_ID>
    Authorization: Bearer <ADMIN_JWT_TOKEN>
    Content-Type: application/json

    {
      "status": "Approved",
      "note": "Parcel request approved."
    }
    \`\`\`
    *Result*: Parcel status becomes \`Approved\`.

    **4.2. Change Status to \`Dispatched\`**:
    \`\`\`http
    PATCH http://localhost:3000/api/v1/parcels/status/<PARCEL_ID>
    Authorization: Bearer <ADMIN_JWT_TOKEN>
    Content-Type: application/json

    {
      "status": "Dispatched",
      "location": "Warehouse A",
      "note": "Parcel left the origin warehouse."
    }
    \`\`\`
    *Result*: Parcel status becomes \`Dispatched\`.

    **4.3. Change Status to \`In Transit\`**:
    \`\`\`http
    PATCH http://localhost:3000/api/v1/parcels/status/<PARCEL_ID>
    Authorization: Bearer <ADMIN_JWT_TOKEN>
    Content-Type: application/json

    {
      "status": "In Transit",
      "location": "On the way to destination city.",
      "note": "Parcel is with the delivery agent."
    }
    \`\`\`
    *Result*: Parcel status becomes \`In Transit\`.

---

**Step 5: Receiver Confirms Delivery**

*   **Action**: Receiver confirms they have received the parcel.
*   **Endpoint**: \`PATCH /api/v1/parcels/confirm-delivery/:id\`
*   **Authorization**: \`Bearer <RECEIVER_JWT_TOKEN>\`
*   **Path Parameter**: \`id\` = \`<PARCEL_ID>\`
*   **Request Body**: \`{}\` (empty body)
*   **Result**: Parcel status becomes \`Delivered\`.

---

**Step 6: Track Parcel Status (Public or Authenticated)**

*   **Action**: Anyone can check the parcel's status.

    **6.1. Public Tracking (by Tracking ID)**:
    *   **Endpoint**: \`GET /api/v1/parcels/track/:trackingId\`
    *   **Authorization**: None
    *   **Path Parameter**: \`trackingId\` = \`<TRACKING_ID>\`
    *   **Result**: Returns current status and simplified logs.

    **6.2. Detailed Status Logs (by Parcel ID)**:
    *   **Endpoint**: \`GET /api/v1/parcels/:id/status-logs\`
    *   **Authorization**: \`Bearer <SENDER_JWT_TOKEN>\`, \`Bearer <RECEIVER_JWT_TOKEN>\`, or \`Bearer <ADMIN_JWT_TOKEN>\`
    *   **Path Parameter**: \`id\` = \`<PARCEL_ID>\`
    *   **Result**: Returns full parcel details including all status logs.


