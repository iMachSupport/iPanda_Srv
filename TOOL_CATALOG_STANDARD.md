# iPanda Tool Catalog Standard

## 1. Purpose

The iPanda Tool Catalog Standard is the official governance contract for every enterprise tool that can be discovered, selected, or executed by the iPanda Agent Runtime.

iPanda tools represent governed business capabilities, not simple function calls. A tool may read enterprise data, create business records, trigger workflows, request approvals, update operational systems, or coordinate with future specialist agents. For that reason, every tool must be registered with enough metadata for deterministic governance, auditability, tenant isolation, role-based access control, and safe agent planning.

This standard applies to tools backed by iMach360, SAP, HRMS, ITSM, document systems, approval platforms, reporting services, and future business systems.

## 2. Runtime Contract

The Tool Catalog is the canonical contract between:

- User-facing Agent Runtime
- Tool Registry
- Enterprise connectors
- Business systems such as iMach360, SAP, HRMS, and ITSM
- Future specialist agents and multi-agent orchestration services

The Agent Runtime must never call business systems directly. It must discover available capabilities through the Tool Registry, evaluate deterministic governance policy, execute through connectors, and preserve an audit trail for the full request lifecycle.

## 3. Tool Definition Template

Every tool definition must include the following sections.

```yaml
tool:
  metadata:
    toolId: "leave.get-balance.v1"
    toolName: "GetLeaveBalance"
    version: "1.0.0"
    domain: "Leave Management"
    category: "Read Tool"
    owner: "People Operations"
    lifecycleStatus: "active"

  businessContext:
    businessPurpose: "Allows an authorized employee or manager to retrieve leave balance."
    description: "Returns available leave balance for a user from the configured HR or leave system."
    businessCapability: "Employee leave balance lookup"
    relatedProcesses:
      - "Leave planning"
      - "Leave request creation"
      - "Manager leave review"

  securityModel:
    requiredRoles:
      - "employee"
      - "manager"
      - "hr_admin"
    requiredPermissions:
      - "leave.balance.read:self"
      - "leave.balance.read:team"
    tenantScope: "tenant"
    dataSensitivityClassification: "confidential"
    piiCategories:
      - "employee_id"
      - "leave_balance"

  agentExecutionRules:
    toolClassification: "Read Tool"
    riskClassification: "Low Risk"
    executionPolicy: "Auto Execute"
    canLlmAutoExecute: true
    requiresUserConfirmation: false
    requiresManagerApproval: false
    requiresHumanReview: false
    maximumExecutionFrequency: "10 requests per user per 15 minutes"

  inputContract:
    requiredFields:
      - name: "employeeId"
        type: "string"
        description: "Enterprise employee identifier."
    optionalFields:
      - name: "asOfDate"
        type: "date"
        description: "Date for which leave balance should be calculated."
    validationRules:
      - "employeeId must resolve to a user in the same tenant unless caller has delegated access."
      - "asOfDate must be a valid ISO 8601 date when supplied."

  outputContract:
    successSchema:
      status: "succeeded"
      fields:
        employeeId: "string"
        balanceDays: "number"
        leaveTypes: "array"
        sourceSystem: "string"
    errorSchema:
      status: "failed"
      fields:
        errorCode: "string"
        message: "string"
        retryable: "boolean"
        correlationId: "string"
    statusCodes:
      - code: "TOOL_SUCCEEDED"
        meaning: "The tool completed successfully."
      - code: "VALIDATION_FAILED"
        meaning: "The input contract was not satisfied."
      - code: "ACCESS_DENIED"
        meaning: "The caller is not authorized."
      - code: "CONNECTOR_UNAVAILABLE"
        meaning: "The source system or connector is unavailable."

  auditRequirements:
    auditEvents:
      - "tool.discovered"
      - "tool.selected"
      - "tool.policy_evaluated"
      - "tool.execution_started"
      - "tool.execution_completed"
      - "tool.execution_failed"
    loggedFields:
      - "tenantId"
      - "userId"
      - "sessionId"
      - "correlationId"
      - "toolId"
      - "toolName"
      - "version"
      - "inputSummary"
      - "outputStatus"
      - "riskClassification"
      - "executionPolicy"
      - "approvalReference"
      - "connectorName"
      - "sourceSystem"
    complianceConsiderations:
      - "Do not log raw secrets, access tokens, passwords, or full sensitive payloads."
      - "Mask or tokenize personal data when full values are not required for audit."
      - "Retain audit records according to tenant and regulatory retention policy."

  operationalRequirements:
    timeout: "10 seconds"
    retryPolicy:
      maxAttempts: 2
      retryableFailures:
        - "timeout"
        - "connector_transient_error"
        - "rate_limited"
    rateLimits:
      perUser: "10 requests per 15 minutes"
      perTenant: "500 requests per hour"
    dependencies:
      - "Tool Registry"
      - "HR connector"
      - "Leave management source system"

  connectorMapping:
    sourceSystem: "iMach360"
    apiEndpoint: "GET /api/leaves/user/:userId"
    authenticationType: "Bearer JWT or connector-managed service credential"
    connectorName: "iMach360LeaveConnector"
    connectorOperation: "getLeaveBalance"

  agentIntelligenceMetadata:
    toolDescriptionForLlm: "Use this tool when the user asks for their available leave balance or a manager asks for a direct report's leave balance."
    exampleUserQueries:
      - "How many leave days do I have left?"
      - "Show Rahul's leave balance."
      - "Can I take two days off next week?"
    toolSelectionKeywords:
      - "leave balance"
      - "vacation balance"
      - "days off remaining"
      - "available leave"
    toolSelectionConstraints:
      - "Do not use for creating a leave request."
      - "Do not use for approving or rejecting leave."
      - "Only retrieve another employee's balance when delegated permissions allow it."
```

