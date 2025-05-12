import { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Switch,
  Select,
  MenuItem,
  Button,
  TextField,
  Avatar,
  Menu,
  AppBar,
  Toolbar,
  Badge,
  Divider,
  Paper,
  ListSubheader,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccessTime as ClockIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LayoutProps {
  userData: { email: string; role: string; department: string };
  onLogout: () => void;
  onSearch: (query: string) => void;
  children: React.ReactNode;
}

interface ThemeStyles {
  bg: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

interface Notification {
  id: number;
  message: string;
  role: string;
}

interface Activity {
  id: number;
  message: string;
  timestamp: string;
}

const Layout = ({ userData, onLogout, onSearch, children }: LayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [themeColor, setThemeColor] = useState<'blue' | 'purple' | 'green'>('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Pending CV approval', role: 'admin' },
    { id: 2, message: 'Reminder: Clock in', role: 'employee' },
  ]);
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, message: 'Employee1 clocked in', timestamp: '2025-05-12 09:00' },
    { id: 2, message: 'Admin approved CV', timestamp: '2025-05-12 10:00' },
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  // Sample data for visualization (replace with real data from your backend)
  const chartData = [
    { name: 'Mon', clockIns: 30, clockOuts: 28 },
    { name: 'Tue', clockIns: 35, clockOuts: 34 },
    { name: 'Wed', clockIns: 40, clockOuts: 38 },
    { name: 'Thu', clockIns: 25, clockOuts: 24 },
    { name: 'Fri', clockIns: 45, clockOuts: 42 },
  ];

  useEffect(() => {
    const savedPrefs = localStorage.getItem(`prefs_${userData.email}`);
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setThemeColor((prefs.themeColor as 'blue' | 'purple' | 'green') || 'blue');
      setIsDarkMode(prefs.isDarkMode || false);
      setFontSize((prefs.fontSize as 'small' | 'medium' | 'large') || 'medium');
      setLanguage((prefs.language as 'en' | 'es') || 'en');
    }
  }, [userData.email]);

  const savePreferences = () => {
    const prefs = { themeColor, isDarkMode, fontSize, language };
    localStorage.setItem(`prefs_${userData.email}`, JSON.stringify(prefs));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now(),
      message: `${userData.email} performed an action`,
      timestamp: new Date().toLocaleString(),
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const addNotification = () => {
    const newNotification: Notification = {
      id: Date.now(),
      message: `New notification for ${userData.role}`,
      role: userData.role,
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const getThemeStyles = (color: 'blue' | 'purple' | 'green'): ThemeStyles => {
    const styles: Record<'blue' | 'purple' | 'green', ThemeStyles> = {
      blue: { bg: '#1976d2', text: '#1976d2', buttonBg: '#1976d2', buttonText: '#fff' },
      purple: { bg: '#7b1fa2', text: '#7b1fa2', buttonBg: '#7b1fa2', buttonText: '#fff' },
      green: { bg: '#388e3c', text: '#388e3c', buttonBg: '#388e3c', buttonText: '#fff' },
    };
    return styles[color];
  };

  const themeStyles = getThemeStyles(themeColor);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Clock Records', icon: <ClockIcon />, path: '/clock-records' },
    { text: 'Preferences', icon: <SettingsIcon />, path: '/preferences' },
    ...(userData.role === 'admin' || userData.role === 'hr'
      ? [{ text: 'Manage CVs', icon: <TimelineIcon />, path: '/manage-cvs' }]
      : []),
  ];

  const userNotifications = notifications.filter((n) => n.role === userData.role);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
            color: isDarkMode ? '#fff' : themeStyles.text,
            borderRight: 'none',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <List>
          <ListSubheader sx={{ bgcolor: 'transparent', color: isDarkMode ? '#fff' : themeStyles.text }}>
            Navigation
          </ListSubheader>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
                },
                '&:hover': {
                  backgroundColor: isDarkMode ? '#444' : '#ececec',
                  transition: 'background-color 0.3s',
                },
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? '#fff' : themeStyles.text }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListSubheader sx={{ bgcolor: 'transparent', color: isDarkMode ? '#fff' : themeStyles.text }}>
            Activity Feed
          </ListSubheader>
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ py: 0.5 }}>
              <ListItemText
                primary={activity.message}
                secondary={activity.timestamp}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: isDarkMode ? '#bbb' : '#666' }}
              />
            </ListItem>
          ))}
          <Button
            variant="contained"
            onClick={addActivity}
            sx={{
              mt: 2,
              mx: 1,
              bgcolor: themeStyles.buttonBg,
              color: themeStyles.buttonText,
              '&:hover': { bgcolor: themeStyles.buttonBg, opacity: 0.9 },
              borderRadius: 2,
            }}
          >
            Add Activity
          </Button>
          <Divider sx={{ my: 1 }} />
          <ListItem
            button
            onClick={onLogout}
            sx={{
              borderRadius: '0 20px 20px 0',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: isDarkMode ? '#444' : '#ececec',
                transition: 'background-color 0.3s',
              },
            }}
          >
            <ListItemIcon sx={{ color: isDarkMode ? '#fff' : themeStyles.text }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Mobile Menu Button and Drawer */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={() => setIsDrawerOpen(true)}
        sx={{ display: { sm: 'none' }, position: 'fixed', top: 8, left: 8, zIndex: 1200 }}
      >
        <MenuIcon sx={{ color: isDarkMode ? '#fff' : themeStyles.text }} />
      </IconButton>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          display: { sm: 'none' },
          [`& .MuiDrawer-paper`]: {
            backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#000',
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setIsDrawerOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
                },
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? '#fff' : themeStyles.text }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          {activities.map((activity) => (
            <ListItem key={activity.id} sx={{ py: 0.5 }}>
              <ListItemText
                primary={activity.message}
                secondary={activity.timestamp}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: isDarkMode ? '#bbb' : '#666' }}
              />
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem
            button
            onClick={() => {
              onLogout();
              setIsDrawerOpen(false);
            }}
            sx={{ color: isDarkMode ? '#fff' : themeStyles.text }}
          >
            <ListItemIcon sx={{ color: isDarkMode ? '#fff' : themeStyles.text }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Header (Top Bar) */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: themeStyles.bg,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: isDarkMode ? '#fff' : '#000', fontWeight: 500 }}
          >
            HR Management System
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: isDarkMode ? '#fff' : '#000' }} />,
              sx: {
                bgcolor: 'white',
                borderRadius: 1,
                mr: 2,
                color: isDarkMode ? '#fff' : '#000',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDarkMode ? '#fff' : '#000',
                },
              },
            }}
            sx={{
              '& .MuiInputBase-input': { color: isDarkMode ? '#fff' : '#000' },
            }}
          />
          <Switch
            checked={isDarkMode}
            onChange={(e) => setIsDarkMode(e.target.checked)}
            inputProps={{ 'aria-label': 'dark mode switch' }}
            sx={{
              '& .MuiSwitch-thumb': { backgroundColor: themeStyles.buttonBg },
              '& .MuiSwitch-track': { backgroundColor: themeStyles.buttonBg },
            }}
          />
          <Typography sx={{ mr: 2, color: isDarkMode ? '#fff' : '#000' }}>Dark Mode</Typography>
          <IconButton sx={{ mr: 1 }} onClick={addNotification}>
            <Badge badgeContent={userNotifications.length} color="error">
              <NotificationsIcon sx={{ color: isDarkMode ? '#fff' : '#000' }} />
            </Badge>
          </IconButton>
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: themeStyles.buttonBg, color: themeStyles.buttonText }}>
              {userData.email[0].toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                bgcolor: isDarkMode ? '#333' : '#fff',
                color: isDarkMode ? '#fff' : '#000',
              },
            }}
          >
            <MenuItem disabled sx={{ color: 'inherit' }}>{userData.email}</MenuItem>
            <MenuItem disabled sx={{ color: 'inherit' }}>Role: {userData.role}</MenuItem>
            <MenuItem
              onClick={() => {
                onLogout();
                handleProfileMenuClose();
              }}
              sx={{ color: 'inherit' }}
            >
              <ExitToAppIcon sx={{ mr: 1, color: isDarkMode ? '#fff' : '#000' }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content (Body) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          backgroundColor: isDarkMode ? '#121212' : '#fafafa',
          color: isDarkMode ? '#fff' : themeStyles.text,
          minHeight: '100vh',
          transition: 'all 0.3s',
          ml: { sm: 240 },
          fontSize: fontSize === 'small' ? '0.8rem' : fontSize === 'large' ? '1.2rem' : '1rem',
        }}
      >
        {/* Notifications Section */}
        {userNotifications.length > 0 && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            {userNotifications.map((notification) => (
              <Typography key={notification.id} sx={{ mb: 1 }}>
                {notification.message}
              </Typography>
            ))}
          </Paper>
        )}

        {/* Dashboard Visualization */}
        {location.pathname === '/dashboard' && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Weekly Clock Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clockIns" fill={themeStyles.bg} name="Clock Ins" />
                <Bar dataKey="clockOuts" fill={isDarkMode ? '#bbb' : '#666'} name="Clock Outs" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        )}

        {children}

        {/* Preferences Section */}
        {location.pathname === '/preferences' && (
          <Paper
            sx={{
              p: 3,
              mt: 4,
              backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography>Theme Color</Typography>
              <Select
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value as 'blue' | 'purple' | 'green')}
                sx={{
                  mt: 1,
                  mr: 2,
                  minWidth: 120,
                  color: isDarkMode ? '#fff' : themeStyles.text,
                  bgcolor: isDarkMode ? '#333' : 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#fff' : themeStyles.text,
                  },
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : themeStyles.text,
                  },
                }}
              >
                <MenuItem value="blue" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Blue
                </MenuItem>
                <MenuItem value="purple" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Purple
                </MenuItem>
                <MenuItem value="green" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Green
                </MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography>Font Size</Typography>
              <Select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
                sx={{
                  mt: 1,
                  mr: 2,
                  minWidth: 120,
                  color: isDarkMode ? '#fff' : themeStyles.text,
                  bgcolor: isDarkMode ? '#333' : 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#fff' : themeStyles.text,
                  },
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : themeStyles.text,
                  },
                }}
              >
                <MenuItem value="small" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Small
                </MenuItem>
                <MenuItem value="medium" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Medium
                </MenuItem>
                <MenuItem value="large" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Large
                </MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography>Language</Typography>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                sx={{
                  mt: 1,
                  mr: 2,
                  minWidth: 120,
                  color: isDarkMode ? '#fff' : themeStyles.text,
                  bgcolor: isDarkMode ? '#333' : 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDarkMode ? '#fff' : themeStyles.text,
                  },
                  '& .MuiSelect-icon': {
                    color: isDarkMode ? '#fff' : themeStyles.text,
                  },
                }}
              >
                <MenuItem value="en" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  English
                </MenuItem>
                <MenuItem value="es" sx={{ color: isDarkMode ? '#fff' : themeStyles.text, bgcolor: isDarkMode ? '#333' : 'white' }}>
                  Spanish
                </MenuItem>
              </Select>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 2 }}>Dark Mode</Typography>
              <Switch
                checked={isDarkMode}
                onChange={(e) => setIsDarkMode(e.target.checked)}
                inputProps={{ 'aria-label': 'dark mode switch' }}
                sx={{
                  '& .MuiSwitch-thumb': { backgroundColor: themeStyles.buttonBg },
                  '& .MuiSwitch-track': { backgroundColor: themeStyles.buttonBg },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={savePreferences}
              sx={{
                mt: 2,
                bgcolor: themeStyles.buttonBg,
                color: themeStyles.buttonText,
                '&:hover': { bgcolor: themeStyles.buttonBg, opacity: 0.9 },
                borderRadius: 2,
              }}
            >
              Save Preferences
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Layout;