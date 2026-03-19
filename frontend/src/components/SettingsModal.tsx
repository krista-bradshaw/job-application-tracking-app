import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import { getApiKey, saveApiKey } from '../utils/storage';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
}) => {
  const [apiKey, setApiKeyState] = useState(() => getApiKey());

  const handleSave = () => {
    saveApiKey(apiKey.trim());
    onClose();
  };

  // Refresh API key from storage whenever modal opens
  useEffect(() => {
    if (open) {
      setApiKeyState(getApiKey());
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle fontWeight="bold">Settings</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          To automatically populate job details from screenshots, you need a
          Google Gemini API Key. This key is stored securely in your browser's
          local storage and is only sent directly to Google's API.
        </Typography>
        <Typography variant="body2" paragraph>
          Don't have one? Get it for free directly from Google AI Studio:{' '}
          <Link
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener"
          >
            Get an API key
          </Link>
        </Typography>

        <TextField
          label="Google Gemini API Key"
          fullWidth
          autoFocus
          value={apiKey}
          onChange={(e) => setApiKeyState(e.target.value)}
          placeholder="AIzaSy..."
          type="password"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disableElevation
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