## 4. Tool Classification Framework

Each tool must declare exactly one primary classification. Secondary tags may be added for discovery, but governance is based on the primary classification.

| Classification | Purpose | Typical Risk | Examples |
| --- | --- | --- | --- |
| Read Tool | Retrieves data without changing source systems. | Low to Medium | `GetEmployeeProfile`, `GetLeaveBalance`, `ListOpenTickets` |
| Create Tool | Creates a new business record or request. | Medium to High | `CreateLeaveRequest`, `CreateExpenseClaim`, `CreateITTicket` |
| Update Tool | Changes an existing business object. | Medium to High | `UpdateEmployeeAddress`, `UpdateTicketStatus`, `AssignAsset` |
| Delete Tool | Removes, cancels, or deactivates data. | High to Critical | `DeleteHoliday`, `CancelLeaveRequest`, `DeactivateUser` |
| Workflow Tool | Starts or advances a multi-step business process. | Medium to Critical | `SubmitExpenseForApproval`, `InitiateAssetReturn` |
| Approval Tool | Records an approval, rejection, or authorization decision. | High to Critical | `ApproveLeaveRequest`, `RejectExpenseClaim`, `ApproveAccessRequest` |
| Reporting Tool | Produces aggregate or analytical output. | Low to High | `GenerateLeaveReport`, `GetAssetUtilizationReport` |

## 5. Risk Classification Framework

Risk classification determines what execution policy the Agent Runtime may apply.

| Risk | Definition | Allowed Execution Policies | Examples |
| --- | --- | --- | --- |
| Low Risk | Read-only or low-impact action with limited data exposure and no business-state change. | Auto Execute, Confirmation Required | Read own leave balance, list own tickets |
| Medium Risk | Reads sensitive data or creates low-impact records that can be reviewed or reversed. | Confirmation Required, Approval Required | Create leave request, submit ticket, read team profile data |
| High Risk | Changes business state, affects another user, involves sensitive records, or triggers workflow obligations. | Approval Required, Manual Only | Assign asset, approve leave, update HR record |
| Critical Risk | Deletes records, changes identity/access, affects payroll/compliance, or performs irreversible operations. | Manual Only unless governance exception exists | Delete employee, deactivate user, approve privileged access |

Risk must be set conservatively. If a tool can operate in multiple modes, it must either be split into separate tools or use the highest applicable risk classification.

## 6. Execution Policy Framework

| Policy | Meaning | Runtime Requirements |
| --- | --- | --- |
| Auto Execute | Runtime may execute after deterministic authorization and policy checks. | Allowed only for approved low-risk scenarios with bounded data exposure. |
| Confirmation Required | Runtime must ask the user to confirm before execution. | Confirmation text must summarize the action, target, and expected business effect. |
| Approval Required | Runtime must obtain approval from a manager, owner, or configured approver before execution. | Approval reference must be logged before connector execution. |
| Manual Only | Runtime must not execute directly. It may guide the user or create a draft request for human handling. | Used for critical, irreversible, privileged, or legally sensitive operations. |

LLM intent detection may propose a policy path, but deterministic runtime policy must make the final execution decision.

