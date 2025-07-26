import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import io from 'socket.io-client';
import axios from 'axios';

interface AdminDashboardProps {
  userData: {
    email: string;
    role: string;
    department?: string;
    position?: string;
  };
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userData, onLogout }) => {
  // Dark mode state
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

  // System monitoring period state
  const [monitoringPeriod, setMonitoringPeriod] = useState<'hourly' | 'daily' | 'weekly'>('hourly');
  
  // System health data
  const systemDataMap = {
    hourly: {
      cpuUsage: [45, 52, 38, 58, 65, 55, 72, 68, 75, 62, 78, 70],
      memoryUsage: [60, 65, 58, 70, 75, 68, 80, 72, 78, 65, 82, 70],
      diskUsage: [55, 58, 52, 62, 68, 60, 75, 65, 72, 58, 78, 62],
      networkTraffic: [120, 135, 98, 145, 160, 140, 180, 155, 170, 130, 185, 150]
    },
    daily: {
      cpuUsage: [52, 58, 45, 65, 72, 55, 78, 68, 75, 62, 80, 70, 65, 72],
      memoryUsage: [65, 70, 58, 75, 80, 68, 85, 72, 78, 65, 82, 70, 68, 75],
      diskUsage: [58, 62, 52, 68, 72, 60, 78, 65, 72, 58, 80, 62, 60, 68],
      networkTraffic: [135, 145, 98, 160, 170, 140, 185, 155, 170, 130, 190, 150, 145, 160]
    },
    weekly: {
      cpuUsage: [55, 60, 48, 68, 75, 58, 80, 70, 78, 65, 82, 72, 68, 75, 70, 78],
      memoryUsage: [68, 72, 60, 78, 82, 70, 85, 75, 80, 68, 85, 72, 70, 78, 72, 80],
      diskUsage: [60, 65, 55, 70, 75, 62, 80, 68, 75, 60, 82, 65, 62, 70, 65, 75],
      networkTraffic: [140, 150, 100, 165, 175, 145, 190, 160, 175, 135, 195, 155, 150, 165, 155, 175]
    }
  };

  const currentData = systemDataMap[monitoringPeriod];

  // User management data
  const userStats = {
    totalUsers: 156,
    activeUsers: 142,
    newUsers: 12,
    inactiveUsers: 14
  };

  // System alerts
  const systemAlerts = [
    { type: 'warning', message: 'High CPU usage detected on server-01', time: '5 minutes ago', severity: 'medium' },
    { type: 'error', message: 'Database connection timeout', time: '15 minutes ago', severity: 'high' },
    { type: 'info', message: 'Backup completed successfully', time: '1 hour ago', severity: 'low' },
    { type: 'success', message: 'Security patch applied', time: '2 hours ago', severity: 'low' }
  ];

  // Security events
  const securityEvents = [
    { event: 'Failed login attempt', count: 5, severity: 'medium', time: 'Last hour' },
    { event: 'Suspicious IP detected', count: 2, severity: 'high', time: 'Last 24h' },
    { event: 'Password reset requests', count: 8, severity: 'low', time: 'Last 24h' },
    { event: 'New user registrations', count: 3, severity: 'low', time: 'Last 24h' }
  ];

  // Real-time onboarding requests for IT
  const [onboardingRequests, setOnboardingRequests] = useState<any[]>([]);
  
  // Load existing onboarding requests on mount
  useEffect(() => {
    const loadExistingOnboardingRequests = async () => {
      try {
        const response = await axios.get('/api/applications');
        const applications = response.data;
        const waitingForOnboarding = applications.filter((app: any) => app.status === 'waiting for onboarding');
        const existingRequests = waitingForOnboarding.map((app: any) => ({
          applicantName: app.applicantName,
          applicantEmail: app.applicantEmail,
          jobId: app.jobId,
          applicationId: app.id,
          time: app.auditTrail?.find((log: any) => log.action === 'hire')?.time || app.createdAt
        }));
        setOnboardingRequests(existingRequests);
      } catch (error) {
        console.error('Failed to load existing onboarding requests:', error);
      }
    };
    
    loadExistingOnboardingRequests();
  }, []);
  
  useEffect(() => {
    const socket = io('http://localhost:5001');
    socket.emit('join', 'it');
    socket.on('onboardingRequest', (data) => {
      setOnboardingRequests((prev) => [data, ...prev]);
    });
    return () => { socket.disconnect(); };
  }, []);

  // Add handler for completing onboarding
  const handleCompleteOnboarding = async (applicationId: number, applicantEmail: string, department: string) => {
    try {
      await axios.patch(`/api/applications/${applicationId}/complete-onboarding`, { department });
      setOnboardingRequests((prev) => prev.filter(req => req.applicationId !== applicationId));
      addMessage(`Onboarding completed for ${applicantEmail} as ${department}`);
    } catch {
      addMessage('Failed to complete onboarding.');
    }
  };

  // Department management state
  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');

  // Fetch departments on mount
  useEffect(() => {
    axios.get('/api/departments').then(res => setDepartments(res.data)).catch(() => setDepartments([]));
  }, []);

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) return;
    try {
      const res = await axios.post('/api/departments', { name: newDepartment.trim() });
      setDepartments(res.data);
      setNewDepartment('');
    } catch {
      alert('Failed to add department');
    }
  };

  // Add state for clock records
  const [clockTrend, setClockTrend] = useState<{count: number, diff: number, up: boolean}>({count: 0, diff: 0, up: true});

  // Fetch clock records and calculate trend
  useEffect(() => {
    axios.get('/api/clock-records').then(res => {
      // Calculate this week and last week counts
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfWeek);
      endOfLastWeek.setDate(startOfWeek.getDate() - 1);
      const thisWeek = res.data.filter((r: any) => {
        const t = new Date(r.time);
        return t >= startOfWeek && t <= now;
      });
      const lastWeek = res.data.filter((r: any) => {
        const t = new Date(r.time);
        return t >= startOfLastWeek && t <= endOfLastWeek;
      });
      const diff = thisWeek.length - lastWeek.length;
      setClockTrend({count: thisWeek.length, diff: Math.abs(diff), up: diff >= 0});
    }).catch(() => setClockTrend({count: 0, diff: 0, up: true}));
  }, []);

  // Chart options
  const systemHealthOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['CPU', 'Memory', 'Disk'], textStyle: { color: '#4E5969' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monitoringPeriod === 'hourly' ? Array.from({length: 12}, (_, i) => `${i}:00`) :
            monitoringPeriod === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15', 'Week 16'],
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      splitLine: { lineStyle: { color: '#F2F3F5' } }
    },
    series: [
      {
        name: 'CPU',
        type: 'line',
        data: currentData.cpuUsage,
        itemStyle: { color: '#165DFF' },
        lineStyle: { color: '#165DFF', width: 2 }
      },
      {
        name: 'Memory',
        type: 'line',
        data: currentData.memoryUsage,
        itemStyle: { color: '#52C41A' },
        lineStyle: { color: '#52C41A', width: 2 }
      },
      {
        name: 'Disk',
        type: 'line',
        data: currentData.diskUsage,
        itemStyle: { color: '#FAAD14' },
        lineStyle: { color: '#FAAD14', width: 2 }
      }
    ]
  };

  const networkTrafficOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ 
      data: currentData.networkTraffic, 
      type: 'line', 
      smooth: true, 
      symbol: 'none', 
      lineStyle: { color: '#36CFC9', width: 2 }, 
      areaStyle: { color: 'rgba(54,207,201,0.08)' } 
    }]
  };

  const userDistributionOption = {
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#4E5969' }
    },
    series: [{
      name: 'Users',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: [
        { value: userStats.activeUsers, name: 'Active Users' },
        { value: userStats.inactiveUsers, name: 'Inactive Users' },
        { value: userStats.newUsers, name: 'New Users' }
      ]
    }]
  };

  // Notification system
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const addMessage = (text: string) => {
    const id = Date.now() + Math.random();
    setMessages((msgs) => [...msgs, { id, text }]);
    setTimeout(() => {
      setMessages((msgs) => msgs.filter((msg) => msg.id !== id));
    }, 4000);
  };

  // PDF Generation for System Report
  const generateSystemReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('System Health Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Monitoring Period: ${monitoringPeriod}`, 20, 45);
    doc.text(`Admin: ${userData.email}`, 20, 55);
    
    // System summary table
    const avgCpu = (currentData.cpuUsage.reduce((a, b) => a + b, 0) / currentData.cpuUsage.length).toFixed(1);
    const avgMemory = (currentData.memoryUsage.reduce((a, b) => a + b, 0) / currentData.memoryUsage.length).toFixed(1);
    const avgDisk = (currentData.diskUsage.reduce((a, b) => a + b, 0) / currentData.diskUsage.length).toFixed(1);
    
    const tableData = [
      ['Average CPU Usage', `${avgCpu}%`],
      ['Average Memory Usage', `${avgMemory}%`],
      ['Average Disk Usage', `${avgDisk}%`],
      ['Total Users', userStats.totalUsers.toString()],
      ['Active Users', userStats.activeUsers.toString()],
      ['System Alerts', systemAlerts.length.toString()]
    ];
    
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable({
        startY: 70,
        head: [['Metric', 'Value']],
        body: tableData,
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }
    
    doc.save(`system-report-${monitoringPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    addMessage('System report generated successfully!');
  };

  return (
    <div className="font-inter bg-gray-50 text-dark dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-custom">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 nav-shadow z-50 transition-custom">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-server text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-primary hidden md:block">SystemAdmin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-custom"
                onClick={() => setDarkMode((d) => !d)}
              >
                <i className={`fas ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon text-gray-600'}`}></i>
              </button>
              <div className="flex items-center space-x-2">
                <img alt="User Profile" className="w-8 h-8 rounded-full object-cover" src="https://design.gemcoder.com/staticResource/echoAiSystemImages/a0e44940c11c252165b3e480ebae9a1b.png" />
                <span className="hidden md:block font-medium">{userData.email}</span>
              </div>
              <button
                className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-custom flex items-center"
                type="button"
                onClick={onLogout}
              >
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 md:pt-36 pb-16">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800 dark:text-white">System Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {userData.email}. Here's your system overview.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* CPU Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">CPU Usage</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {(currentData.cpuUsage.reduce((a, b) => a + b, 0) / currentData.cpuUsage.length).toFixed(1)}%
                </h3>
                <p className="text-warning text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+5% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <i className="fas fa-microchip text-xl"></i>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Memory Usage</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {(currentData.memoryUsage.reduce((a, b) => a + b, 0) / currentData.memoryUsage.length).toFixed(1)}%
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-down mr-1"></i>
                  <span>-2% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <i className="fas fa-memory text-xl"></i>
              </div>
            </div>
          </div>

          {/* Network Traffic */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Network Traffic</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {(currentData.networkTraffic.reduce((a, b) => a + b, 0) / currentData.networkTraffic.length).toFixed(0)} MB/s
                </h3>
                <p className="text-info text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+8% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-info">
                <i className="fas fa-network-wired text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={networkTrafficOption} style={{ height: 40 }} />
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Users</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {userStats.activeUsers}
                </h3>
                <p className="text-primary text-sm mt-2 flex items-center">
                  <i className="fas fa-users mr-1"></i>
                  <span>of {userStats.totalUsers} total</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fas fa-users text-xl"></i>
              </div>
            </div>
          </div>
          {/* Clock In/Out Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Clock In/Out</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {clockTrend.count}
                </h3>
                <p className={`text-${clockTrend.up ? 'success' : 'danger'} text-sm mt-2 flex items-center`}>
                  <i className={`fas fa-arrow-${clockTrend.up ? 'up' : 'down'} mr-1`}></i>
                  <span>{clockTrend.up ? '+' : '-'}{clockTrend.diff} from last week</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-info">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Health Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">System Health</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${monitoringPeriod === 'hourly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setMonitoringPeriod('hourly')}
                >
                  Hourly
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${monitoringPeriod === 'daily' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setMonitoringPeriod('daily')}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${monitoringPeriod === 'weekly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setMonitoringPeriod('weekly')}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={systemHealthOption} style={{ height: 300 }} />
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">User Distribution</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={userDistributionOption} style={{ height: 300 }} />
            </div>
          </div>
        </div>

        {/* System Alerts & Security Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* System Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">System Alerts</h2>
              <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('View all alerts coming soon!')}>View All</button>
            </div>
            <div className="space-y-4">
              {systemAlerts.map((alert, idx) => (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" key={idx}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.type === 'error' ? 'bg-danger/10 text-danger' :
                    alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                    alert.type === 'success' ? 'bg-success/10 text-success' :
                    'bg-info/10 text-info'
                  }`}>
                    <i className={`fas ${
                      alert.type === 'error' ? 'fa-exclamation-triangle' :
                      alert.type === 'warning' ? 'fa-exclamation-circle' :
                      alert.type === 'success' ? 'fa-check-circle' :
                      'fa-info-circle'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.severity === 'high' ? 'bg-danger/10 text-danger' :
                    alert.severity === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Security Events</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="space-y-4">
              {securityEvents.map((event, idx) => (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" key={idx}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.severity === 'high' ? 'bg-danger/10 text-danger' :
                      event.severity === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-info/10 text-info'
                    }`}>
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{event.event}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{event.count}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.severity === 'high' ? 'bg-danger/10 text-danger' :
                      event.severity === 'medium' ? 'bg-warning/10 text-warning' :
                      'bg-info/10 text-info'
                    }`}>
                      {event.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">System Reports</h2>
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-custom mt-4 md:mt-0"
              onClick={generateSystemReport}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Generate System Report
            </button>
          </div>
        </div>

        {/* Onboarding Requests Section */}
        {onboardingRequests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">New Onboarding Requests</h2>
            <ul className="space-y-3">
              {onboardingRequests.map((req, idx) => (
                <li key={idx} className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-b-0">
                  <div>
                    <span className="font-semibold text-primary">{req.applicantName}</span> &lt;<span className="text-gray-600 dark:text-gray-300">{req.applicantEmail}</span>&gt;
                    <span className="ml-2 text-xs text-gray-400">Job ID: {req.jobId}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(req.time).toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <select
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                        defaultValue="HR"
                        id={`department-select-${req.applicationId}`}
                      >
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                      </select>
                      <button
                        className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm"
                        onClick={() => {
                          const department = (document.getElementById(`department-select-${req.applicationId}`) as HTMLSelectElement)?.value || 'HR';
                          handleCompleteOnboarding(req.applicationId, req.applicantEmail, department);
                        }}
                      >
                        Complete Onboarding
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Department Management Section */}
        <section className="my-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Department Management</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={newDepartment}
              onChange={e => setNewDepartment(e.target.value)}
              placeholder="New department name"
              className="border rounded px-2 py-1 mr-2"
            />
            <button
              onClick={handleAddDepartment}
              className="bg-primary text-white px-4 py-1 rounded hover:bg-primary/90 transition"
            >
              Add Department
            </button>
          </div>
          <ul className="list-disc pl-6">
            {departments.map(dep => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </section>

        {/* Testing Section - Reset Carol Wong for Onboarding Test */}
        <section className="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-xl font-bold mb-2 text-yellow-800 dark:text-yellow-200">Testing Tools</h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Reset Carol Wong's application to test the hire → onboarding flow
          </p>
          <button
            onClick={async () => {
              try {
                // Reset Carol Wong's application (ID 7) to 'pending' status
                await axios.patch('/api/applications/7', { status: 'pending' });
                addMessage('Carol Wong application reset to pending. HR can now hire her to trigger onboarding.');
              } catch (error) {
                addMessage('Failed to reset Carol Wong application.');
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            Reset Carol Wong Application
          </button>
        </section>
      </main>

      {/* Notification Feed */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white dark:bg-gray-800 border border-primary/30 rounded-lg shadow-lg px-4 py-3 flex items-center space-x-3 animate-fade-in">
            <span className="text-gray-800 dark:text-white">{msg.text}</span>
            <button className="ml-2 text-primary hover:underline text-xs" onClick={() => setMessages(msgs => msgs.filter(m => m.id !== msg.id))}>Dismiss</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard; 