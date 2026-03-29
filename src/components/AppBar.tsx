import logoUrl from '/logo.svg?url';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import type { Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

interface AppBarProps {
  theme: Theme;
  isMobile: boolean;
  isAiEnabled: boolean;
  activeTab: string;
  setActiveTab: (tab: 'applications' | 'interviews') => void;
  setIsSettingsOpen: (open: boolean) => void;
  colorMode: { toggleColorMode: () => void };
  logout: () => void;
  setIsModalOpen: (open: boolean) => void;
}

export const AppBar = ({
  theme,
  isMobile,
  isAiEnabled,
  activeTab,
  setActiveTab,
  setIsSettingsOpen,
  colorMode,
  logout,
  setIsModalOpen,
}: AppBarProps) => (
  <MuiAppBar
    position="sticky"
    elevation={0}
    color="inherit"
    sx={{
      top: 0,
      zIndex: theme.zIndex.appBar,
      borderBottom: '1px solid',
      borderColor: 'divider',
      backdropFilter: 'blur(8px)',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(15, 23, 42, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
    }}
  >
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 2 },
        minHeight: { xs: 56, sm: 64 },
      }}
    >
      {/* LOGO AND TITLE */}
      <Box display="flex" alignItems="center" sx={{ gap: 1.5 }}>
        <Box
          component="img"
          src={logoUrl}
          alt="Job Tracker Logo"
          sx={{ width: 28, height: 28 }}
        />
        <Typography
          variant="h6"
          color="text.primary"
          fontWeight="900"
          sx={{
            letterSpacing: '-0.02em',
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Job Tracker
        </Typography>

        {/* Desktop Tabs */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              ml: 3,
              p: 0.5,
            }}
          >
            <Button
              variant={activeTab === 'applications' ? 'contained' : 'text'}
              disableElevation
              onClick={() => setActiveTab('applications')}
              size="small"
              sx={{ borderRadius: 1.5, px: 2 }}
            >
              Applications
            </Button>
            <Button
              variant={activeTab === 'interviews' ? 'contained' : 'text'}
              disableElevation
              onClick={() => setActiveTab('interviews')}
              size="small"
              sx={{ borderRadius: 1.5, px: 2 }}
            >
              Interviews
            </Button>
          </Box>
        )}
      </Box>

      {/* GLOBAL ACTIONS */}
      <Box display="flex" alignItems="center" gap={0.5}>
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              mr: 3,
              p: 0.5,
            }}
          >
            <Button
              variant="contained"
              disableElevation
              onClick={() => setIsModalOpen(true)}
              size="small"
              sx={{
                borderRadius: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <AddIcon fontSize="small" />
              Add Application
            </Button>
          </Box>
        )}
        {isAiEnabled && (
          <IconButton
            onClick={() => setIsSettingsOpen(true)}
            color="inherit"
            size="small"
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton
          onClick={colorMode.toggleColorMode}
          color="inherit"
          size="small"
        >
          {theme.palette.mode === 'dark' ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
        </IconButton>
        <IconButton
          onClick={logout}
          color="inherit"
          title="Logout"
          size="small"
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Toolbar>
  </MuiAppBar>
);
