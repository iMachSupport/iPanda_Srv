# SAP Connector Design

## Boundary Rule

Agent Runtime must never call SAP directly.

SAP communication must flow through `SapConnectorPort`. Runtime and tools may depend on the port, but they must not import OData clients, SAP SDKs, destination clients, auth strategies, or raw SAP endpoints.

## Layers

- `SapConnectorPort`: application-facing SAP capability contract.
- `SapODataAdapter`: low-level OData transport adapter.
- `SapRestAdapter`: low-level REST transport adapter.
- `SapDestinationAdapter`: SAP BTP Destination resolution boundary.
- `SapAuthStrategy`: pluggable authentication boundary.
- `SapConnectorError`: normalized connector error shape.

## Example Capability Methods

- `getLeaveBalance`
- `createLeaveRequest`
- `getEmployeeDetails`

These methods are designed as domain-level SAP operations. Their implementations can later map to OData entity sets, REST endpoints, or SAP BTP Destinations without changing Agent Runtime.

## Adapter Pattern

Domain methods on `SapConnectorPort` should delegate to protocol adapters:

1. Resolve destination through `SapDestinationAdapter`.
2. Select auth strategy through `SapAuthStrategyRegistry`.
3. Execute via `SapODataAdapter` or `SapRestAdapter`.
4. Map SAP payload into iPanda response contracts.
5. Throw `SapConnectorError` for all connector failures.

## Error Handling Strategy

The connector normalizes SAP failures into typed error codes:

- `SAP_DESTINATION_NOT_FOUND`
- `SAP_AUTHENTICATION_FAILED`
- `SAP_AUTH_STRATEGY_NOT_FOUND`
- `SAP_REQUEST_FAILED`
- `SAP_RESPONSE_MAPPING_FAILED`
- `SAP_OPERATION_NOT_IMPLEMENTED`

Raw SAP errors should stay inside the connector and be attached only as safe diagnostic metadata.

## Authentication Strategy

Authentication is strategy-based:

- `none`
- `basic`
- `bearer-token`
- `oauth2-client-credentials`
- `principal-propagation`

Future SAP BTP Destination support should resolve destination metadata first, then select the matching auth strategy.
