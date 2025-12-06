"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import type { ProfileSummary } from "@/lib/types/user";
import type { UserRole } from "@/lib/supabase/types";
import { ROLES, roleLabels } from "@/lib/auth/roles";

interface UserTableProps {
  profiles: ProfileSummary[];
  onInvite: (payload: { email: string; fullName?: string; role: UserRole }) => Promise<unknown>;
  isInviting: boolean;
}

export function UserTable({ profiles, onInvite, isInviting }: UserTableProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<{ email: string; fullName: string; role: UserRole }>(
    ({ email: "", fullName: "", role: ROLES.editor })
  );

  const handleClose = () => {
    setDialogOpen(false);
    setForm({ email: "", fullName: "", role: ROLES.editor });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onInvite(form);
    handleClose();
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
            <div>
              <Typography variant="h6">People</Typography>
              <Typography variant="body2" color="text.secondary">
                Admins can create accounts and assign roles.
              </Typography>
            </div>
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              Invite user
            </Button>
          </Stack>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Timezone</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id} hover>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{roleLabels[profile.role]}</TableCell>
                  <TableCell>{profile.timezone ?? "—"}</TableCell>
                  <TableCell>{new Date(profile.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </CardContent>

      <Dialog open={isDialogOpen} onClose={handleClose} component="form" onSubmit={handleSubmit} fullWidth>
        <DialogTitle>Invite a user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <TextField
              label="Full name"
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <TextField
              label="Role"
              select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
            >
              {Object.values(ROLES).map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabels[role]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isInviting}>
            {isInviting ? "Inviting…" : "Send invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
