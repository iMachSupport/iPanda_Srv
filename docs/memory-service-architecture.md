# Memory Service Architecture Specification

## 1. Purpose & Scope

The **Memory Service** is the state preservation layer for the iPanda Agent Runtime. It maintains continuity across conversations, sessions, and individual user contexts. Unlike stateless LLM calls, the Memory Service provides the Agent Runtime with temporal context, user preference state, and transaction histories.

The architecture supports three distinct levels of memory:
1. **Session Memory**: Transient, fast-access variables and tokens associated with the active run.
2. **Conversation History**: Ephemeral, sequential message logs mapping user prompts, tool outputs, and LLM responses within a single discussion thread.
3. **User Memory**: Persistent long-term semantic records representing user preferences, behavior profiles, and learned constraints across multiple sessions.

---

## 2. Ports and Contracts

The Memory Service interface represents the architectural boundary through which the Agent Runtime interacts with state persistence layers.

```typescript
export type MemoryKind = "session" | "conversation" | "user-preference" | "user-semantic";

export interface MemoryMetadata {
  tenantId: string;
  userId: string;
  sessionId?: string;
  correlationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationTurn {
  turnId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCallId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface SessionMemoryState {
  sessionId: string;
  variables: Record<string, unknown>;
  activeStepId?: string;
  lockedUntil?: Date;
  metadata: MemoryMetadata;
}

export interface UserPreferenceState {
  userId: string;
  preferences: Record<string, unknown>;
  metadata: MemoryMetadata;
}

export interface SemanticMemoryNode {
  nodeId: string;
  content: string;
  embeddingId?: string;
  confidenceScore: number;
  importanceRating: number; // Scale 1-10
  lastAccessedAt: Date;
  metadata: MemoryMetadata;
}

export interface MemoryServicePort {
  // Session Memory Operations
  createSession(tenantId: string, userId: string, sessionId: string): Promise<SessionMemoryState>;
  getSession(tenantId: string, sessionId: string): Promise<SessionMemoryState | null>;
  updateSessionVariables(tenantId: string, sessionId: string, variables: Record<string, unknown>): Promise<SessionMemoryState>;
  closeSession(tenantId: string, sessionId: string): Promise<void>;

  // Conversation History Operations
  appendConversationTurn(tenantId: string, sessionId: string, turn: Omit<ConversationTurn, "turnId" | "timestamp">): Promise<ConversationTurn>;
  getConversationHistory(tenantId: string, sessionId: string, limit?: number): Promise<ConversationTurn[]>;

  // User Memory Operations
  getUserPreferences(tenantId: string, userId: string): Promise<UserPreferenceState>;
  updateUserPreferences(tenantId: string, userId: string, preferences: Record<string, unknown>): Promise<UserPreferenceState>;
  
  // Semantic Long-Term Memory Operations
  rememberSemanticNode(tenantId: string, userId: string, content: string, importance: number): Promise<SemanticMemoryNode>;
  forgetSemanticNode(tenantId: string, nodeId: string): Promise<void>;
  searchSemanticMemory(tenantId: string, userId: string, queryVector: number[], limit?: number): Promise<SemanticMemoryNode[]>;
}
```

---

## 3. Storage Model

To balance low latency and robust analytical auditability, the Memory Service utilizes a hybrid storage architecture:

```
                  ┌─────────────────────────────────────┐
                  │        Agent Runtime Engine         │
                  └──────────────────┬──────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
┌────────────────────────┐                        ┌───────────────────────┐
│     In-Memory Cache    │                        │  Relational Database  │
│ (Redis / Memory-Store) │                        │ (PostgreSQL / RDBMS)  │
├────────────────────────┤                        ├───────────────────────┤
│ • Session Variables    │                        │ • Conversation History│
│ • Active Lock Tokens   │                        │ • User Preferences    │
│ • Recent Message Turns │                        │ • Semantic Node Meta  │
└────────────────────────┘                        └───────────────────────┘
```

### Database Tables (PostgreSQL Schema)

#### 1. `session_memory`
Stores high-performance runtime tokens and transactional session states.
* `session_id` (UUID, Primary Key)
* `tenant_id` (VARCHAR, Indexed)
* `user_id` (VARCHAR, Indexed)
* `variables` (JSONB) - Holds context variables.
* `created_at` (TIMESTAMP)
* `updated_at` (TIMESTAMP)

