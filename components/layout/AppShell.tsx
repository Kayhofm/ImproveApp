"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Container,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import type { UserRole } from "@/lib/supabase/types";
import { ROLES, roleLabels } from "@/lib/auth/roles";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ProfileSummary } from "@/lib/types/user";

const navItems: { label: string; href: string; roles?: UserRole[] }[] = [
  { label: "Calendar", href: "/calendar" },
  { label: "Therapy", href: "/therapy" },
  { label: "Insights", href: "/insights" },
  { label: "Admin", href: "/admin", roles: [ROLES.admin] },
];

interface AppShellProps {
  role: UserRole;
  profile: ProfileSummary | null;
  children: React.ReactNode;
}

export function AppShell({ role, profile, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [email, setEmail] = useState(profile?.email ?? "");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch (error) {
      console.warn("Supabase browser client unavailable", error);
      return null;
    }
  }, []);
  const filteredTabs = useMemo(
    () => navItems.filter((item) => !item.roles || item.roles.includes(role)),
    [role]
  );

  const activeHref =
    filteredTabs.find((tab) => pathname.startsWith(tab.href))?.href ??
    filteredTabs[0]?.href ??
    "/calendar";

  const avatarInitial =
    profile?.fullName?.[0]?.toUpperCase() ??
    profile?.email?.[0]?.toUpperCase() ??
    undefined;

  const closeMenu = () => setMenuAnchor(null);

  const openLoginDialog = () => {
    setEmail(profile?.email ?? "");
    setPassword("");
    setAuthError(null);
    setLoginDialogOpen(true);
  };

  const closeLoginDialog = () => {
    setLoginDialogOpen(false);
    setAuthError(null);
    setPassword("");
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setAuthError("Supabase client unavailable. Check environment variables.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
      return;
    }
    closeLoginDialog();
    router.refresh();
  };

  const handleLogout = async () => {
    closeMenu();
    if (!supabase) {
      console.error("Supabase client unavailable, cannot log out.");
      return;
    }
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar position="sticky" color="inherit">
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" color="inherit" sx={{ display: { xs: "flex", md: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
            <Avatar variant="rounded" sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
              90
            </Avatar>
            <Box>
              <Typography variant="h6">Improve 90</Typography>
            </Box>
          </Stack>
          <Chip label={roleLabels[role]} color="primary" variant="outlined" />
          <Tooltip title={profile ? "Account" : "Log in"}>
            <IconButton color="inherit" onClick={(event) => setMenuAnchor(event.currentTarget)}>
              <Avatar alt={profile?.fullName ?? profile?.email ?? "Guest"}>{avatarInitial}</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
        <Tabs value={activeHref} variant="scrollable" scrollButtons={false} sx={{ px: { xs: 2, md: 4 } }}>
          {filteredTabs.map((tab) => (
            <Tab
              key={tab.href}
              component={Link}
              href={tab.href}
              label={tab.label}
              value={tab.href}
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
          ))}
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 6 }}>{children}</Container>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu} keepMounted>
        {profile ? (
          <>
            <MenuItem disabled>
              <ListItemText
                primary={profile.fullName ?? profile.email}
                secondary={profile.fullName ? profile.email : undefined}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </>
        ) : (
          <MenuItem
            onClick={() => {
              closeMenu();
              openLoginDialog();
            }}
          >
            Log in
          </MenuItem>
        )}
      </Menu>
      <Dialog open={loginDialogOpen} onClose={closeLoginDialog} fullWidth maxWidth="xs">
        <DialogTitle>Sign in</DialogTitle>
        <Box component="form" onSubmit={handleLoginSubmit} noValidate>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {authError && <Alert severity="error">{authError}</Alert>}
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                autoFocus
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={closeLoginDialog} disabled={authLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={authLoading || !email || !password}>
              {authLoading ? "Signing in…" : "Sign in"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
