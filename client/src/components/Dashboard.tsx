import React, { useState, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
// import your user context or props as needed
// import { UserContext } from '../context/UserContext';

interface DashboardProps {
  userData: {
    email: string;
    role: string;
    department?: string;
    position?: string;
    // add other user fields as needed
  };
}

const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
  // Example: const { userData } = useContext(UserContext);
  // You can use userData.role to conditionally render sections

  // Example chart options for ECharts
  // Recruitment funnel period state and mock data
  const [funnelPeriod, setFunnelPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const funnelDataMap = {
    monthly: [
      { value: 320, name: 'Leads' },
      { value: 245, name: 'Qualified' },
      { value: 180, name: 'Proposal' },
      { value: 120, name: 'Negotiation' },
      { value: 85, name: 'Closed Won' },
      { value: 45, name: 'Revenue' },
    ],
    quarterly: [
      { value: 900, name: 'Leads' },
      { value: 700, name: 'Qualified' },
      { value: 540, name: 'Proposal' },
      { value: 350, name: 'Negotiation' },
      { value: 260, name: 'Closed Won' },
      { value: 120, name: 'Revenue' },
    ],
    yearly: [
      { value: 3600, name: 'Leads' },
      { value: 2800, name: 'Qualified' },
      { value: 2100, name: 'Proposal' },
      { value: 1400, name: 'Negotiation' },
      { value: 950, name: 'Closed Won' },
      { value: 500, name: 'Revenue' },
    ],
  };
  const funnelOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: {
        color: '#4E5969',
      },
    },
    series: [
      {
        name: 'Recruitment',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 16,
          },
        },
        data: funnelDataMap[funnelPeriod],
      },
    ],
  };
  // Mini chart options for metric cards
  const openPositionsChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ data: [2, 3, 4, 6, 8, 10, 12], type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#165DFF', width: 2 }, areaStyle: { color: 'rgba(22,93,255,0.08)' } }],
  };
  const candidatesChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ data: [150, 148, 147, 146, 145, 144, 148], type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#36CFC9', width: 2 }, areaStyle: { color: 'rgba(54,207,201,0.08)' } }],
  };
  const interviewsChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ data: [28, 30, 32, 34, 36, 35, 36], type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#FAAD14', width: 2 }, areaStyle: { color: 'rgba(250,173,20,0.08)' } }],
  };
  const hiresChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ data: [1, 2, 2, 3, 4, 5, 5], type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#52C41A', width: 2 }, areaStyle: { color: 'rgba(82,196,26,0.08)' } }],
  };
  // Recruitment funnel (already present as funnelOption)
  // Department distribution pie chart
  const departmentDistributionOption = {
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: { color: '#4E5969' },
    },
    series: [{
      name: 'Employees',
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: 35, name: 'Engineering' },
        { value: 20, name: 'Marketing' },
        { value: 15, name: 'Design' },
        { value: 10, name: 'HR' },
        { value: 12, name: 'Finance' },
        { value: 8, name: 'Operations' },
      ],
    }],
  };
  // Performance metrics bar chart
  // Internal IM-style notification feed state
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const addMessage = (text: string) => {
    const id = Date.now() + Math.random();
    setMessages((msgs) => [...msgs, { id, text }]);
    setTimeout(() => {
      setMessages((msgs) => msgs.filter((msg) => msg.id !== id));
    }, 4000);
  };
  const dismissMessage = (id: number) => {
    setMessages((msgs) => msgs.filter((msg) => msg.id !== id));
  };

  // Performance chart interactivity
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedTime, setSelectedTime] = useState('Last Quarter');
  const getPerformanceData = (department: string) => {
    const data: Record<string, { productivity: number[]; quality: number[]; attendance: number[]; departments: string[] }> = {
      'All Departments': {
        productivity: [85, 78, 90, 82, 75, 88],
        quality: [75, 82, 88, 78, 85, 70],
        attendance: [95, 92, 88, 98, 96, 90],
        departments: ['Engineering', 'Marketing', 'Design', 'HR', 'Finance', 'Operations'],
      },
      Engineering: {
        productivity: [85], quality: [75], attendance: [95], departments: ['Engineering'] },
      Marketing: {
        productivity: [78], quality: [82], attendance: [92], departments: ['Marketing'] },
      Design: {
        productivity: [90], quality: [88], attendance: [88], departments: ['Design'] },
      HR: {
        productivity: [82], quality: [78], attendance: [98], departments: ['HR'] },
      Finance: {
        productivity: [75], quality: [85], attendance: [96], departments: ['Finance'] },
      Operations: {
        productivity: [88], quality: [70], attendance: [90], departments: ['Operations'] },
    };
    return data[department] || data['All Departments'];
  };
  const perfData = getPerformanceData(selectedDepartment);
  const performanceMetricsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Productivity', 'Quality', 'Attendance'], textStyle: { color: '#4E5969' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    yAxis: {
      type: 'category',
      data: perfData.departments,
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      splitLine: { lineStyle: { color: '#F2F3F5' } },
    },
    series: [
      { name: 'Productivity', type: 'bar', data: perfData.productivity },
      { name: 'Quality', type: 'bar', data: perfData.quality },
      { name: 'Attendance', type: 'bar', data: perfData.attendance },
    ],
  };

  // Dropdown menu state and timeout refs
  const [resumeMenuOpen, setResumeMenuOpen] = useState(false);
  const [performanceMenuOpen, setPerformanceMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const performanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Font size state and logic
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('dashboardFontSize') as 'sm' | 'md' | 'lg') || 'md';
  });
  const fontSizeClass = fontSize === 'sm' ? 'text-[90%]' : fontSize === 'lg' ? 'text-[112.5%]' : 'text-[100%]';
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const fontMenuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFontMenuEnter = () => {
    if (fontMenuTimeout.current) clearTimeout(fontMenuTimeout.current);
    setFontMenuOpen(true);
  };
  const handleFontMenuLeave = () => {
    fontMenuTimeout.current = setTimeout(() => setFontMenuOpen(false), 150);
  };
  const handleFontSizeSelect = (size: 'sm' | 'md' | 'lg') => {
    setFontSize(size);
    localStorage.setItem('dashboardFontSize', size);
    setFontMenuOpen(false);
  };

  // Feedback modal state
  // Removed unused modalOpen state and closeModal function

  // Recent Activities mock data
  const recentActivities = [
    {
      icon: 'fa-file-upload',
      color: 'primary',
      text: 'Uploaded 12 resumes for Senior Developer position',
      time: '2 hours ago',
    },
    {
      icon: 'fa-check-circle',
      color: 'success',
      text: 'John Doe was hired as Marketing Manager',
      time: 'Yesterday',
    },
    {
      icon: 'fa-calendar-check',
      color: 'warning',
      text: 'Scheduled interview with Sarah Johnson',
      time: '2 days ago',
    },
    {
      icon: 'fa-user-times',
      color: 'danger',
      text: 'Robert Chen rejected our offer',
      time: '3 days ago',
    },
    {
      icon: 'fa-file-alt',
      color: 'secondary',
      text: 'Generated Q2 hiring report',
      time: 'Last week',
    },
  ];
  // Upcoming Interviews mock data
  const upcomingInterviews = [
    {
      name: 'Sarah Johnson',
      role: 'Senior Developer',
      avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/b62005686a7c048273765a7c1a3503f4.png',
      type: 'Technical Interview',
      typeColor: 'blue',
      duration: 45,
      time: 'Today, 10:30 AM',
      location: 'Zoom Meeting',
      actions: [
        { label: 'Join', color: 'primary' },
        { label: 'Reschedule', color: 'gray' },
      ],
    },
    {
      name: 'Michael Brown',
      role: 'Marketing Manager',
      avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/658ca5850a0013836298f200504f96a5.png',
      type: 'HR Interview',
      typeColor: 'purple',
      duration: 30,
      time: 'Today, 2:00 PM',
      location: 'Conference Room A',
      actions: [
        { label: 'Confirm', color: 'primary' },
        { label: 'Details', color: 'gray' },
      ],
    },
    {
      name: 'Emily Davis',
      role: 'UX Designer',
      avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/9d7758b9f861d85d6f445ad117d88f85.png',
      type: 'Portfolio Review',
      typeColor: 'green',
      duration: 60,
      time: 'Tomorrow, 11:00 AM',
      location: 'Zoom Meeting',
      actions: [
        { label: 'Send Link', color: 'primary' },
        { label: 'Reschedule', color: 'gray' },
      ],
    },
  ];

  // --- DARK MODE LOGIC ---
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // --- CHATBOX STATE & MOCK DATA ---
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState<'recent' | 'search' | 'helpdesk'>('recent');
  const [chatSearch, setChatSearch] = useState('');
  const [unreadCount] = useState(2); // mock: 2 unread messages
  // Mock employees
  const employees = [
    { id: 1, name: 'Sarah Johnson', avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/b62005686a7c048273765a7c1a3503f4.png', department: 'Engineering' },
    { id: 2, name: 'Michael Brown', avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/658ca5850a0013836298f200504f96a5.png', department: 'Marketing' },
    { id: 3, name: 'Emily Davis', avatar: 'https://design.gemcoder.com/staticResource/echoAiSystemImages/9d7758b9f861d85d6f445ad117d88f85.png', department: 'Design' },
    { id: 4, name: 'IT Helpdesk', avatar: 'https://cdn-icons-png.flaticon.com/512/190/190411.png', department: 'IT' },
  ];
  // Mock recent chats
  const recentChats = [
    { id: 1, name: 'Sarah Johnson', lastMsg: 'Can you review my leave request?', time: '2m ago', unread: true, avatar: employees[0].avatar },
    { id: 2, name: 'Michael Brown', lastMsg: 'Thanks for the update!', time: '1h ago', unread: false, avatar: employees[1].avatar },
  ];
  // Mock helpdesk messages
  const helpdeskMsgs = [
    { from: 'IT Helpdesk', text: 'How can we assist you today?', time: 'now' },
    { from: 'me', text: 'My laptop is slow.', time: 'just now' },
  ];

  return (
    <div className={`font-inter bg-gray-50 text-dark dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-custom ${fontSizeClass}`}>
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 nav-shadow z-50 transition-custom">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-users text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-primary hidden md:block">HRInsight</span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button className="font-medium text-primary border-b-2 border-primary pb-1" type="button">Dashboard</button>
              {/* Role-based nav items */}
              {(userData.role === 'admin' || userData.role === 'hr') && (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
                    setResumeMenuOpen(true);
                  }}
                  onMouseLeave={() => {
                    resumeTimeout.current = setTimeout(() => setResumeMenuOpen(false), 200);
                  }}
                >
                  <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary flex items-center transition-custom" type="button">
                    Resume Screening<i className="fas fa-chevron-down ml-1 text-xs transition-transform" style={{ transform: resumeMenuOpen ? 'rotate(180deg)' : undefined }}></i>
                  </button>
                  <div
                    className={`absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-custom${resumeMenuOpen ? '' : ' hidden'}`}
                    onMouseEnter={() => {
                      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
                      setResumeMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      resumeTimeout.current = setTimeout(() => setResumeMenuOpen(false), 200);
                    }}
                  >
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Upload Resumes</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Screening Results</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Shortlisted Candidates</button>
                  </div>
                </div>
              )}
              {(userData.role === 'admin' || userData.role === 'hr' || userData.role === 'manager') && (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    if (performanceTimeout.current) clearTimeout(performanceTimeout.current);
                    setPerformanceMenuOpen(true);
                  }}
                  onMouseLeave={() => {
                    performanceTimeout.current = setTimeout(() => setPerformanceMenuOpen(false), 200);
                  }}
                >
                  <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary flex items-center transition-custom" type="button">
                    Performance Analysis<i className="fas fa-chevron-down ml-1 text-xs transition-transform" style={{ transform: performanceMenuOpen ? 'rotate(180deg)' : undefined }}></i>
                  </button>
                  <div
                    className={`absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-custom${performanceMenuOpen ? '' : ' hidden'}`}
                    onMouseEnter={() => {
                      if (performanceTimeout.current) clearTimeout(performanceTimeout.current);
                      setPerformanceMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      performanceTimeout.current = setTimeout(() => setPerformanceMenuOpen(false), 200);
                    }}
                  >
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Employee Metrics</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Department Reports</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button">Goal Tracking</button>
                  </div>
                </div>
              )}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (settingsTimeout.current) clearTimeout(settingsTimeout.current);
                  setSettingsMenuOpen(true);
                }}
                onMouseLeave={() => {
                  settingsTimeout.current = setTimeout(() => setSettingsMenuOpen(false), 200);
                }}
              >
                <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary flex items-center transition-custom" type="button">
                  Settings<i className="fas fa-chevron-down ml-1 text-xs transition-transform" style={{ transform: settingsMenuOpen ? 'rotate(180deg)' : undefined }}></i>
                </button>
                <div
                  className={`absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-custom${settingsMenuOpen ? '' : ' hidden'}`}
                  onMouseEnter={() => {
                    if (settingsTimeout.current) clearTimeout(settingsTimeout.current);
                    setSettingsMenuOpen(true);
                  }}
                  onMouseLeave={() => {
                    settingsTimeout.current = setTimeout(() => setSettingsMenuOpen(false), 200);
                  }}
                >
                  <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => addMessage('Profile feature coming soon!')}><i className="fas fa-user mr-2"></i>Profile</button>
                  <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => addMessage('Settings feature coming soon!')}><i className="fas fa-cog mr-2"></i>Settings</button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button className="block px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => addMessage('You have been logged out!')}><i className="fas fa-sign-out-alt mr-2"></i>Logout</button>
                </div>
              </div>
            </nav>
            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-custom"
                id="theme-toggle"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Toggle dark mode"
              >
                <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-600'}`}></i>
              </button>
              {/* Font Size Toggle (Hover Menu) */}
              <div
                className="relative group"
                onMouseEnter={handleFontMenuEnter}
                onMouseLeave={handleFontMenuLeave}
              >
                <button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-custom"
                  title={`Font size: ${fontSize === 'sm' ? 'Small' : fontSize === 'md' ? 'Medium' : 'Large'}`}
                  aria-haspopup="true"
                  aria-expanded={fontMenuOpen}
                >
                  <i className="fas fa-text-height text-gray-600 dark:text-gray-300"></i>
                  <span className="sr-only">Font size menu</span>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 transition-custom${fontMenuOpen ? '' : ' hidden'}`}
                  onMouseEnter={handleFontMenuEnter}
                  onMouseLeave={handleFontMenuLeave}
                >
                  <button
                    className={`block w-full text-left px-4 py-1 text-sm ${fontSize === 'sm' ? 'font-medium text-primary bg-gray-50 dark:bg-gray-700 dark:text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => handleFontSizeSelect('sm')}
                  >
                    Small
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-1 text-sm ${fontSize === 'md' ? 'font-medium text-primary bg-gray-50 dark:bg-gray-700 dark:text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => handleFontSizeSelect('md')}
                  >
                    Medium
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-1 text-sm ${fontSize === 'lg' ? 'font-medium text-primary bg-gray-50 dark:bg-gray-700 dark:text-primary' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => handleFontSizeSelect('lg')}
                  >
                    Large
                  </button>
                </div>
              </div>
              {/* Feedback Button */}
              <button className="hidden md:flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-custom" onClick={() => addMessage('Feedback feature coming soon!')}>
                <i className="fas fa-comment-dots"></i>
                <span>Feedback</span>
              </button>
              {/* User Profile */}
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <img alt="User Profile" className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-primary transition-custom" src="https://design.gemcoder.com/staticResource/echoAiSystemImages/a0e44940c11c252165b3e480ebae9a1b.png" />
                  <span className="hidden md:block font-medium">{userData.email}</span>
                  <i className="fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400 hidden md:block"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 hidden group-hover:block transition-custom">
                  <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button"><i className="fas fa-user mr-2"></i>Profile</button>
                  <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button"><i className="fas fa-cog mr-2"></i>Settings</button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button className="block px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700" type="button"><i className="fas fa-sign-out-alt mr-2"></i>Logout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 md:pt-36 pb-16">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800 dark:text-white">HR Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {userData.email}. Here's your HR overview for today.</p>
            </div>
            {/* Add more dynamic widgets/buttons here as needed */}
          </div>
          {/* Add metrics, charts, and role-based content here */}
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Open Positions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Positions</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">12</h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>2 from last week</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fas fa-briefcase text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={openPositionsChartOption} style={{ height: 40 }} />
            </div>
          </div>
          {/* Candidates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Candidates</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">148</h3>
                <p className="text-danger text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-down mr-1"></i>
                  <span>5 from last week</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <i className="fas fa-user-plus text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={candidatesChartOption} style={{ height: 40 }} />
            </div>
          </div>
          {/* Interviews */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Interviews</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">36</h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>8 from last week</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <i className="fas fa-comments text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={interviewsChartOption} style={{ height: 40 }} />
            </div>
          </div>
          {/* Hires */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Hires</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">5</h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>3 from last week</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <i className="fas fa-user-check text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={hiresChartOption} style={{ height: 40 }} />
            </div>
          </div>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recruitment Funnel Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recruitment Funnel</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${funnelPeriod === 'monthly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setFunnelPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${funnelPeriod === 'quarterly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setFunnelPeriod('quarterly')}
                >
                  Quarterly
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${funnelPeriod === 'yearly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setFunnelPeriod('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="w-full h-[450px]">
              <ReactECharts option={funnelOption} style={{ height: 450 }} />
            </div>
          </div>
          {/* Department Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Department Distribution</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[450px]">
              <ReactECharts option={departmentDistributionOption} style={{ height: 450 }} />
            </div>
          </div>
        </div>
        {/* Recent Activities & Upcoming Interviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activities</h2>
              <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('View all activities coming soon!')}>View All</button>
            </div>
            <div className="space-y-5">
              {recentActivities.map((activity, idx) => (
                <div className="flex space-x-4" key={idx}>
                  <div className={`w-10 h-10 rounded-full bg-${activity.color}/10 flex items-center justify-center text-${activity.color} flex-shrink-0`}>
                    <i className={`fas ${activity.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{activity.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Upcoming Interviews */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Upcoming Interviews</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select className="appearance-none bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-custom">
                    <option>All Positions</option>
                    <option>Senior Developer</option>
                    <option>Marketing Manager</option>
                    <option>UX Designer</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none"></i>
                </div>
                <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('View calendar coming soon!')}>View Calendar</button>
              </div>
            </div>
            <div className="space-y-4">
              {upcomingInterviews.map((interview, idx) => (
                <div className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 transition-custom" key={idx}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4">
                      <img alt="Candidate" className="w-12 h-12 rounded-full object-cover" src={interview.avatar} />
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white">{interview.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{interview.role}</p>
                        <div className="flex items-center mt-1 space-x-3">
                          <span className={`text-xs bg-${interview.typeColor}-50 dark:bg-${interview.typeColor}-900/30 text-${interview.typeColor}-600 dark:text-${interview.typeColor}-400 px-2 py-0.5 rounded-full`}>
                            {interview.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <i className="fas fa-clock mr-1"></i>
                            {interview.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <i className="fas fa-calendar text-gray-400"></i>
                        <span>{interview.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <i className="fas fa-map-marker-alt text-gray-400"></i>
                        <span>{interview.location}</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        {interview.actions.map((action, aidx) => (
                          <button
                            key={aidx}
                            className={`px-3 py-1 text-xs ${action.color === 'primary' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} rounded-lg hover:bg-primary/90 transition-custom`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-custom" onClick={() => addMessage('View all interviews coming soon!')}>View All Interviews</button>
          </div>
        </div>
        {/* Performance Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Employee Performance</h2>
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <div className="relative">
                <select
                  id="department-select"
                  className="appearance-none bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-custom"
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                >
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Design</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Operations</option>
                </select>
                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none"></i>
              </div>
              <div className="relative">
                <select
                  className="appearance-none bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-custom"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                >
                  <option>Last Quarter</option>
                  <option>This Quarter</option>
                  <option>Last Month</option>
                  <option>This Month</option>
                </select>
                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none"></i>
              </div>
              <button
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-custom"
                onClick={() => addMessage('Report generated!')}
              >
                Generate Report
              </button>
            </div>
          </div>
          <div className="w-full h-[300px]">
            <ReactECharts option={performanceMetricsOption} style={{ height: 300 }} />
          </div>
        </div>
        {/* ...rest of the dashboard content, metrics, charts, activities, etc. ... */}
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-users text-white text-sm"></i>
              </div>
              <span className="text-sm font-bold text-primary">HRInsight</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <button className="hover:text-primary dark:hover:text-primary transition-custom" type="button" onClick={() => addMessage('Privacy Policy feature coming soon!')}>Privacy Policy</button>
              <button className="hover:text-primary dark:hover:text-primary transition-custom" type="button" onClick={() => addMessage('Terms of Service feature coming soon!')}>Terms of Service</button>
              <button className="hover:text-primary dark:hover:text-primary transition-custom" type="button" onClick={() => addMessage('Help Center feature coming soon!')}>Help Center</button>
              <button className="hover:text-primary dark:hover:text-primary transition-custom" type="button" onClick={() => addMessage('Contact Us feature coming soon!')}>Contact Us</button>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">© 2023 HRInsight. All rights reserved.</div>
          </div>
        </div>
      </footer>
      {/* Feedback Modal */}
      {/* Removed unused modal JSX since modalMessage is no longer used */}
      {/* Internal IM Notification Feed */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white dark:bg-gray-800 border border-primary/30 rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 animate-fade-in">
            <span className="text-gray-800 dark:text-white">{msg.text}</span>
            <button className="ml-2 text-primary hover:underline text-xs" onClick={() => dismissMessage(msg.id)}>Dismiss</button>
          </div>
        ))}
      </div>

      {/* --- CHATBOX FLOATING BUTTON & PANEL --- */}
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          className="relative w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-custom focus:outline-none"
          onClick={() => setChatOpen((open) => !open)}
          aria-label="Open chat"
        >
          <i className="fas fa-comments text-2xl"></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full px-1.5 py-0.5 border-2 border-white dark:border-gray-900">{unreadCount}</span>
          )}
        </button>
        {/* Chatbox panel */}
        {chatOpen && (
          <div className="w-96 max-w-[95vw] h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-primary/30 flex flex-col fixed bottom-24 right-0 animate-fade-in overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button className={`flex-1 py-3 text-sm font-medium ${chatTab === 'recent' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setChatTab('recent')}>Recent</button>
              <button className={`flex-1 py-3 text-sm font-medium ${chatTab === 'search' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setChatTab('search')}>Search</button>
              <button className={`flex-1 py-3 text-sm font-medium ${chatTab === 'helpdesk' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setChatTab('helpdesk')}>IT Helpdesk</button>
            </div>
            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
              {chatTab === 'recent' && (
                <div>
                  {recentChats.length === 0 ? (
                    <div className="text-center text-gray-400 mt-8">No recent conversations</div>
                  ) : (
                    <ul>
                      {recentChats.map((chat) => (
                        <li key={chat.id} className="flex items-center space-x-3 py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800 dark:text-white truncate">{chat.name}</span>
                              <span className="text-xs text-gray-400">{chat.time}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-300 truncate">{chat.lastMsg}</div>
                          </div>
                          {chat.unread && <span className="w-2 h-2 bg-danger rounded-full"></span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {chatTab === 'search' && (
                <div>
                  <input
                    type="text"
                    className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Search employees..."
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                  />
                  <ul>
                    {employees.filter(emp => emp.name.toLowerCase().includes(chatSearch.toLowerCase())).map(emp => (
                      <li key={emp.id} className="flex items-center space-x-3 py-2 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">{emp.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">{emp.department}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {chatTab === 'helpdesk' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto mb-2">
                    {helpdeskMsgs.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-[70%] px-3 py-2 rounded-lg ${msg.from === 'me' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <input type="text" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Type your message..." />
                    <button className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-custom">Send</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;