#### 2. `conversation_turns`
Maintains step-by-step logs of message flows.
* `turn_id` (UUID, Primary Key)
* `session_id` (UUID, Foreign Key referencing `session_memory.session_id`, Indexed)
* `tenant_id` (VARCHAR, Indexed)
* `role` (VARCHAR) - Enumerated: "user", "assistant", "system", "tool".
* `content` (TEXT)
* `tool_call_id` (VARCHAR, Nullable)
* `metadata` (JSONB) - Token count, prompt configurations.
* `created_at` (TIMESTAMP, Indexed)

#### 3. `user_preferences`
Contains static configuration toggles and preferences.
* `user_id` (VARCHAR, Primary Key)
* `tenant_id` (VARCHAR, Indexed)
* `preferences` (JSONB)
* `updated_at` (TIMESTAMP)

#### 4. `semantic_memory_nodes`
Maintains long-term, vector-searchable user memories.
* `node_id` (UUID, Primary Key)
* `user_id` (VARCHAR, Indexed)
* `tenant_id` (VARCHAR, Indexed)
* `content` (TEXT)
* `embedding` (VECTOR(1536)) - Target dimension for embedding vector model.
* `importance_rating` (SMALLINT)
* `last_accessed_at` (TIMESTAMP)
* `created_at` (TIMESTAMP)

---

## 4. Retrieval Model

Retrieving memories during an agent execution cycle must happen within a sub-50ms window. The retrieval pipeline leverages a hierarchical fetching framework:

```
[Request Received]
        │
        ├──► 1. Load active Session Variables (Direct Key Lookup in Redis Cache)
        │
        ├──► 2. Fetch recent N Conversation Turns (Sequential query sorted by timestamp ASC)
        │
        ├──► 3. Fetch User Preference variables (Direct Key Lookup)
        │
        └──► 4. Query Semantic long-term nodes:
                  ├── Generate embedding of the user request
                  ├── Run pgvector Cosine Distance lookup on user's semantic nodes
                  └── Filter nodes where threshold score > 0.75
```

### Context Aggregation Weighting
When assembling the LLM context, memories are consolidated into a prompt instruction framework using the following priorities:
1. **Active Context (Dynamic variables)**: Preempts all other parameters.
2. **Temporal Window (Last 5 turns)**: Injected directly to preserve the flow of conversation.
3. **Semantic Nodes**: Placed in system instructions as "Things you know about this user:" filtered by importance and relevance.

---

## 5. Retention Strategy

Enterprise deployments dictate strict governance over memory duration to ensure regulatory compliance and resource efficiency.

```
       Session Timeout         Conversation Archival        Long-Term Pruning
 ┌─────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────────┐
 │   Redis Cache (T+2h)    │ │   PostgreSQL (T+90d)   │ │  Semantic Nodes (T+1y)  │
 ├─────────────────────────┤ ├────────────────────────┤ ├─────────────────────────┤
 │ Idle sessions evicted   │ │ Messages archived to   │ │ Unused/low-importance   │
 │ from memory storage.    │ │ warm storage.          │ │ memories pruned.        │
 └─────────────────────────┘ └────────────────────────┘ └─────────────────────────┘
```

### Retention Policies

| Memory Tier | Maximum Idle Age | Storage Class | Pruning Mechanism |
| :--- | :--- | :--- | :--- |
| **Session State** | 2 Hours | In-Memory (Redis) | Automatic TTL Expiry |
| **Active Chat Logs** | 90 Days | Relational (PostgreSQL) | Cron job archiver to Cold Store |
| **Archived Logs** | 7 Years | Cold Storage (JSON dump) | Hard delete after policy limit |
| **Semantic Nodes** | 1 Year (Unaccessed) | Vector DB (pgvector) | Pruned if relevance score remains low |

### Regulatory & Privacy Compliance
- **Right to be Forgotten**: Upon receipt of a user deletion request, the Memory Service executes cascading hard deletes on `user_preferences`, `semantic_memory_nodes`, and references in `session_memory`.
- **Tenant Isolation**: Database partitioning ensures that under no circumstances can queries target memories belonging to a different `tenant_id`.
