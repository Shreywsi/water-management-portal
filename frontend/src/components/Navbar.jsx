import {
  AppBar,
  Toolbar,
  Typography,
  Box
} from "@mui/material";

import LanguageSelector from "./LanguageSelector";

function Navbar() {
  return (
    <AppBar position="fixed">
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          py: 1
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            fontSize: {
              xs: "1rem",
              sm: "1.2rem",
              md: "1.4rem"
            }
          }}
        >
          Groundwater Management Portal
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <LanguageSelector />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;