## 7. Tool Naming Convention Standard

Tool names must use PascalCase with a clear verb-noun pattern.

### Approved Verb Families

| Verb | Use For | Examples |
| --- | --- | --- |
| Get | Retrieve a single object or computed value. | `GetEmployeeProfile`, `GetLeaveBalance` |
| List | Retrieve a collection. | `ListOpenTickets`, `ListAssignedAssets` |
| Search | Query across records using filters or text. | `SearchEmployees`, `SearchKnowledgeArticles` |
| Create | Create a new business object. | `CreateLeaveRequest`, `CreateExpenseClaim` |
| Update | Modify an existing object. | `UpdateTicketStatus`, `UpdateEmployeeAddress` |
| Assign | Allocate ownership or responsibility. | `AssignAsset`, `AssignTicketOwner` |
| Submit | Send a draft or record into workflow. | `SubmitExpenseClaim`, `SubmitFormResponse` |
| Approve | Approve a request or workflow step. | `ApproveLeaveRequest`, `ApproveAccessRequest` |
| Reject | Reject a request or workflow step. | `RejectLeaveRequest`, `RejectExpenseClaim` |
| Cancel | Cancel a pending item. | `CancelLeaveRequest`, `CancelAssetReturn` |
| Delete | Permanently remove a record. | `DeleteHoliday`, `DeleteDraftForm` |
| Generate | Produce a report or document. | `GenerateLeaveReport`, `GenerateProposalSummary` |

### Naming Rules

- Use PascalCase only.
- Start with an approved verb.
- Use business language, not connector or database language.
- Avoid ambiguous names such as `ProcessRequest`, `DoAction`, or `HandleTicket`.
- Do not encode tenant, environment, or implementation vendor in the tool name.
- Keep tool IDs stable even if display names or descriptions change.
- Version behavior through semantic versioning when the input contract, output contract, or business effect changes.

## 8. Domain Structure Standard

Tools must belong to a recognized domain. Domains organize ownership, authorization, reporting, and future multi-agent delegation.

| Domain | Description | Example Tools |
| --- | --- | --- |
| Employee Management | Employee profile, HR records, reporting lines, and employment lifecycle. | `GetEmployeeProfile`, `UpdateEmployeeManager`, `CreateEmployeeRecord` |
| Leave Management | Leave balance, leave requests, approval, holiday calendars. | `GetLeaveBalance`, `CreateLeaveRequest`, `ApproveLeaveRequest` |
| Asset Management | Asset inventory, assignment, return, and lifecycle tracking. | `ListAssignedAssets`, `AssignAsset`, `CompleteAssetReturn` |
| IT Desk | Tickets, incidents, service requests, and IT workflow. | `CreateITTicket`, `UpdateTicketStatus`, `AssignTicketOwner` |
| Proposal Management | Proposal creation, review, summaries, and approvals. | `GenerateProposalSummary`, `SubmitProposalForReview` |
| SAP Integration | SAP-backed enterprise operations exposed through governed connectors. | `GetSapPurchaseOrder`, `CreateSapServiceEntry` |
| iMach360 Integration | iMach360-backed HR, leave, asset, ticket, expense, file, and notification operations. | `CreateLeaveRequest`, `AssignAsset`, `GetPendingNotifications` |

New domains require architecture approval and must define owner, data classification defaults, applicable roles, and integration boundaries.

## 9. Governance Guidelines

Every tool must satisfy these rules before registration:

- Declare owner, domain, category, version, tenant scope, roles, permissions, risk classification, and execution policy.
- Declare whether LLM auto execution, user confirmation, manager approval, or human review is allowed or required.
- Use deterministic authorization checks. LLM output must never be the sole basis for authorization, approval, or tenant isolation.
- Use tenant-scoped access by default. Cross-tenant execution is prohibited unless explicitly approved by platform governance.
- Define input validation rules that prevent malformed, ambiguous, cross-tenant, or overbroad requests.
- Define output schemas that separate successful business results from operational and authorization failures.
- Log audit events for discovery, selection, policy evaluation, execution, approval, completion, and failure.
- Avoid logging secrets, credentials, full access tokens, raw file contents, or unnecessary personal data.
- Apply the most restrictive execution policy when risk, data sensitivity, or caller authority is uncertain.
- Treat create, update, delete, workflow, and approval tools as confirmation-required or approval-required unless a documented exception exists.
- Treat critical-risk tools as manual-only unless a named governance exception is approved and recorded.

