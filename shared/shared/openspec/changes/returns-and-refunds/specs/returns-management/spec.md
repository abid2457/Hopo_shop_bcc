## ADDED Requirements

### Requirement: Customer Return Initiation
The system SHALL allow customers to initiate a return request for eligible order items that have been delivered.

#### Scenario: Valid Return Request
- **WHEN** a customer submits a return request for an item from a `DELIVERED` order within the return window
- **THEN** the system creates a `Return` record with status `PENDING` and links it to the `OrderItem`.

### Requirement: Admin Return Approval
The system SHALL allow admins to approve or reject pending return requests.

#### Scenario: Admin Approves Return
- **WHEN** an admin approves a `PENDING` return
- **THEN** the return status updates to `APPROVED` and a pickup is scheduled.

### Requirement: Item Receipt and Restocking
The system SHALL track when a returned item is physically received back at the warehouse.

#### Scenario: Item Received
- **WHEN** an admin marks an `APPROVED` return as `RECEIVED`
- **THEN** the system triggers inventory restocking and refund processing.
