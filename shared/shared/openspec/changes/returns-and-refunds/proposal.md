## Why

To complete Phase 11 of the master architecture roadmap. While order creation, checkout, and inventory are implemented, there is currently no backend module for handling post-purchase lifecycle events such as customer return requests, return approval workflows, inventory restocking upon return, and the processing and tracking of refunds via the payment gateway (Razorpay). Implementing this is critical for a full-scale e-commerce platform.

## What Changes

- Implementation of the `returns` NestJS module (Controller, Service, DTOs).
- Implementation of the `refunds` functionality (currently partially stubbed in `payments.service.ts` but needs to be fully integrated with the Returns lifecycle).
- APIs for customers to request a return for specific order items.
- APIs for admins to approve/reject return requests.
- Workflow logic for scheduling pickups and updating return statuses (e.g., PENDING, APPROVED, PICKED_UP, RECEIVED).
- Automatic stock replenishment in the `inventory` module when a return is received.
- Triggering Razorpay refunds automatically upon return approval or receipt.

## Capabilities

### New Capabilities
- `returns-management`: Handles the lifecycle of a return request from customer initiation to admin approval and physical receipt.
- `refunds-processing`: Orchestrates the financial refund via Razorpay when an order is cancelled or a return is successfully processed.

### Modified Capabilities
- `order-management`: Must be updated to link returns to specific order items and reflect return statuses in the overall order status.
- `inventory-management`: Must be updated to restock items when a return is completed.

## Impact

- **Backend Modules**: `returns` (New), `payments` (Update), `orders` (Update), `inventory` (Update), `admin` (Update).
- **Database**: The Prisma schema already contains `Return` and `Refund` models, but we need to verify their exact structure and relationships.
- **Third-Party APIs**: High interaction with Razorpay API for initiating and verifying refunds.
