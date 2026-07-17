import { Box, Typography, Link, Divider } from "@mui/material";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CopyrightIcon from "@mui/icons-material/Copyright";

import winLogo from "../assets/win.png";
import actLogo from "../assets/act.jpg";
import iitgnLogo from "../assets/iitgn.png";

// ── Dark navy — clearly distinct from the #0C447C login panel
const BG        = "#1e2433";
const FAINT     = "rgba(255,255,255,0.60)";
const FAINTER   = "rgba(255,255,255,0.38)";
const BORDER    = "rgba(255,255,255,0.10)";

// Footer accent strip:
<Box sx={{ height: "3px", bgcolor: "#2A3F6F" }} />

const QUICK_LINKS = [
  { label: "Dashboard",   Icon: DashboardOutlinedIcon,     href: "#" },
  { label: "Water map",   Icon: MapOutlinedIcon,           href: "#" },
  { label: "Reports",     Icon: BarChartOutlinedIcon,      href: "#" },
  { label: "Alerts",      Icon: WarningAmberOutlinedIcon,  href: "#" },
  { label: "Schedule",    Icon: CalendarMonthOutlinedIcon, href: "#" },
];

const ABOUT_LINKS = [
  { label: "About us",        Icon: InfoOutlinedIcon,          href: "#" },
  { label: "Our mission",     Icon: TrackChangesOutlinedIcon,  href: "#" },
  { label: "Our team",        Icon: GroupsOutlinedIcon,        href: "#" },
  { label: "News & updates",  Icon: NewspaperOutlinedIcon,     href: "#" },
  { label: "Publications",    Icon: ArticleOutlinedIcon,       href: "#" },
];

const HELP_LINKS = [
  { label: "Contact us",      Icon: MailOutlinedIcon,          href: "#" },
  { label: "Support",         Icon: HeadsetMicOutlinedIcon,    href: "#" },
  { label: "User manual",     Icon: MenuBookOutlinedIcon,      href: "#" },
  { label: "FAQs",            Icon: HelpOutlineOutlinedIcon,   href: "#" },
  { label: "Report an issue", Icon: BugReportOutlinedIcon,     href: "#" },
];

const PARTNERS = [
  { src: winLogo,   alt: "WIN Foundation",  label: "WIN Foundation"  },
  { src: actLogo,   alt: "ACT",             label: "ACT"             },
  { src: iitgnLogo, alt: "IIT Gandhinagar", label: "IIT Gandhinagar" },
];

function LinkColumn({ heading, links }) {
  return (
    <Box>
      <Typography sx={{
        fontSize: 11, fontWeight: 500, textTransform: "uppercase",
        letterSpacing: "0.08em", color: FAINTER, mb: 1.5,
      }}>
        {heading}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {links.map(({ label, Icon, href }) => (
          <Link key={label} href={href} underline="none" sx={{
            display: "flex", alignItems: "center", gap: 0.75,
            fontSize: 13, color: FAINT,
            "&:hover": { color: "#fff" },
            transition: "color 0.15s",
          }}>
            <Icon sx={{ fontSize: 15, opacity: 0.65 }} />
            {label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: BG }}>

      {/* Thin accent line at top to visually separate from page content */}
      <Box sx={{ height: "3px", bgcolor: "#185FA5" }} />

      {/* Main grid */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" },
        gap: 4,
        px: { xs: 3, md: 6 },
        pt: 4.5, pb: 4,
      }}>

        {/* Brand + logos column */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <WaterDropOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: "#fff", lineHeight: 1.35 }}>
              Water<br />Management Portal
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12.5, color: FAINT, lineHeight: 1.75, mb: 2.5 }}>
            An integrated platform for water resource monitoring, allocation, and sustainable management across all 33 districts of Gujarat.
          </Typography>

          <Typography sx={{
            fontSize: 10, textTransform: "uppercase",
            letterSpacing: "0.08em", color: FAINTER, mb: 1.5,
          }}>
            Supported by
          </Typography>

          {/* Real logo images */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
            {PARTNERS.map(({ src, alt, label }) => (
              <Box key={label} sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: 2,
                px: 1.75, py: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 0.75,
                minWidth: 80,
              }}>
                <img
                  src={src}
                  alt={alt}
                  style={{
                    height: 44,          // enlarged from 28px
                    width: "auto",
                    objectFit: "contain",
                    opacity: 0.9,
                  }}
                />
                <Typography sx={{ fontSize: 10, color: FAINT, whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <LinkColumn heading="Quick links"    links={QUICK_LINKS} />
        <LinkColumn heading="About"          links={ABOUT_LINKS} />
        <LinkColumn heading="Help & contact" links={HELP_LINKS}  />
      </Box>

      {/* Bottom bar */}
      <Divider sx={{ borderColor: BORDER }} />
      <Box sx={{
        px: { xs: 3, md: 6 }, py: 1.75,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 1,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CopyrightIcon sx={{ fontSize: 13, color: FAINTER }} />
          <Typography sx={{ fontSize: 11.5, color: FAINTER }}>
            2025 Water Resources Department, Government of Gujarat. All rights reserved.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {["Privacy policy", "Terms of use", "Accessibility"].map((t) => (
            <Link key={t} href="#" underline="hover" sx={{
              fontSize: 11.5, color: FAINTER,
              "&:hover": { color: "#fff" },
            }}>
              {t}
            </Link>
          ))}
        </Box>
      </Box>

    </Box>
  );
}

export default Footer;