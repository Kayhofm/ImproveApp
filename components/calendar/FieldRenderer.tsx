"use client";

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  TextField,
  Checkbox,
  MenuItem,
  Slider,
  Stack,
  Chip,
} from "@mui/material";

import type { CalendarFieldTemplate } from "@/lib/types/calendar";

interface FieldRendererProps {
  template: CalendarFieldTemplate;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function FieldRenderer({ template, value, onChange }: FieldRendererProps) {
  const common = {
    required: template.isRequired,
    helperText: template.helpText ?? undefined,
    label: template.fieldLabel,
  };

  switch (template.fieldType) {
    case "long_text":
      return (
        <TextField
          {...common}
          multiline
          minRows={3}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "number":
      return (
        <TextField
          {...common}
          type="number"
          value={value ?? ""}
          InputProps={{ endAdornment: template.dataUnit ? <Chip label={template.dataUnit} /> : undefined }}
          onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        />
      );
    case "boolean":
      return (
        <FormControl>
          <FormControlLabel
            control={<Checkbox checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />}
            label={template.fieldLabel}
          />
        </FormControl>
      );
    case "select":
      return (
        <TextField
          {...common}
          select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          {template.options?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    case "multi_select":
      return (
        <FormControl>
          <FormLabel>{template.fieldLabel}</FormLabel>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {template.options?.map((option) => {
              const selected = Array.isArray(value) && value.includes(option.value);
              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => {
                    const next = new Set(Array.isArray(value) ? value : []);
                    if (selected) {
                      next.delete(option.value);
                    } else {
                      next.add(option.value);
                    }
                    onChange(Array.from(next));
                  }}
                />
              );
            })}
          </Stack>
        </FormControl>
      );
    case "scale":
      return (
        <FormControl>
          <FormLabel>{template.fieldLabel}</FormLabel>
          <Slider
            value={typeof value === "number" ? value : template.options?.length ? template.options.length / 2 : 3}
            min={1}
            max={template.options?.length ?? 5}
            marks
            onChange={(_, newValue) => onChange(newValue as number)}
          />
        </FormControl>
      );
    default:
      return (
        <TextField
          {...common}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}
