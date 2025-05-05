import { useState, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  ExitToApp as ExitToAppIcon,
  VpnKey as VpnKeyIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface LayoutProps {
  userData: { email: string; role: string; department: string };
  onLogout: () => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
}

const drawerWidth = 240;

export default function Layout({ userData, onLogout, onSearch, children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2', // Professional blue
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1d1d1d' : '#ffffff',
          },
        },
        typography: {
          fontFamily: 'Roboto, Arial, sans-serif',
        },
      }),
    [darkMode]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button component="a" href="#dashboard">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        {userData.role === 'manager' && (
          <ListItem button component="a" href="#employees">
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Employees" />
          </ListItem>
        )}
        {userData.role === 'hr' && (
          <ListItem button component="a" href="#cv-submissions">
            <ListItemIcon><DescriptionIcon /></ListItemIcon>
            <ListItemText primary="CV Submissions" />
          </ListItem>
        )}
        <ListItem button component="a" href="#clock-records">
          <ListItemIcon><AccessTimeIcon /></ListItemIcon>
          <ListItemText primary="Clock Records" />
        </ListItem>
        {(userData.role === 'hr' || userData.role === 'manager') && (
          <ListItem button component="a" href="#login-trail">
            <ListItemIcon><VpnKeyIcon /></ListItemIcon>
            <ListItemText primary="Login Trail" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme => theme.zIndex.drawer + 1,
            bgcolor: theme.palette.primary.main
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              HR Management System
            </Typography>
            <TextField
              variant="outlined"
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'white' }} />,
                sx: { bgcolor: 'white', borderRadius: 1, mr: 2 }
              }}
            />
            <FormControlLabel
              control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />}
              label="Dark Mode"
            />
            <IconButton onClick={handleProfileMenuOpen} color="inherit">
              <Avatar>{userData.email[0].toUpperCase()}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem disabled>{userData.email}</MenuItem>
              <MenuItem disabled>Role: {userData.role}</MenuItem>
              <MenuItem onClick={onLogout}>
                <ExitToAppIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}