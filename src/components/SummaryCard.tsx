import { Paper, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export const SummaryCard = ({
  stat,
  label,
  color,
  backgroundColor,
  sx,
}: {
  stat: number;
  label: string;
  color: string;
  backgroundColor: string;
  sx?: SxProps<Theme>;
}) => (
  <Paper
    elevation={0}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: { xs: 1, sm: 2 },
      flex: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: color,
      backgroundColor,
      ...sx,
    }}
  >
    <Typography variant="h4" fontWeight="bold" color={color}>
      {stat}
    </Typography>
    <Typography variant="body2" color="text.secondary" fontWeight="500">
      {label}
    </Typography>
  </Paper>
);
