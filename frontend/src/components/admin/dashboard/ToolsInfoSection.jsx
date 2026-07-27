import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TerrainOutlinedIcon from "@mui/icons-material/TerrainOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

import {
  fetchToolCards,
  createToolCard,
  updateToolCard,
  deleteToolCard,
  addToolCardImage,
  deleteToolCardImage,
  verifyAdminPassword,
} from "../../../api/toolCardApi";
// ^ adjust this relative path to wherever you place toolCardApi.js

const ACCENT = "#1E293B";
const SLIDESHOW_INTERVAL_MS = 4000;

// --- fixed image height so switching photos never shifts card size ---
const IMAGE_HEIGHT = 220;
const DESCRIPTION_CLAMP_CHARS = 150; // rough threshold for when a 3-line clamp will truncate

const ICON_MAP = {
  terrain: TerrainOutlinedIcon,
  water_drop: WaterDropOutlinedIcon,
  map: MapOutlinedIcon,
};

const EMPTY_FORM = { id: null, title: "", description: "" };

export default function ToolsInfoSection() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pendingUploadCardId = useRef(null);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState({}); // { [cardId]: imageIndex }

  // --- edit mode (the ONLY thing that reveals edit controls) ---
  const [editMode, setEditMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // --- add/edit text dialog ---
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // --- delete card confirm ---
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // --- "read more" full description dialog ---
  const [detailsTarget, setDetailsTarget] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadCards();
    // Note: edit mode is intentionally NOT restored from storage — every
    // visit starts as a plain, read-only dashboard. The admin has to click
    // "Edit Dashboard" and enter the password each time they want to edit.
  }, []);

  // Auto-advancing slideshow for cards with more than one image —
  // only runs while the dashboard is in its normal, read-only view.
  useEffect(() => {
    if (editMode) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => {
        const next = { ...prev };
        cards.forEach((card) => {
          const imgs = card.images || [];
          if (imgs.length > 1) {
            const cur = prev[card.id] || 0;
            next[card.id] = (cur + 1) % imgs.length;
          }
        });
        return next;
      });
    }, SLIDESHOW_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [cards, editMode]);

  async function loadCards() {
    setLoading(true);
    try {
      const data = await fetchToolCards();
      setCards(data);
    } catch {
      showSnackbar("Couldn't load tool cards.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showSnackbar(message, severity = "success") {
    setSnackbar({ open: true, message, severity });
  }

  function showImage(cardId, index) {
    setActiveImage((s) => ({ ...s, [cardId]: index }));
  }

  function stepImage(card, delta) {
    const imgs = card.images || [];
    if (imgs.length < 2) return;
    const cur = activeImage[card.id] || 0;
    const next = (cur + delta + imgs.length) % imgs.length;
    showImage(card.id, next);
  }

  // ---------- edit mode toggle ----------
  function handleEditDashboardClick() {
    if (editMode) {
      setEditMode(false);
      return;
    }
    setPasswordInput("");
    setPasswordError("");
    setPasswordDialogOpen(true);
  }

  async function handleUnlockSubmit() {
    setVerifying(true);
    setPasswordError("");
    try {
      const ok = await verifyAdminPassword(passwordInput);
      if (ok) {
        setAdminPassword(passwordInput);
        setEditMode(true);
        setPasswordDialogOpen(false);
      } else {
        setPasswordError("Incorrect password.");
      }
    } catch {
      setPasswordError("Couldn't verify password. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  // ---------- add / edit text ----------
  function openAddForm() {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(card) {
    setForm({ id: card.id, title: card.title, description: card.description || "" });
    setFormOpen(true);
  }

  async function handleSaveForm() {
    if (!form.title.trim()) {
      showSnackbar("Title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateToolCard(form.id, { title: form.title, description: form.description }, adminPassword);
        showSnackbar("Card updated.");
      } else {
        await createToolCard({ title: form.title, description: form.description }, adminPassword);
        showSnackbar("Card added.");
      }
      setFormOpen(false);
      loadCards();
    } catch {
      showSnackbar("Save failed. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ---------- delete card ----------
  async function handleDeleteConfirmed() {
    setDeleting(true);
    try {
      await deleteToolCard(deleteTarget.id, adminPassword);
      showSnackbar("Card deleted.");
      setDeleteTarget(null);
      loadCards();
    } catch (err) {
      showSnackbar(err.message || "Delete failed.", "error");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- image gallery (edit mode only) ----------
  function triggerImageUpload(card) {
    pendingUploadCardId.current = card.id;
    fileInputRef.current?.click();
  }

  async function handleFileChosen(e) {
    const file = e.target.files?.[0];
    const cardId = pendingUploadCardId.current;
    e.target.value = "";
    if (!file || !cardId) return;
    try {
      await addToolCardImage(cardId, file, adminPassword);
      loadCards();
    } catch {
      showSnackbar("Image upload failed.", "error");
    }
  }

  async function handleDeleteImage(card, image) {
    try {
      await deleteToolCardImage(card.id, image.id, adminPassword);
      loadCards();
    } catch {
      showSnackbar("Couldn't remove image.", "error");
    }
  }

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <Box>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChosen} />

      <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
        

        <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
          {editMode && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={openAddForm}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                color: ACCENT,
                borderColor: ACCENT,
                "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}0A` },
              }}
            >
              Add card
            </Button>
          )}
          <Button
            startIcon={editMode ? <LockOpenOutlinedIcon /> : <LockOutlinedIcon />}
            variant={editMode ? "contained" : "outlined"}
            onClick={handleEditDashboardClick}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              ...(editMode
                ? { bgcolor: ACCENT, "&:hover": { bgcolor: "#0f172a" } }
                : { color: ACCENT, borderColor: ACCENT, "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}0A` } }),
            }}
          >
            {editMode ? "Done Editing" : "Edit Dashboard"}
          </Button>
        </Stack>
      </Stack>

      {/* 1 card per row on phone, 2 on tablet, 3 on desktop.
          Plain CSS grid on purpose — MUI's <Grid> item/xs/sm props behave
          differently across v5 vs v6/v7, and that mismatch was why the
          second card was dropping to full width below the first. A CSS
          grid Box has no such version dependency. */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
        }}
      >
        {cards.map((card) => {
          const Icon = ICON_MAP[card.icon_name];
          const images = card.images || [];
          const activeIdx = activeImage[card.id] || 0;
          const heroImage = images[activeIdx] || images[0];
          const descriptionTooLong =
            (card.description || "").length > DESCRIPTION_CLAMP_CHARS;

          return (
            <Box key={card.id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%", // matches the tallest card in its row (grid default stretch) — sizes to content, not a flat number
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                  "&:hover": {
                    boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* --- hero image / slideshow / placeholder --- */}
                <Box
                  sx={{
                    position: "relative",
                    height: IMAGE_HEIGHT, // fixed regardless of which image is active
                    flexShrink: 0,
                    bgcolor: `${ACCENT}0D`,
                    "&:hover .slideshow-arrow": { opacity: 1 },
                  }}
                >
                  {heroImage ? (
                    <Box
                      component="img"
                      src={heroImage.image_url}
                      alt={card.title}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", color: `${ACCENT}55` }}>
                      {Icon ? <Icon sx={{ fontSize: 56 }} /> : <ImageOutlinedIcon sx={{ fontSize: 56 }} />}
                    </Stack>
                  )}

                  {/* slideshow arrows — only when there's more than one image */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        className="slideshow-arrow"
                        size="small"
                        onClick={() => stepImage(card, -1)}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 8,
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
                        className="slideshow-arrow"
                        size="small"
                        onClick={() => stepImage(card, 1)}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 8,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.85)",
                          opacity: 0,
                          transition: "opacity 0.15s ease",
                          "&:hover": { bgcolor: "background.paper" },
                        }}
                      >
                        <ChevronRightIcon fontSize="small" />
                      </IconButton>

                      {/* dot indicators */}
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)" }}
                      >
                        {images.map((img, idx) => (
                          <Box
                            key={img.id}
                            onClick={() => showImage(card.id, idx)}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              cursor: "pointer",
                              bgcolor: idx === activeIdx ? "#fff" : "rgba(255,255,255,0.5)",
                              boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                            }}
                          />
                        ))}
                      </Stack>
                    </>
                  )}

                  {/* edit / delete controls — ONLY visible in edit mode */}
                  {editMode && (
                    <Stack direction="row" spacing={1} sx={{ position: "absolute", top: 12, right: 12 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => openEditForm(card)}
                          sx={{ bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "background.paper" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!card.is_core && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(card)}
                            sx={{ bgcolor: "background.paper", boxShadow: 1, "&:hover": { bgcolor: "error.light" } }}
                          >
                            <DeleteIcon fontSize="small" color="error" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )}

                  {heroImage && Icon && (
                    <Avatar
                      variant="rounded"
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        bgcolor: "background.paper",
                        color: ACCENT,
                        width: 44,
                        height: 44,
                        boxShadow: 1,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>
                  )}
                </Box>

                <CardContent
                  sx={{
                    flex: 1,
                    minHeight: 0, // needed so flex children can scroll/clip instead of pushing height
                    display: "flex",
                    flexDirection: "column",
                    p: 3,
                  }}
                >
                  {/* Title — clamped to 2 lines, fixed height */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      mb: 1,
                      minHeight: "2.6em",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.title}
                  </Typography>

                  {/* Description — clamped to 3 lines, fixed height, never grows the card */}
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      lineHeight: 1.65,
                      minHeight: "4.95em",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {card.description}
                  </Typography>

                  {descriptionTooLong && (
                    <Typography
                      component="button"
                      onClick={() => setDetailsTarget(card)}
                      sx={{
                        all: "unset",
                        cursor: "pointer",
                        color: ACCENT,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        mb: 2,
                        mt: -1,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Read more
                    </Typography>
                  )}

                  {/* --- manage-images row — ONLY visible in edit mode --- */}
                  {editMode && (
                    <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1, mb: 2, flexShrink: 0 }}>
                      {images.map((img, idx) => (
                        <Box key={img.id} sx={{ position: "relative", flexShrink: 0 }}>
                          <Box
                            component="img"
                            src={img.image_url}
                            alt=""
                            onClick={() => showImage(card.id, idx)}
                            sx={{
                              width: 72,
                              height: 72,
                              borderRadius: 2,
                              objectFit: "cover",
                              cursor: "pointer",
                              border: idx === activeIdx ? `2px solid ${ACCENT}` : "2px solid transparent",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage(card, img)}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              width: 20,
                              height: 20,
                              "&:hover": { bgcolor: "error.light" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      ))}

                      <Button
                        onClick={() => triggerImageUpload(card)}
                        variant="outlined"
                        sx={{ width: 72, height: 72, minWidth: 72, flexShrink: 0, borderRadius: 2, borderStyle: "dashed" }}
                      >
                        <AddPhotoAlternateOutlinedIcon fontSize="small" />
                      </Button>
                    </Stack>
                  )}

                  {/* spacer pushes the button to the bottom regardless of text length above */}
                  <Box sx={{ flex: 1 }} />

                  {card.path && (
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      onClick={() => navigate(card.path)}
                      sx={{
                        alignSelf: "flex-start",
                        flexShrink: 0,
                        bgcolor: ACCENT,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 2.5,
                        "&:hover": { bgcolor: "#0f172a" },
                      }}
                    >
                      {card.action_label}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* --- Password dialog --- */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enter admin password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlockSubmit()}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUnlockSubmit} disabled={verifying}>
            {verifying ? "Checking..." : "Unlock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Add/edit text dialog --- */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? "Edit card" : "Add card"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveForm} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Delete confirm dialog --- */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete "{deleteTarget?.title}"?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This removes the card and all its images. This can't be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirmed} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Read more: full description dialog --- */}
      <Dialog
        open={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: `${ACCENT}08`,
            borderBottom: "1px solid",
            borderColor: "divider",
            py: 2.25,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {detailsTarget && ICON_MAP[detailsTarget.icon_name] && (
              <Avatar variant="rounded" sx={{ bgcolor: ACCENT, color: "#fff", width: 36, height: 36 }}>
                {(() => {
                  const DetailIcon = ICON_MAP[detailsTarget.icon_name];
                  return <DetailIcon fontSize="small" />;
                })()}
              </Avatar>
            )}
            <Typography variant="h6" fontWeight={700} sx={{ color: ACCENT }}>
              {detailsTarget?.title}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setDetailsTarget(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography
            color="text.secondary"
            sx={{ lineHeight: 1.8, whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
          >
            {detailsTarget?.description}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            onClick={() => setDetailsTarget(null)}
            variant="contained"
            sx={{
              bgcolor: ACCENT,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#0f172a" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}