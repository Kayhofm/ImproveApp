import { Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

import type { InsightGroup } from "@/lib/types/calendar";

interface InsightGroupCardProps {
  group: InsightGroup;
}

const typeLabels: Record<string, string> = {
  number: "Numeric",
  boolean: "Yes/No",
  select: "Select",
  long_text: "Reflections",
};

export function InsightGroupCard({ group }: InsightGroupCardProps) {
  const isReflection = group.fieldType === "long_text";

  return (
    <Card>
      <CardContent
        sx={
          isReflection
            ? {
                pl: { xs: 1, md: 1.5 },
                pr: { xs: 3, md: 4 },
                pt: 3,
                pb: 3,
              }
            : undefined
        }
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{typeLabels[group.fieldType] ?? group.fieldType}</Typography>
            <Chip label={`${group.items.length} entries`} />
          </Stack>
          <Divider />
          <Stack spacing={1.5}>
            {group.items.map((item) => (
              <Stack
                key={`${item.label}-${item.dayNumber}`}
                direction="row"
                spacing={2}
                alignItems="baseline"
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ width: 80, flexShrink: 0 }}
                >
                  Day {item.dayNumber}
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }}>
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
