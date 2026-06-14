import type { SapDestinationAdapter } from "../contracts/sap-adapter.contracts";

export abstract class SapBtpDestinationAdapter implements SapDestinationAdapter {
  public abstract resolve: SapDestinationAdapter["resolve"];
}
