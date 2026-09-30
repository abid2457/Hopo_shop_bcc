## ADDED Requirements

### Requirement: Refund Processing via Razorpay
The system SHALL orchestrate financial refunds via the Razorpay API for cancelled orders or received returns.

#### Scenario: Successful Refund Initiation
- **WHEN** a return is marked as `RECEIVED`
- **THEN** the system calls the Razorpay refund API for the item's amount and creates a `Refund` record with status `COMPLETED` upon success.
