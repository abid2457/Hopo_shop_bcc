## MODIFIED Requirements

### Requirement: Inventory Replenishment
The system SHALL manage inventory counts based on order events, including returns.

#### Scenario: Return Received Replenishment
- **WHEN** a return is marked as `RECEIVED`
- **THEN** the inventory module increments the available quantity for that variant by the returned quantity.
