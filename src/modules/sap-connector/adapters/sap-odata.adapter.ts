import type { SapODataAdapter } from "../contracts/sap-adapter.contracts";

export abstract class SapODataHttpAdapter implements SapODataAdapter {
  public abstract execute: SapODataAdapter["execute"];
}
