import { Card, CardActionArea, Box, Typography, Chip, Stack } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const ACCENT = "#1E293B";

export default function FolderCard({ folder, onOpen }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "rgba(15,23,42,0.10)",
        transition: "all 0.18s ease",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(15,23,42,0.10)",
          borderColor: ACCENT,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea onClick={() => onOpen(folder)} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: `${ACCENT}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <FolderOutlinedIcon sx={{ color: ACCENT, fontSize: 26 }} />
          </Box>
        </Stack>

        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "#0f172a", mb: 0.5 }}
          noWrap
        >
          {folder.name}
        </Typography>

        {folder.description && (
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              minHeight: 40,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {folder.description}
          </Typography>
        )}

        <Chip
          icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: `${ACCENT} !important` }} />}
          label={`${folder.file_count} file${folder.file_count === 1 ? "" : "s"}`}
          size="small"
          sx={{
            mt: 2,
            bgcolor: `${ACCENT}0D`,
            color: ACCENT,
            fontWeight: 600,
            fontSize: 12,
            border: `1px solid ${ACCENT}22`,
          }}
        />
      </CardActionArea>
    </Card>
  );
}