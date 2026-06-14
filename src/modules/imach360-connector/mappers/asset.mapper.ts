import { iMach360ConnectorError } from "../errors/imach360-connector.error";
import type { iMach360Asset } from "../contracts/imach360-domain.types";

interface ApiAsset {
  _id?: string;
  id?: string;
  assetCode?: string;
  assetName?: string;
  name?: string;
  assetType?: string;
  type?: string;
  status?: string;
  assignedTo?: string | { _id?: string };
  assignedUser?: string | { name?: string; displayName?: string };
}

const validStatuses = new Set(["available", "assigned", "maintenance", "retired"]);

export const mapAsset = (raw: unknown): iMach360Asset => {
  const r = raw as ApiAsset;

  const id = r._id ?? r.id;
  const assetName = r.assetName ?? r.name;
  const assetType = r.assetType ?? r.type;

  if (!id || !r.assetCode || !assetName || !assetType) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Asset record from iMach360 is missing required fields.",
      502,
      { received: raw }
    );
  }

  const rawStatus = r.status ?? "available";
  const status = validStatuses.has(rawStatus)
    ? (rawStatus as iMach360Asset["status"])
    : "available";

  const assignedTo =
    typeof r.assignedTo === "object" && r.assignedTo !== null
      ? (r.assignedTo._id ?? undefined)
      : (r.assignedTo ?? undefined);

  const assignedUserName =
    typeof r.assignedUser === "object" && r.assignedUser !== null
      ? (r.assignedUser.displayName ?? r.assignedUser.name ?? undefined)
      : (r.assignedUser ?? undefined);

  return {
    id,
    assetCode: r.assetCode,
    assetName,
    assetType,
    status,
    assignedTo,
    assignedUserName
  };
};

export const mapAssetList = (raw: unknown): iMach360Asset[] => {
  if (!Array.isArray(raw)) {
    throw new iMach360ConnectorError(
      "IMACH360_RESPONSE_MAPPING_FAILED",
      "Expected an array of asset records from iMach360.",
      502,
      { receivedType: typeof raw }
    );
  }

  return raw.map(mapAsset);
};
