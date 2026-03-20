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
        px: { xs: 1, sm: 2 },
      }}
    >
      {/* LOGO AND TABS */}
      <Box display="flex" alignItems="center" sx={{ gap: { xs: 1, sm: 2 } }}>
        <Box
          component="img"
          src={logoUrl}
          alt="Job Tracker Logo"
          sx={{ width: { xs: 26, sm: 32 }, height: { xs: 26, sm: 32 } }}
        />
        <Typography
          variant={isMobile ? 'subtitle1' : 'h6'}
          color="text.primary"
          fontWeight="bold"
        >
          Job Tracker
        </Typography>

        {/* Tabs */}
        <Box
          sx={{
            display: 'flex',
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            alignItems: 'flex-start',
          }}
        >
          <Button
            variant={activeTab === 'applications' ? 'contained' : 'text'}
            disableElevation
            onClick={() => setActiveTab('applications')}
            sx={{ borderRadius: 1.5, px: 2, py: 0.5 }}
          >
            Applications
          </Button>
          <Button
            variant={activeTab === 'interviews' ? 'contained' : 'text'}
            disableElevation
            onClick={() => setActiveTab('interviews')}
            sx={{ borderRadius: 1.5, px: 2, py: 0.5 }}
          >
            Interviews
          </Button>
        </Box>
      </Box>

      {/* SETTINGS, THEME, LOGOUT */}
      <Box display="flex" alignItems="center">
        {isAiEnabled && (
          <IconButton
            onClick={() => setIsSettingsOpen(true)}
            color="inherit"
            size={'medium'}
          >
            <SettingsIcon fontSize={'medium'} />
          </IconButton>
        )}
        <IconButton
          onClick={colorMode.toggleColorMode}
          color="inherit"
          size={'medium'}
        >
          {theme.palette.mode === 'dark' ? (
            <LightModeIcon fontSize={'medium'} />
          ) : (
            <DarkModeIcon fontSize={'medium'} />
          )}
        </IconButton>
        <IconButton
          onClick={logout}
          color="inherit"
          title="Logout"
          size={'medium'}
        >
          <LogoutIcon fontSize={isMobile ? 'small' : 'medium'} />
        </IconButton>
      </Box>
    </Toolbar>
  </MuiAppBar>
);
