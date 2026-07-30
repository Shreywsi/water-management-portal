import { Box, Typography, Divider, Link } from "@mui/material";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import CopyrightIcon from "@mui/icons-material/Copyright";

import winLogo from "../assets/win.png";
import actLogo from "../assets/act.jpg";
import iitgnLogo from "../assets/iitgn.png";

const BG = "#1E2433";
const ACCENT = "#1C73C8";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "rgba(255,255,255,0.92)";
const SUBTEXT = "rgba(255,255,255,0.65)";
const MUTED = "rgba(255,255,255,0.45)";

const PARTNERS = [
  {
    src: winLogo,
    name: "WIN Foundation",
  },
  {
    src: actLogo,
    name: "ACT",
  },
  {
    src: iitgnLogo,
    name: "IIT Gandhinagar",
  },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: BG,
        mt: 0,
      }}
    >
      {/* Top Accent */}
      <Box
        sx={{
          height: 3,
          bgcolor: ACCENT,
        }}
      />

      {/* Main Footer */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 3, md: 7 },
          py: { xs: 4, md: 5 },

          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1.6fr 1fr",
          },
          gap: { xs: 5, md: 8 },
          alignItems: "center",
        }}
      >
        {/* ---------------- LEFT ---------------- */}

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.10)",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WaterDropOutlinedIcon
                sx={{
                  color: "#fff",
                  fontSize: 26,
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: TEXT,
                  fontWeight: 600,
                  fontSize: 22,
                  lineHeight: 1.15,
                }}
              >
                Water Management Portal
              </Typography>

              <Typography
                sx={{
                  color: "#7DB3F0",
                  fontSize: 13,
                  mt: 0.4,
                  fontWeight: 500,
                }}
              >
                Government of Gujarat
              </Typography>
            </Box>
          </Box>

          <Typography
            sx={{
              color: SUBTEXT,
              fontSize: 13.5,
              lineHeight: 1.8,
              maxWidth: 560,
              mb: 2,
            }}
          >
            AI-enabled platform for monitoring, analysis and sustainable
            management of Gujarat's water resources through an integrated
            digital ecosystem.
          </Typography>

          <Typography
  variant="caption"
  sx={{
    color: MUTED,
    fontSize: 11.5,
  }}
>
  Designed &amp; developed by{" "}
  <Link
    href="https://www.linkedin.com/in/shreyasi-soumya/"
    target="_blank"
    rel="noopener noreferrer"
    underline="hover"
    sx={{
      color: "#7DB3F0",
      fontWeight: 600,
      cursor: "pointer",
      transition: "0.2s",

      "&:hover": {
        color: "#A8D1FF",
      },
    }}
  >
    Shreyasi Soumya
  </Link>
</Typography>
        </Box>

        {/* ---------------- RIGHT ---------------- */}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: {
              xs: "center",
              md: "flex-start",
            },
          }}
        >
          <Typography
            sx={{
              color: MUTED,
              textTransform: "uppercase",
              fontSize: 11,
              letterSpacing: ".16em",
              mb: 2.5,
              textAlign: {
                xs: "center",
                md: "left",
              },
            }}
          >
            Collaborating Institutions
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "center",
                md: "flex-start",
              },
              alignItems: "flex-start",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {PARTNERS.map((partner) => (
              <Box
                key={partner.name}
                sx={{
                  width: 100,
                  textAlign: "center",
                  transition: "all .25s ease",

                  "&:hover": {
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 82,
                    height: 82,
                    mx: "auto",

                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",

                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={partner.src}
                    alt={partner.name}
                    style={{
                      maxWidth: 58,
                      maxHeight: 54,
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: SUBTEXT,
                    fontSize: 11,
                    mt: 1.2,
                    lineHeight: 1.4,
                  }}
                >
                  {partner.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom Divider */}

      <Divider
        sx={{
          borderColor: BORDER,
        }}
      />

      {/* Copyright */}

      <Box
        sx={{
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.8,
        }}
      >
        <CopyrightIcon
          sx={{
            color: MUTED,
            fontSize: 14,
          }}
        />

        <Typography
          sx={{
            color: MUTED,
            fontSize: 11,
          }}
        >
          2025 Water Resources Department, Government of Gujarat. All Rights
          Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default Footer;