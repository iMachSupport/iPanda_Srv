import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import LaptopIcon from "@mui/icons-material/Laptop";
import type { CardRendererProps } from "../../../sdk/ipanda.types";

interface Asset {
  assetId?: string;
  assetTag?: string;
  assetName?: string;
  assetType?: string;
  status?: string;
  assignedDate?: string;
  condition?: string;
}

interface AssetsOutput {
  assets?: Asset[];
}

export const AssetCard: React.FC<CardRendererProps<AssetsOutput | Asset>> = ({ data }) => {
  const assets: Asset[] = "assets" in data && Array.isArray(data.assets)
    ? data.assets
    : [data as Asset];

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: "secondary.main",
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <LaptopIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Assigned Assets ({assets.length})
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {assets.map((asset, i) => (
          <Box
            key={asset.assetId ?? asset.assetTag ?? i}
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: i < assets.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {asset.assetName ?? asset.assetTag ?? "Asset"}
              </Typography>
              {asset.assetType && (
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {asset.assetType}
                  {asset.assignedDate ? ` · Since ${asset.assignedDate}` : ""}
                </Typography>
              )}
            </Box>
            {asset.status && (
              <Chip
                label={asset.status}
                size="small"
                color={asset.status === "Active" ? "success" : "default"}
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
