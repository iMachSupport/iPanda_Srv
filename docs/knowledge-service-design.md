# Knowledge Service Design

## Purpose

Knowledge Service owns document ingestion and retrieval for future RAG workflows. Agent Runtime depends only on `KnowledgeServicePort`; it must not know about PostgreSQL, pgvector, chunking rules, embedding models, file parsing, or storage internals.

## Architecture

- `KnowledgeServicePort`: runtime-facing boundary for upload, processing, and retrieval.
- `KnowledgeIngestionService`: coordinates upload and processing.
- `DocumentProcessor`: extracts text from uploaded files.
- `ChunkingStrategy`: splits parsed text into retrievable chunks.
- `EmbeddingProviderPort`: converts text into vectors. Not implemented yet.
- `VectorStorePort`: persists and searches vectors in PostgreSQL with pgvector.
- `KnowledgeDocumentRepository`: stores document metadata and ingestion status.
- `IngestionJobRepository`: tracks ingestion lifecycle and failures.

## Storage

Target storage is PostgreSQL plus pgvector.

Suggested tables:

- `knowledge_documents`
- `knowledge_ingestion_jobs`
- `knowledge_chunks`
- `knowledge_vectors`

`knowledge_vectors.embedding` should use pgvector once migrations are introduced.

## Ingestion Flow

1. Client uploads or references a document through `uploadDocument`.
2. Knowledge Service stores document metadata in PostgreSQL.
3. Service creates an ingestion job.
4. Processing pipeline loads the document from `storageUri`.
5. A matching `DocumentProcessor` parses the document into text.
6. `ChunkingStrategy` splits text into ordered chunks.
7. Chunks are saved to PostgreSQL.
8. Embedding provider creates vectors for chunks.
9. `VectorStorePort.upsert` stores vectors in pgvector.
10. Document and job statuses are marked `indexed`.

## Retrieval Flow

1. Agent Runtime calls `KnowledgeServicePort.retrieve`.
2. Knowledge Service embeds the query through `EmbeddingProviderPort`.
3. `VectorStorePort.search` performs pgvector similarity search.
4. Results are mapped into `KnowledgeDocument` records.
5. Agent Runtime receives relevant chunks without knowing how retrieval happened.

## Current Non-Goals

- No embedding implementation.
- No PostgreSQL migrations yet.
- No actual file parsing implementation.
- No vector search implementation.
- No RAG prompting logic inside Knowledge Service.
