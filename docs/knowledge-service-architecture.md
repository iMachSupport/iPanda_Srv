# Knowledge Service Architecture Specification

## 1. Purpose & Scope

The **Knowledge Service** manages the indexing, semantic search, and lifecycle of corporate knowledge sources. It provides Retrieval-Augmented Generation (RAG) capabilities to the iPanda Agent Runtime. It abstracts vector databases, document parsers, and embedding generators behind a uniform service boundary.

The architecture is built to ingest and retrieve three primary corporate categories:
1. **Policy Documents**: Text-heavy corporate policy files (HR manuals, regulatory guidelines, internal compliance standards).
2. **SAP Documentation**: SAP architecture manuals, OData service catalogs, and schema documentation.
3. **iMach360 Documentation**: System API catalogues, Mongoose models, and route references (e.g., leaves, assets, resources, expenses, forms, tickets, notifications, and files routes).

---

## 2. Document Lifecycle

Documents pass through a managed ingestion pipeline, transitioning from raw bytes to vector-indexed nodes.

```
       [Upload]                 [Parse]                 [Chunk]                [Index]
 ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
 │ Raw PDF/Docx/MD  ├───►│ Extracted Text   ├───►│ Semantic Paragraph├──►│ Embedded Vectors  │
 │ in Blob Storage  │    │ + Metadata Schema│    │ & Code Blocks    │    │ in pgvector Store│
 └──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Ingestion Lifecycle States
1. **UPLOADED**: File is saved in secure tenant-isolated object storage. A record in `knowledge_documents` is created with state `uploaded`.
2. **QUEUED**: Ingestion event is dispatched to a background processing queue.
3. **PROCESSING**: The document extractor resolves the file format, extracts raw text, sanitizes character encodings, and collects layout structures.
4. **PROCESSED**: The raw text has been partitioned into discrete semantic chunks.
5. **INDEXED**: Vector representations of all chunks have been generated and committed to the vector database.
6. **FAILED**: If failures occur at any stage, details are logged in the `ingestion_jobs` tracker, and the state transitions to `failed`.

### Update & Deletion Synchronization
- **Updates**: When a document is modified, it undergoes a transaction-protected pipeline: a new set of chunks and embeddings are created, the database updates the pointers, and stale chunks are purged to prevent search pollution.
- **Deletions**: Soft deletes mark the document as disabled instantly (excluding it from retrieval loops), followed by an asynchronous hard delete of all chunks and vectors.

---

## 3. Chunking Strategy

Standard character-count splitting destroys structured text (like tables, code, and API paths). The Knowledge Service applies a **Context-Aware Semantic Chunking** strategy tailored to each documentation category:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Document Classification                         │
└───────────────┬───────────────────────┬────────────────────────┬───────┘
                ▼                       ▼                        ▼
      ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────┐
      │ Policy Documents │    │ SAP Manuals/Logs │    │  iMach360 Catalog  │
      └────────┬─────────┘    └────────┬─────────┘    └──────────┬─────────┘
               ▼                       ▼                         ▼
      ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────┐
      │  Text-Based by   │    │  Section-Based   │    │   Entity-Based     │
      │ Heading & Para   │    │   by Schema /    │    │ (Full Route Block/ │
      │   (Overlap)      │    │  OData Entity    │    │  Mongoose Model)   │
      └──────────────────┘    └──────────────────┘    └────────────────────┘
```

### Chunking Framework Configurations

| Document Category | primary Delimiter | Target Chunk Size | Overlap Size | Metadata Injected into Chunk |
| :--- | :--- | :--- | :--- | :--- |
| **Policy Documents** | Markdown Headings (`#`, `##`), Paragraph double newlines | 500 Tokens | 50 Tokens | Document Title, Section Path, Scope |
| **SAP Documentation** | XML/JSON schemas boundaries, OData Entity sets | Complete Entity Block | 0 Tokens | Entity Name, Service Namespace, Operations |
| **iMach360 API Catalog** | Route groups, Mongoose model definitions | Complete Route Block (e.g. all `/api/leaves` actions) | 0 Tokens | Endpoint path, Controller files, DB models |

