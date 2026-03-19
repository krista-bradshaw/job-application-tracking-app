import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  CircularProgress,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import type { JobApplication } from '../types';
import { extractJobDetailsFromImage } from '../utils/ai';
import { getApiKey } from '../utils/storage';

interface JobModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    job: Omit<JobApplication, 'id' | 'createdAt'> & { createdAt?: string }
  ) => void | Promise<void>;
  initialData?: JobApplication | null;
}

const levels = ['Internship', 'Entry', 'Mid', 'Senior', 'Lead', 'Manager'];

export const JobModal: React.FC<JobModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
}) => {
  const isAiEnabled = import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';

  const [title, setTitle] = useState(initialData?.title || '');
  const [company, setCompany] = useState(initialData?.company || '');
  const [level, setLevel] = useState(initialData?.level || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [applyDate, setApplyDate] = useState(
    initialData?.createdAt ? initialData.createdAt.split('T')[0] : ''
  );
  const [interest, setInterest] = useState<string>(
    initialData?.interest ? String(initialData.interest) : 'Medium'
  );

  // Reset state when modal opens or initialData changes
  useEffect(() => {
    if (open) {
      setTitle(initialData?.title || '');
      setCompany(initialData?.company || '');
      setLevel(initialData?.level || '');
      setNotes(initialData?.notes || '');
      setUrl(initialData?.url || '');
      setApplyDate(
        initialData?.createdAt ? initialData.createdAt.split('T')[0] : ''
      );
      setInterest(
        initialData?.interest ? String(initialData.interest) : 'Medium'
      );
      setExtractError(null);
      setIsExtracting(false);
    }
  }, [open, initialData]);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setExtractError('Please upload a valid image file.');
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      setExtractError(
        'Gemini API Key is missing. Please set it in Settings (top right gear icon).'
      );
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const details = await extractJobDetailsFromImage(
            base64String,
            apiKey
          );
          if (details.title) setTitle(details.title);
          if (details.company) setCompany(details.company);
          if (details.level) setLevel(details.level);
        } catch (err) {
          const error = err as Error;
          setExtractError(
            error.message || 'Failed to extract details from the image.'
          );
        } finally {
          setIsExtracting(false);
        }
      };
      reader.onerror = () => {
        setExtractError('Failed to read the image file.');
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setExtractError('Failed to process image upload.');
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!isAiEnabled) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleImageFile(blob);
        break;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !company.trim()) return;

    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localNow = new Date(now.getTime() - tzOffset).toISOString();

    const finalCreatedAt = applyDate || localNow.slice(0, 10);

    onSave({
      title: title.trim(),
      company: company.trim(),
      level,
      notes: notes.trim(),
      url: url.trim(),
      interest: interest || undefined,
      createdAt: finalCreatedAt,
    });

    // Not resetting state here since we trigger it on open change
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2,
        }}
      >
        {initialData ? 'Edit application' : 'Add new application'}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'text.disabled' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} onPaste={handlePaste}>
        <DialogContent dividers sx={{ pt: 1 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            {!initialData && isAiEnabled && (
              <Box
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed',
                  borderColor: extractError ? 'error.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() =>
                  document.getElementById('screenshot-upload')?.click()
                }
              >
                <input
                  type="file"
                  id="screenshot-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                {isExtracting ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary">
                      Extracting job details with AI...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <CloudUploadIcon
                      sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                    />
                    <Typography variant="subtitle2" fontWeight="medium">
                      Paste or drop a screenshot of the job posting
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      We'll try to auto-populate the details for you
                    </Typography>
                  </>
                )}
              </Box>
            )}

            {extractError && (
              <Alert severity="error" onClose={() => setExtractError(null)}>
                {extractError}
              </Alert>
            )}

            <TextField
              required={!company.trim()}
              label="Role"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              autoFocus
              InputLabelProps={{ shrink: true }}
              placeholder="e.g., Senior Software Engineer"
            />

            <TextField
              required={!title.trim()}
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              placeholder="e.g., Acme Corp"
            />

            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
            >
              <FormControl fullWidth>
                <InputLabel shrink>Level</InputLabel>
                <Select
                  value={level}
                  label="Level"
                  displayEmpty
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {levels.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel shrink>Interest</InputLabel>
                <Select
                  value={interest}
                  label="Interest"
                  onChange={(e) => setInterest(e.target.value)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2}
            >
              <TextField
                label="Application Date"
                type="date"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                placeholder="YYYY-MM-DD"
              />
            </Box>

            <TextField
              label="Job Posting URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
              placeholder="e.g., https://linkedin.com/jobs/..."
              type="url"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., Referral from Priya. Follow up in 3 days."
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
          >
            {initialData ? 'Save Changes' : 'Add Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
