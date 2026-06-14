# iPanda Platform Architecture v1.0

## Executive Summary

iPanda is an enterprise AI coworker platform.

It is designed as a standalone backend platform that can be embedded into multiple enterprise applications through side panels, chat interfaces, browser extensions, mobile applications, and future integrations.

iPanda is not a chatbot.

iPanda is not a frontend application.

iPanda is an Agent Runtime Platform.

The primary responsibility of iPanda is to understand user intent, select business capabilities, execute actions through governed tools, and return business outcomes.

---

# Core Product Vision

Users should interact with enterprise systems using natural language instead of menus, transactions, or technical APIs.

Examples:

User:

Show my leave balance.

User:

Assign a laptop to Rahul.

User:

Create an IT support ticket.

User:

Show pending leave requests.

iPanda translates business intent into executable business actions.

---

# Architectural Principles

## Principle 1

iPanda is Backend Only.

Frontend experiences are consumers.

Examples:

* iMach360 Side Panel
* SAP Side Panel
* Teams Bot
* Mobile Application
* Browser Extension

---

## Principle 2

iPanda does not own business data.

Business systems remain systems of record.

Examples:

* iMach360
* SAP
* HRMS
* ITSM

---

## Principle 3

Tools represent business capabilities.

Not APIs.

Not database tables.

Not UI actions.

Examples:

Good:

* GetEmployeeProfile
* GetLeaveBalance
* CreateLeaveRequest
* AssignAsset

Bad:

* GET_EMPLOYEE_ENDPOINT
* POST_LEAVE_API

---

## Principle 4

Connectors own integrations.

Tools never communicate directly with external systems.

Architecture:

Tool
↓
Connector
↓
External System

---

## Principle 5

LLMs make decisions.

Runtime executes decisions.

The LLM never executes business actions directly.

---

# High Level Architecture

┌──────────────────────────────┐
│ Enterprise Frontends         │
├──────────────────────────────┤
│ iMach360 Side Panel          │
│ SAP Side Panel               │
│ Mobile Applications          │
│ Teams Bot                    │
│ Browser Extensions           │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ iPanda API Layer             │
├──────────────────────────────┤
│ Authentication               │
│ Authorization                │
│ Validation                   │
│ Context Processing           │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Agent Runtime                │
├──────────────────────────────┤
│ Request Context              │
│ Runtime Orchestration        │
│ Execution Tracking           │
│ Audit Events                 │
│ Response Generation          │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Planner                      │
├──────────────────────────────┤
│ Gemini Planning              │
│ Tool Selection               │
│ Workflow Selection           │
│ Confidence Scoring           │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Tool Registry                │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Tools                        │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Connector Layer              │
└──────────────┬───────────────┘
│
▼
┌──────────────────────────────┐
│ Business Systems             │
├──────────────────────────────┤
│ iMach360                     │
│ SAP                          │
│ Future Systems               │
└──────────────────────────────┘

---

# Request Lifecycle

User
↓
Frontend Side Panel
↓
iPanda API
↓
Authentication
↓
Context Construction
↓
Agent Runtime
↓
Planner
↓
Tool Selection
↓
Tool Execution
↓
Connector
↓
Business System
↓
Response
↓
Frontend

---

# Frontend Context Contract

Every frontend must send runtime context.

Example:

{
"application": "iMach360",
"module": "LeaveManagement",
"page": "Dashboard",
"entityId": "EMP001",
"tenantId": "tenant1",
"userId": "user1"
}

Purpose:

Provide runtime awareness.

Enable contextual tool selection.

Improve planner accuracy.

---

# Agent Runtime

The Agent Runtime is the heart of the platform.

Responsibilities:

* Manage execution lifecycle
* Maintain execution context
* Invoke planner
* Execute tools
* Track audit events
* Generate responses

The runtime must remain vendor agnostic.

The runtime must never contain business logic.

---

# Planner

Responsibilities:

* Understand user intent
* Select tools
* Select workflows
* Produce structured decisions

Current Provider:

* Gemini

Future Providers:

* OpenAI
* Claude
* Internal Models

Planner Output:

{
"tool": "GetLeaveBalance",
"confidence": 0.98,
"reasoning": "User requested leave balance"
}

---

# Tool Registry

Responsibilities:

* Tool Registration
* Tool Discovery
* Tool Metadata
* Tool Governance

The registry acts as the catalog of all business capabilities.

---

# Tool Domains

## Employee Management

* GetEmployeeProfile
* GetEmployeeList
* GetReportingManager

## Leave Management

* GetLeaveBalance
* CreateLeaveRequest
* GetPendingLeaveRequests
* ApproveLeaveRequest

## Asset Management

* GetAssignedAssets
* GetAvailableAssets
* AssignAsset

## IT Desk

* CreateSupportTicket
* GetTicketStatus

## Proposal Management

* CreateProposal
* GetProposalStatus

---

# Connector Layer

Purpose:

Abstract external systems.

Responsibilities:

* Authentication propagation
* API communication
* Data transformation
* Error normalization
* Retry handling

---

# iMach360 Connector

Purpose:

Expose iMach360 business capabilities.

Example Methods:

getEmployeeProfile()

getLeaveBalance()

createLeaveRequest()

getAssignedAssets()

createSupportTicket()

---

# SAP Connector

Purpose:

Expose SAP business capabilities.

Examples:

getEmployeeMasterData()

getTimesheets()

createPurchaseRequest()

approveWorkflow()

---

# Data Ownership

iPanda owns:

* Audit Logs
* Runtime Executions
* Tool Metadata
* Planner Decisions
* User Preferences

iPanda does not own:

* Employees
* Assets
* Leave Records
* SAP Data

Business systems remain authoritative.

---

# Hosting Strategy

MVP:

Frontend:

* iMach360

Backend:

* Vercel

Database:

* Supabase PostgreSQL

Storage:

* Supabase Storage

LLM:

* Gemini

---

# Core Backend Modules

src/modules

├── agent-runtime
├── planner
├── tool-registry
├── llm-provider
├── auth
├── connectors
│   ├── imach360
│   └── sap
├── workflows
├── audit
└── context

---

# Version 1 Scope

Required:

* Agent Runtime
* Gemini Planner
* Tool Registry
* iMach360 Connector
* Authentication
* Audit Events
* Context Processing

Deferred:

* Multi-Agent Architecture
* Advanced Memory
* RAG
* Workflow DSL
* Custom LLMs
* Kubernetes

---

# Success Metric

A user inside iMach360 can perform business actions through natural language without navigating application menus while all actions remain governed, auditable, secure, and executed through approved business systems.
