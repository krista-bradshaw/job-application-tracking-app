import { Paper, Typography } from '@mui/material';

export const SummaryCard = ({
  stat,
  label,
  color,
  backgroundColor,
}: {
  stat: number;
  label: string;
  color: string;
  backgroundColor: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      flex: 1,
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: color,
      backgroundColor,
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
