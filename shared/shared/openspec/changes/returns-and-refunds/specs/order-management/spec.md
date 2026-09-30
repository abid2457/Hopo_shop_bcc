## MODIFIED Requirements

### Requirement: Order Status Updates
The system SHALL track the lifecycle status of an order including post-delivery states.

#### Scenario: Order Item Returned
- **WHEN** all items in an order are successfully returned
- **THEN** the overall order status updates to `RETURNED`.
