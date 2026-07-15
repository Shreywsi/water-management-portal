import { createTheme } from '@mui/material/styles';

// Palette grounded in the subject: groundwater monitoring.
// Deep aquifer blue for primary actions, a mineral teal for secondary/water accents,
// terracotta-clay for alerts (the soil farmers actually work), and a soft
// limestone background instead of stark white or generic MUI grey.
const palette = {
  aquifer: '#0B4F6C',      // deep well-water blue — primary
  aquiferDark: '#073A50',
  mineral: '#1E8A7A',      // mineral teal — secondary / success
  clay: '#C76B3B',         // terracotta clay — warnings
  silt: '#9A6B3F',         // muted brown — neutral data accents
  limestone: '#F6F4EF',    // page background
  stone: '#E7E3D8',        // card/divider background
  ink: '#1C2B30',          // primary text
  inkSoft: '#54635F',      // secondary text
  alert: '#B3403A',        // error/danger
};

export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: { main: palette.aquifer, dark: palette.aquiferDark, contrastText: '#FFFFFF' },
      secondary: { main: palette.mineral, contrastText: '#FFFFFF' },
      warning: { main: palette.clay },
      error: { main: palette.alert },
      success: { main: palette.mineral },
      background:
        mode === 'light'
          ? { default: palette.limestone, paper: '#FFFFFF' }
          : { default: '#10181B', paper: '#17222600'.length ? '#172226' : '#172226' },
      text:
        mode === 'light'
          ? { primary: palette.ink, secondary: palette.inkSoft }
          : { primary: '#E9EDEC', secondary: '#A9B6B3' },
      divider: mode === 'light' ? palette.stone : '#27343788',
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: -0.5 },
      h5: { fontWeight: 700, letterSpacing: -0.3 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${mode === 'light' ? palette.stone : '#27343788'}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'light' ? palette.stone : '#27343788'}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 1px 2px rgba(20, 30, 32, 0.06), 0 1px 12px rgba(20, 30, 32, 0.04)',
            border: `1px solid ${mode === 'light' ? palette.stone : '#27343788'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 16 },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              color: palette.inkSoft,
              backgroundColor: mode === 'light' ? '#FBFAF7' : '#1B2629',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
    },
  });

export const brandPalette = palette;