## 10. Agent Runtime Integration Guidelines

The Agent Runtime must integrate with the Tool Catalog through governed discovery and deterministic execution control.

### Discovery

- Runtime discovers tools through the Tool Registry.
- Runtime must not bypass the registry to call SAP, iMach360, HRMS, ITSM, or other systems directly.
- Tool discovery must be tenant-aware and role-aware.
- Tools unavailable to the current tenant or user must not be exposed to the planner as executable options.

### Planning

- Planner may use `toolDescriptionForLlm`, example queries, keywords, and selection constraints to identify candidate tools.
- Planner must treat LLM tool choice as advisory.
- Runtime must evaluate policy deterministically before execution.
- When multiple tools match, prefer the lowest-risk tool that satisfies the user intent.

### Policy Evaluation

Before executing any tool, Runtime must evaluate:

- Tenant scope
- User identity
- User role
- Required permissions
- Data sensitivity classification
- Tool classification
- Risk classification
- Execution policy
- Confirmation requirement
- Approval requirement
- Human review requirement
- Maximum execution frequency
- Rate limits
- Connector availability

### Execution

- Runtime must pass only validated input to the Tool Registry.
- Tool Registry must execute through the declared connector mapping.
- Connector calls must use tenant-safe credentials and source-system authorization.
- Runtime must preserve correlation IDs from user request through connector execution.
- Runtime must return safe, business-readable responses without exposing internal stack traces, credentials, or unnecessary raw source payloads.

### Audit

Runtime must maintain an auditable trace containing:

- User request
- Selected tool candidates
- Final selected tool
- Policy evaluation result
- Confirmation or approval decision
- Connector operation
- Source system target
- Execution result
- Final response summary

Audit records must be sufficient to explain why a tool was selected, why it was allowed or blocked, who authorized it, what system was affected, and what result was returned.

### Multi-Agent Compatibility

Future specialist agents must treat tools as delegated governed capabilities. A specialist agent may receive a tool delegation only when:

- The user or calling agent has authority to delegate the requested action.
- The receiving agent is allowed to operate in the tool domain.
- The receiving agent can satisfy the same tenant, role, permission, risk, approval, and audit requirements.
- The delegation preserves original user identity, tenant context, correlation ID, and approval references.

Agent handoffs must not weaken governance. Delegated execution must be at least as restrictive as direct runtime execution.

## 11. Connector Mapping Guidelines

Connector mapping identifies the source system operation behind the governed tool.

For iMach360-backed tools, connector mappings should reference the existing API catalog as source operations. Examples include:

- `GET /api/hr/employee/:empId` for employee profile reads
- `POST /api/leaves` for leave request creation
- `PUT /api/leaves/:id` for leave approval or rejection
- `POST /api/assets/:id/assign` for asset assignment
- `POST /api/tickets` for IT ticket creation
- `GET /api/notifications/pending` for pending workflow items

For SAP-backed tools, connector mappings should reference SAP connector operations rather than exposing direct SAP implementation details to the Agent Runtime. SAP OData service names, destinations, authentication methods, and entity sets belong inside the connector layer.

## 12. Review And Approval Process

New tools must pass the following review gates before production registration:

1. Business owner approves purpose, process fit, and expected business effect.
2. Security owner approves roles, permissions, data sensitivity, and tenant scope.
3. Platform architect approves naming, domain, contracts, execution policy, and connector mapping.
4. Compliance or audit owner approves audit events, logged fields, and retention expectations for sensitive tools.
5. Operations owner approves timeout, retries, dependencies, and rate limits.

Any change to input contract, output contract, business effect, risk classification, or execution policy requires a version update and renewed approval.

## 13. Minimum Acceptance Checklist

A tool is catalog-ready only when all checklist items are complete:

- Tool has stable ID, name, owner, domain, category, and version.
- Business purpose and related process are clear.
- Roles, permissions, tenant scope, and data sensitivity are declared.
- Risk classification and execution policy are assigned.
- Confirmation, approval, and human review requirements are explicit.
- Input and output contracts are documented.
- Error schema and status codes are documented.
- Audit events and logged fields are documented.
- Timeout, retry policy, rate limits, and dependencies are documented.
- Source system, endpoint or operation, authentication type, and connector name are documented.
- LLM-facing description, example queries, keywords, and constraints are documented.
- Tool follows iPanda naming and domain standards.
- Tool can be enforced deterministically by Agent Runtime policy.