---

## 4. Embedding Strategy

Vector generation converts logical document chunks into dense representations suitable for semantic distance matches.

* **Target Embedding Model**: Google Gemini Embeddings API (`text-embedding-004`).
* **Vector Dimensions**: 1536 dimensions.
* **Distance Metric**: Cosine Similarity.
* **Normalization**: All vectors are unit-normalized upon creation. This optimizes queries as cosine similarity simplifies to a fast vector dot product computation:
  $$\text{Similarity}(A, B) = A \cdot B$$

---

## 5. Retrieval Strategy

The Knowledge Service uses a **Hybrid Search Pipeline** to balance high-precision keyword queries (e.g., searching for `/api/leaves/user/:userId`) and abstract conceptual queries (e.g., "how do I apply for annual leave?").

```
             [User Query]
                  │
         ┌────────┴────────┐
         ▼                 ▼
  ┌─────────────┐   ┌─────────────┐
  │ Vector search│   │ Full-Text   │
  │ (Semantic/  │   │   Search    │
  │ Cosine Sim) │   │ (BM25 Match)│
  └──────┬──────┘   └──────┬──────┘
         │                 │
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │ Reciprocal Rank │
         │   Fusion (RRF)  │
         └────────┬────────┘
                  ▼
         ┌─────────────────┐
         │ Access Control  │
         │   ACL Filters   │
         └────────┬────────┘
                  ▼
          [Context Chunks]
```

### Reciprocal Rank Fusion (RRF)
Search results from semantic vector query and full-text index matched queries are merged using Reciprocal Rank Fusion:
$$RRF\_Score(d \in D) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
*Where $M$ represents the search methods (semantic & text), $r_m(d)$ is the rank of document $d$ in search method $m$, and $k$ is a constant (default: 60).*

### Context Window Injection Rules
- **Maximum Retrieval Limit**: Evaluated at 15% of the LLM target context token window (e.g. max 12,000 tokens for standard Gemini prompts) to avoid prompt bloat.
- **Reranking**: A lightweight Cross-Encoder model reranks the top 20 candidate chunks down to the top 5 most relevant results prior to LLM assembly.

---

## 6. Access Control Strategy

To prevent prompt injection vulnerability or data leakages in multi-tenant corporate configurations, the Knowledge Service implements a **Pre-Retrieval Access Control Filter**.

```
                           [Search Request]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
        Tenant Partitioning               Role-Based Filtering
     ┌───────────────────────┐         ┌────────────────────────┐
     │ Append tenant_id = X  │         │ Matches user_roles to  │
     │ filter directly to    │         │ document metadata ACLs │
     │ pgvector SQL queries. │         │ (e.g. hr-admin, staff) │
     └───────────────────────┘         └────────────────────────┘
```

### Access Control List (ACL) Attributes
Every chunk carries inherited security metadata from its parent document:
- `owner_tenant_id`: Mandatory tenant separator.
- `allowed_roles`: List of groups authorized to read the document (e.g. `["staff", "manager", "hr-admin"]`).
- `classification_level`: Confidentiality tier (`"public"`, `"internal"`, `"restricted"`, `"confidential"`).

### Filtering Policy Rules
1. **Strict Partitioning**: The execution engine appends the `tenantId` parameter from the verified `AuthContext` to all SQL vectors where-clauses.
2. **Access Gatekeeping**: Chunks are excluded from the candidate search list before similarity queries run if the user's role array (`roles`) does not contain at least one value within the document's `allowed_roles` registry.
3. **Confidentiality Check**: If a document is flagged `"confidential"`, it requires explicit user validation mapping (e.g., manager approval workflow reference) before the context builder injects its chunks into the runtime pipeline.
