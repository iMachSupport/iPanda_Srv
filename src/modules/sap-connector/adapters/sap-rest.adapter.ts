import type { SapRestAdapter } from "../contracts/sap-adapter.contracts";

export abstract class SapRestHttpAdapter implements SapRestAdapter {
  public abstract execute: SapRestAdapter["execute"];
}
