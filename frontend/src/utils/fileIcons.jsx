import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const RULES = [
  { exts: ["json"], Icon: DataObjectOutlinedIcon, color: "#c9a227" },
  { exts: ["exe", "msi"], Icon: TerminalOutlinedIcon, color: "#5b6b8c" },
  { exts: ["qgz", "qgs"], Icon: MapOutlinedIcon, color: "#2e7d5b" },
  { exts: ["zip", "rar", "7z"], Icon: FolderZipOutlinedIcon, color: "#8a6d3b" },
  { exts: ["png", "jpg", "jpeg", "gif", "svg"], Icon: ImageOutlinedIcon, color: "#6a5acd" },
  { exts: ["pdf"], Icon: PictureAsPdfOutlinedIcon, color: "#b3382c" },
  { exts: ["txt", "md", "doc", "docx"], Icon: DescriptionOutlinedIcon, color: "#3f6f9e" },
];

export function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const match = RULES.find((rule) => rule.exts.includes(ext));
  return match || { Icon: InsertDriveFileOutlinedIcon, color: "#8b8b8b" };
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}