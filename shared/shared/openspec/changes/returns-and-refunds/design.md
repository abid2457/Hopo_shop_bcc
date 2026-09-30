## Context

The Hopo Shop E-Commerce backend has most core modules (auth, products, cart, orders, inventory, payments, admin) implemented. However, Phase 11 of the master architecture ("Returns & Refunds") is missing. We need a robust mechanism for customers to initiate return requests for specific order items, for admins to approve and process those returns, and to handle the subsequent refunds via Razorpay and inventory restocking.

## Goals / Non-Goals

**Goals:**
- Implement a `returns` module in NestJS for managing the lifecycle of return requests.
- Integrate returns with the `orders` module to update order status to `RETURNED`.
- Automate inventory restocking upon successful return processing.
- Orchestrate Razorpay refunds through the `payments` module when a return is approved/received or an order is cancelled.

**Non-Goals:**
- Handling physical logistics (e.g., integrating with a 3rd party shipping provider API for pickups), except for maintaining the status locally.
- Complex partial refunds with split payments (we will handle basic full item refunds).

## Decisions

- **Return vs OrderItem granularity**: A return request should be tied to an `OrderItem`, not the entire `Order`. A single order might have multiple items, and a customer might only want to return one of them.
- **Razorpay Refund Orchestration**: The `initiateRefund` method exists in `payments.service.ts` but needs to be triggered reliably when the Return status transitions to `APPROVED` or `RECEIVED` (depending on business rules).
- **Inventory Replenishment**: Restocking should happen *only* when the physical item is marked as `RECEIVED` in the return lifecycle, not when the return is merely `APPROVED`.

## Risks / Trade-offs

- [Risk] Double refunds if a return request is processed multiple times. → Mitigation: Ensure idempotent refund logic in the `payments` module and strict status gating in the `returns` module.
- [Risk] Out-of-sync inventory if return fails. → Mitigation: Use Prisma transactions when updating return status and inventory.
