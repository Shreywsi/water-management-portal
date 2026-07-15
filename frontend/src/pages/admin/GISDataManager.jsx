import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import API_BASE from "../../config/api";

export default function GISDataManager() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch(
        `${API_BASE}/gis/upload/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert(`Uploaded: ${data.filename}`);
      } else {
        alert(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);

      // Reset input so the same file can be uploaded again
      event.target.value = "";
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={1}>
        GIS Data Manager
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Import GIS layers and manage them from one place.
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6">
                Import GIS Layer
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Supported formats:
                <br />
                • ZIP Shapefile (.zip)
                <br />
                • GeoJSON (.geojson)
                <br />
                • KML (.kml)
                <br />
                • CSV (.csv)
              </Typography>
            </Box>

            <input
              id="gis-upload"
              type="file"
              hidden
              accept=".zip,.geojson,.kml,.csv"
              onChange={handleFileUpload}
            />

            <label htmlFor="gis-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFileIcon />}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Upload GIS File"}
              </Button>
            </label>

            <Divider />

            <Box>
              <Typography variant="h6" mb={2}>
                Imported Layers
              </Typography>

              <Typography color="text.secondary">
                No layers uploaded yet.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}