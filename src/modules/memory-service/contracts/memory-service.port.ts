export interface MemoryRecord {
  id: string;
  tenantId: string;
  userId: string;
  sessionId?: string;
  kind: "short-term" | "long-term";
  content: Record<string, unknown>;
  createdAt: Date;
}

export interface MemoryQuery {
  tenantId: string;
  userId: string;
  sessionId?: string;
  limit?: number;
}

export interface MemoryServicePort {
  search(query: MemoryQuery): Promise<MemoryRecord[]>;
  append(record: Omit<MemoryRecord, "id" | "createdAt">): Promise<MemoryRecord>;
}
