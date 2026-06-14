You are a Principal Software Architect.

We are building iPanda, an enterprise AI coworker platform for SAP ecosystems.

IMPORTANT:
iPanda is NOT a chatbot.
iPanda is an Agent Runtime Platform.

Architecture:

Client
 │
 ▼
API Gateway
 │
 ▼
Agent Runtime
 │
 ├── Memory Service
 ├── Knowledge Service
 ├── Tool Registry
 ├── SAP Connector
 └── LLM Provider

Tech Stack:

- Node.js
- TypeScript
- Express
- PostgreSQL
- Gemini API

Requirements:

1. Modular Monolith Architecture
2. Feature-based folder structure
3. Dependency injection ready
4. Enterprise-grade coding standards
5. Future support for SAP OData integrations
6. Future support for RAG
7. Future support for multi-agent architecture

Generate:
- Architecture document
- Folder structure
- Module boundaries
- API contracts
- Development roadmap

Do NOT write implementation code yet.