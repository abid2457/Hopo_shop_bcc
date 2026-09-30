## 1. Module Scaffolding

- [ ] 1.1 Scaffold the `returns` module (Controller, Service, Module) using NestJS CLI or manual creation.
- [ ] 1.2 Verify Prisma schema specifically for `Return` and `Refund` models to ensure relationships to `OrderItem` and `Payment` are robust. Add/update Prisma models if necessary.
- [ ] 1.3 Register `ReturnsModule` in the root `AppModule`.

## 2. Returns Management Implementation

- [ ] 2.1 Implement customer-facing DTOs and API endpoints in `ReturnsController` for initiating a return (e.g., `POST /returns`).
- [ ] 2.2 Implement `ReturnsService.createReturn` logic (validate order delivery status, return window, link to OrderItem, set status PENDING).
- [ ] 2.3 Implement admin-facing endpoints in `ReturnsController` for viewing and updating return statuses (e.g., `PATCH /admin/returns/:id/status`).
- [ ] 2.4 Implement `ReturnsService.updateStatus` logic to handle state transitions (PENDING -> APPROVED -> RECEIVED).

## 3. Inventory & Orders Integration

- [ ] 3.1 Update `InventoryService` with a method to restock inventory (`restockReturnedItem`).
- [ ] 3.2 Update `OrdersService` to listen for return completion and update the overall `OrderStatus` to `RETURNED` if all items in the order have been returned.
- [ ] 3.3 Wire `ReturnsService.updateStatus` to trigger the inventory restock method when a return is marked as `RECEIVED`.

## 4. Refund Processing Orchestration

- [ ] 4.1 Update `PaymentsService` to trigger the Razorpay refund using `initiateRefund` method based on `Return` updates.
- [ ] 4.2 Wire `ReturnsService` to automatically trigger the `PaymentsService.initiateRefund` once a return transitions to `RECEIVED`.
- [ ] 4.3 Add webhooks or status checks in `PaymentsService` to update the refund status from `INITIATED` to `COMPLETED`.

## 5. Testing and Validation

- [ ] 5.1 Write unit tests for `ReturnsService` covering valid and invalid return creation.
- [ ] 5.2 Write unit tests for the inventory restocking logic upon receiving a return.
- [ ] 5.3 Write unit tests for the refund triggering logic.
