import { useEffect, useRef, useState, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
  Badge,
  CircularProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { fetchBannerImages, addBannerImage, deleteBannerImage } from "../api/bannerApi";
import { useDashboardEdit } from "../context/DashboardEditContext";
// ^ adjust this relative path to wherever you place DashboardEditContext.jsx

const ACCENT = "#1E293B";
const BANNER_HEIGHT = 180;
const BANNER_SLIDESHOW_INTERVAL_MS = 5000;
const MAX_UPLOAD_MB = 5;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export default function Topbar({
  onSearch,
  notifications = [],
  user,
  showBanner = false,
}) {
  const { editMode, adminPassword, requestEditToggle } = useDashboardEdit();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  

  const [confirmDeleteImg, setConfirmDeleteImg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  

  useEffect(() => {
    loadBanner();
  }, []);

  // Auto-advancing slideshow — only while not editing and not hovering/dragging
  useEffect(() => {
    if (editMode || images.length < 2) return;
    const interval = setInterval(() => {
      setActiveIdx((cur) => (cur + 1) % images.length);
    }, BANNER_SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [images, editMode]);

  async function loadBanner() {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await fetchBannerImages();
      setImages(Array.isArray(data) ? data : []);
      setActiveIdx(0);
    } catch (err) {
      setImages([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  function stepImage(delta) {
    if (images.length < 2) return;
    setActiveIdx((cur) => (cur + delta + images.length) % images.length);
  }

  function triggerUpload() {
    fileInputRef.current?.click();
  }

  function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showSnackbar("Please choose a PNG, JPEG, WEBP, or GIF image.", "error");
      return false;
    }
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_UPLOAD_MB) {
      showSnackbar(`Image is too large — max ${MAX_UPLOAD_MB}MB.`, "error");
      return false;
    }
    return true;
  }

  const uploadFile = useCallback(
    async (file) => {
      if (!file || !validateFile(file)) return;
      setUploading(true);
      try {
        await addBannerImage(file, adminPassword);
        await loadBanner();
        showSnackbar("Banner image added.");
      } catch (err) {
        showSnackbar(
          err?.message || "Banner image upload failed. Please try again.",
          "error"
        );
      } finally {
        setUploading(false);
      }
    },
    [adminPassword]
  );

  async function handleFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await uploadFile(file);
  }

  function handleDragOver(e) {
    if (!editMode) return;
    e.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDraggingOver(false);
  }

  async function handleDrop(e) {
    if (!editMode) return;
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  function requestDeleteImage(image) {
    setConfirmDeleteImg(image);
  }

  async function confirmDelete() {
    const image = confirmDeleteImg;
    if (!image) return;
    setDeletingId(image.id);
    setConfirmDeleteImg(null);
    try {
      await deleteBannerImage(image.id, adminPassword);
      await loadBanner();
      showSnackbar("Banner image removed.");
    } catch (err) {
      showSnackbar(err?.message || "Couldn't remove banner image.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  

  function handleBannerKeyDown(e) {
    if (images.length < 2) return;
    if (e.key === "ArrowLeft") stepImage(-1);
    if (e.key === "ArrowRight") stepImage(1);
  }

  const heroImage = images[activeIdx];
  

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} hidden onChange={handleFileChosen} />

      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "white", color: ACCENT, borderBottom: "1px solid #e5e7eb" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  }}
>
  <Typography
    sx={{
      fontSize: "1.45rem",
      fontWeight: 800,
      letterSpacing: "0.6px",
      background: "linear-gradient(90deg,#1B2A4A,#35598F)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      lineHeight: 1,
    }}
  >
    AI-Enabled Water Management Platform
  </Typography>

  <Typography
    sx={{
      fontSize: "0.75rem",
      color: "#5B6B84",
      letterSpacing: "2px",
      fontWeight: 600,
      mt: 0.5,
    }}
  >
    Water Monitoring & Analytics
  </Typography>
</Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
  <Button
    startIcon={editMode ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
    variant={editMode ? "contained" : "outlined"}
    onClick={requestEditToggle}
    sx={{
      borderRadius: "14px",
      px: 2.5,
      py: 0.8,
      textTransform: "none",
      fontWeight: 700,
      whiteSpace: "nowrap",
      transition: "0.25s",

      ...(editMode
        ? {
            bgcolor: "#1B2A4A",
            boxShadow: "0 8px 24px rgba(37,99,235,.35)",
            "&:hover": {
              bgcolor: "#15203A",
            },
          }
        : {
            borderColor: "#D7DEE9",
color: "#1B2A4A",
"&:hover": {
    borderColor: "#1B2A4A",
    bgcolor: "rgba(27,42,74,0.05)",
},
          }),
    }}
  >
    {editMode ? "Done Editing" : "Edit Dashboard"}
  </Button>

  <Avatar
  sx={{
    width: 42,
    height: 42,
    bgcolor: "#1B2A4A",
    fontWeight: 700,
    boxShadow: "0 6px 18px rgba(27,42,74,.28)",
  }}
>
  {user?.name?.charAt(0).toUpperCase()}
</Avatar>
</Box>
        </Toolbar>
      </AppBar>

      {showBanner && (
  <>
    {/* --- Banner --- */}
    {loading ? (
        <Box
          sx={{
            height: BANNER_HEIGHT,
            bgcolor: `${ACCENT}0D`,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={28} sx={{ color: `${ACCENT}66` }} />
        </Box>
      ) : (
        <Box
          tabIndex={0}
          onKeyDown={handleBannerKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            position: "relative",
            height: BANNER_HEIGHT,
            bgcolor: `${ACCENT}0D`,
            borderBottom: "1px solid #e5e7eb",
            outline: "none",
            "&:hover .banner-arrow": { opacity: 1 },
            ...(isDraggingOver && {
              boxShadow: `inset 0 0 0 2px ${ACCENT}`,
            }),
          }}
        >
          {heroImage ? (
            <Box
              component="img"
              src={heroImage.image_url}
              alt="Dashboard banner"
              sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: "100%", color: `${ACCENT}55` }}>
              <ImageOutlinedIcon sx={{ fontSize: 40 }} />
              <Typography variant="body2" sx={{ color: `${ACCENT}99` }}>
                {loadError
                  ? "Couldn't load banner images."
                  : editMode
                  ? "No banner images yet — add one below, or drag & drop here."
                  : "No banner image set."}
              </Typography>
              {loadError && (
                <Button size="small" onClick={loadBanner} sx={{ color: ACCENT }}>
                  Retry
                </Button>
              )}
            </Stack>
          )}

          {uploading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(15,23,42,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={28} sx={{ color: "#fff" }} />
            </Box>
          )}

          {isDraggingOver && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(30,41,59,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                pointerEvents: "none",
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Drop image to upload
              </Typography>
            </Box>
          )}

          {images.length > 1 && (
            <>
              <IconButton
                className="banner-arrow"
                size="small"
                onClick={() => stepImage(-1)}
                aria-label="Previous banner image"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.85)",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton
                className="banner-arrow"
                size="small"
                onClick={() => stepImage(1)}
                aria-label="Next banner image"
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.85)",
                  opacity: 0,
                  transition: "opacity 0.15s ease",
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}
              >
                {images.map((img, idx) => (
                  <Box
                    key={img.id}
                    onClick={() => setActiveIdx(idx)}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      cursor: "pointer",
                      bgcolor: idx === activeIdx ? "#fff" : "rgba(255,255,255,0.5)",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                      transition: "background-color 0.15s ease",
                    }}
                  />
                ))}
              </Stack>
            </>
          )}

          {/* --- manage banner images — edit mode only --- */}
          {editMode && (
            <Fade in>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: "rgba(15,23,42,0.55)",
                  backdropFilter: "blur(2px)",
                  px: 2,
                  py: 1,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
                  {images.map((img, idx) => (
                    <Box key={img.id} sx={{ position: "relative", flexShrink: 0 }}>
                      <Box
                        component="img"
                        src={img.image_url}
                        alt=""
                        onClick={() => setActiveIdx(idx)}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1.5,
                          objectFit: "cover",
                          cursor: "pointer",
                          border: idx === activeIdx ? "2px solid #fff" : "2px solid transparent",
                          opacity: deletingId === img.id ? 0.4 : 1,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => requestDeleteImage(img)}
                        disabled={deletingId === img.id}
                        aria-label="Remove banner image"
                        sx={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          width: 18,
                          height: 18,
                          "&:hover": { bgcolor: "error.light" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 10 }} />
                      </IconButton>
                    </Box>
                  ))}

                  <Tooltip title={`Add banner image (max ${MAX_UPLOAD_MB}MB)`}>
                    <span>
                      <Button
                        onClick={triggerUpload}
                        disabled={uploading}
                        variant="outlined"
                        sx={{
                          width: 56,
                          height: 56,
                          minWidth: 56,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          borderStyle: "dashed",
                          borderColor: "rgba(255,255,255,0.6)",
                          color: "#fff",
                          "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        {uploading ? (
                          <CircularProgress size={18} sx={{ color: "#fff" }} />
                        ) : (
                          <AddPhotoAlternateOutlinedIcon fontSize="small" />
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            </Fade>
          )}
               </Box>
      )}
  </>
)}

      <Dialog open={Boolean(confirmDeleteImg)} onClose={() => setConfirmDeleteImg(null)}>
        <DialogTitle>Remove banner image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove this image from the banner rotation.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteImg(null)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={<CloseIcon fontSize="small" />}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}