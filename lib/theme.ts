"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral: Palette["primary"];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

const palette = {
  primary: {
    main: "#3061ff",
    light: "#5b86ff",
    dark: "#1b3ebf",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#ff9d25",
    light: "#ffb954",
    dark: "#bf6f00",
    contrastText: "#0b1526",
  },
  neutral: {
    main: "#6d778b",
    light: "#a9b4c9",
    dark: "#333b4d",
    contrastText: "#ffffff",
  },
  success: {
    main: "#1fb37b",
  },
  error: {
    main: "#e64848",
  },
  warning: {
    main: "#f1c21b",
  },
  info: {
    main: "#00b0ff",
  },
  background: {
    default: "#f4f6fb",
    paper: "#ffffff",
  },
  text: {
    primary: "#0b1526",
    secondary: "#4a5568",
  },
};

export const theme = createTheme({
  cssVariables: true,
  palette,
  typography: {
    fontFamily: "var(--font-geist-sans), 'Inter', 'Segoe UI', system-ui, sans-serif",
    h1: {
      fontWeight: 600,
      fontSize: "2.75rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.65rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.35rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    body1: {
      fontSize: "1rem",
      color: palette.text.primary,
    },
    body2: {
      fontSize: "0.95rem",
      color: palette.text.secondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: "1px solid rgba(13, 18, 33, 0.08)",
          boxShadow: "0px 10px 30px rgba(18, 31, 68, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(13, 18, 33, 0.08)",
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
