import { Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

import type { InsightGroup } from "@/lib/types/calendar";

interface InsightGroupCardProps {
  group: InsightGroup;
}

const typeLabels: Record<string, string> = {
  number: "Numeric",
  boolean: "Yes/No",
  select: "Select",
};

export function InsightGroupCard({ group }: InsightGroupCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{typeLabels[group.fieldType] ?? group.fieldType}</Typography>
            <Chip label={`${group.items.length} entries`} />
          </Stack>
          <Divider />
          <Stack spacing={1.5}>
            {group.items.map((item) => (
              <Stack key={`${item.label}-${item.dayNumber}`} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Day {item.dayNumber}
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
