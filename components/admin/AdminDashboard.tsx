"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Stack } from "@mui/material";

import { fetchProfiles, inviteUser, uploadCalendarCsv } from "@/lib/services/admin-service";
import { UserTable } from "@/components/admin/UserTable";
import { CalendarUploader } from "@/components/admin/CalendarUploader";

export function AdminDashboard() {
  const client = useQueryClient();
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => client.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadCalendarCsv,
  });

  return (
    <Stack spacing={3}>
      {error && <Alert severity="error">{error.message || "Unable to load admin data"}</Alert>}
      {inviteMutation.error && (
        <Alert severity="error">{inviteMutation.error instanceof Error ? inviteMutation.error.message : "Unable to invite user"}</Alert>
      )}
      {uploadMutation.error && (
        <Alert severity="error">
          {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Unable to upload calendar"}
        </Alert>
      )}
      <CalendarUploader onUpload={(formData) => uploadMutation.mutateAsync(formData)} isUploading={uploadMutation.isPending} />
      <UserTable
        profiles={profiles ?? []}
        onInvite={(payload) => inviteMutation.mutateAsync(payload)}
        isInviting={inviteMutation.isPending}
      />
      {isLoading && <Alert severity="info">Loading users…</Alert>}
    </Stack>
  );
}
