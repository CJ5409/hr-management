import React, { useState, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import jsPDF from 'jspdf';
// Import autotable as a side effect
import 'jspdf-autotable';
import axios from 'axios';
// import your user context or props as needed
// import { UserContext } from '../context/UserContext';
import PerformanceAnalysis from './PerformanceAnalysis';

interface DashboardProps {
  userData: {
    email: string;
    role: string;
    department?: string;
    position?: string;
    // add other user fields as needed
  };
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, onLogout }) => {
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

  // PDF Generation Function
  const generatePerformanceReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Employee Performance Report', 20, 20);
    
    // Date and filters
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Department: ${selectedDepartment}`, 20, 45);
    doc.text(`Time Period: ${selectedTime}`, 20, 55);
    
    // Check if autoTable is available, if not create manual table
    if (typeof (doc as any).autoTable === 'function') {
      // Performance data table using autoTable
      const tableData = perfData.departments.map((dept, index) => [
        dept,
        `${perfData.productivity[index]}%`,
        `${perfData.quality[index]}%`,
        `${perfData.attendance[index]}%`
      ]);
      
      (doc as any).autoTable({
        startY: 70,
        head: [['Department', 'Productivity', 'Quality', 'Attendance']],
        body: tableData,
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { top: 20 }
      });
      
      // Summary statistics
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Summary Statistics', 20, finalY);
      
      const avgProductivity = (perfData.productivity.reduce((a, b) => a + b, 0) / perfData.productivity.length).toFixed(1);
      const avgQuality = (perfData.quality.reduce((a, b) => a + b, 0) / perfData.quality.length).toFixed(1);
      const avgAttendance = (perfData.attendance.reduce((a, b) => a + b, 0) / perfData.attendance.length).toFixed(1);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Average Productivity: ${avgProductivity}%`, 20, finalY + 15);
      doc.text(`Average Quality: ${avgQuality}%`, 20, finalY + 25);
      doc.text(`Average Attendance: ${avgAttendance}%`, 20, finalY + 35);
    } else {
      // Fallback: Create table manually
      const startY = 70;
      const colWidths = [60, 30, 30, 30];
      const headers = ['Department', 'Productivity', 'Quality', 'Attendance'];
      
      // Draw headers
      doc.setFillColor(59, 130, 246);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      let x = 20;
      headers.forEach((header, i) => {
        doc.rect(x, startY, colWidths[i], 10, 'F');
        doc.text(header, x + 2, startY + 7);
        x += colWidths[i];
      });
      
      // Draw data rows
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      perfData.departments.forEach((dept, index) => {
        const y = startY + 10 + (index * 8);
        
        // Alternate row colors
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
        }
        
        x = 20;
        doc.text(dept, x + 2, y + 6);
        x += colWidths[0];
        doc.text(`${perfData.productivity[index]}%`, x + 2, y + 6);
        x += colWidths[1];
        doc.text(`${perfData.quality[index]}%`, x + 2, y + 6);
        x += colWidths[2];
        doc.text(`${perfData.attendance[index]}%`, x + 2, y + 6);
      });
      
      // Summary statistics
      const finalY = startY + 10 + (perfData.departments.length * 8) + 20;
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 20, finalY);
      
      const avgProductivity = (perfData.productivity.reduce((a, b) => a + b, 0) / perfData.productivity.length).toFixed(1);
      const avgQuality = (perfData.quality.reduce((a, b) => a + b, 0) / perfData.quality.length).toFixed(1);
      const avgAttendance = (perfData.attendance.reduce((a, b) => a + b, 0) / perfData.attendance.length).toFixed(1);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Average Productivity: ${avgProductivity}%`, 20, finalY + 15);
      doc.text(`Average Quality: ${avgQuality}%`, 20, finalY + 25);
      doc.text(`Average Attendance: ${avgAttendance}%`, 20, finalY + 35);
    }
    
    // Save the PDF
    doc.save(`performance-report-${selectedDepartment.toLowerCase().replace(' ', '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Show success message
    addMessage('Performance report generated successfully!');
  };

  // --- JOBS STATE FOR OPEN POSITIONS ---
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    department: '',
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs');
      setJobs(res.data);
    } catch {
      setJobs([]);
    }
  };

  const handleJobFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobForm({ ...jobForm, [e.target.name]: e.target.value });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobLoading(true);
    setJobError('');
    try {
      const requirementsArr = jobForm.requirements.split(',').map(r => r.trim()).filter(Boolean);
      await axios.post('/api/jobs', { ...jobForm, requirements: requirementsArr });
      setJobModalOpen(false);
      setJobForm({ title: '', description: '', requirements: '', location: '', department: '' });
      fetchJobs();
      addMessage('Job created successfully!');
    } catch {
      setJobError('Failed to create job.');
    } finally {
      setJobLoading(false);
    }
  };

  // --- APPLICATIONS STATE FOR HR REVIEW ---
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data);
    } catch {
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Helper to get job title by jobId
  const getJobTitle = (jobId: any) => {
    const job = jobs.find(j => String(j.id) === String(jobId));
    return job ? job.title : 'Unknown';
  };

  // Add at the top of the Dashboard component, after other useState hooks
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Add at the top of the Dashboard component, after other useState hooks
  const [deferModalOpen, setDeferModalOpen] = useState(false);
  const [deferTarget, setDeferTarget] = useState({ jobId: '', department: '' });
  const [deferAppId, setDeferAppId] = useState(null);
  const [deferLoading, setDeferLoading] = useState(false);

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

  // Add state for users, clock records, and modal
  const [users, setUsers] = useState<any[]>([]);
  const [clockRecords, setClockRecords] = useState<any[]>([]);
  const [selectedClock, setSelectedClock] = useState<any | null>(null);

  // Fetch users and clock records
  useEffect(() => {
    axios.get('/api/users').then(res => setUsers(res.data)).catch(() => setUsers([]));
    axios.get('/api/clock-records').then(res => {
      setClockRecords(res.data.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
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
    }).catch(() => setClockRecords([]));
  }, []);

  // Helper to get user name from email
  const getUserName = (email: string) => {
    const user = users.find(u => u.email === email);
    return user?.name || user?.email || email;
  };

  // Add state for applications and candidate modal
  const [candidatesModalOpen, setCandidatesModalOpen] = useState(false);

  // Fetch applications
  useEffect(() => {
    axios.get('/api/applications').then(res => setApplications(res.data)).catch(() => setApplications([]));
  }, []);

  // Get unique candidates (by email)
  const uniqueCandidates = Array.from(new Set(applications.map(app => app.applicantEmail)));
  const candidateCount = uniqueCandidates.length;
  // Optionally get names if available
  const getCandidateName = (email: string) => {
    const user = users.find(u => u.email === email);
    return user?.name || email;
  };

  // 1. Anonymize candidate display for 'pending' applications for HR users
  // 2. Sort visibleApplications by AI score descending for HR users
  const visibleApplications = userData.role.toLowerCase() === 'hr'
    ? applications
        .filter(app => app.status !== 'hired')
        .sort((a, b) => (b.aiScreening?.details?.score || 0) - (a.aiScreening?.details?.score || 0))
    : applications;

  // 3. Add a simple audit log for HR actions
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const logHRAction = (action: string, app: any) => {
    setAuditLog(logs => [
      { action, candidate: app.applicantName || `Candidate #${app.id}`, email: app.applicantEmail, time: new Date().toLocaleString(), by: userData.email },
      ...logs
    ]);
  };

  // Diversity & Inclusion Metrics
  const departmentCounts = users.reduce((acc, user) => {
    if (user.department) {
      acc[user.department] = (acc[user.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const departmentData: { value: number; name: string }[] = Object.entries(departmentCounts).map(([dept, count]) => ({ value: Number(count), name: dept }));
  const departmentOption = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 0, textStyle: { color: '#4E5969' } },
    series: [{
      name: 'Departments',
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: departmentData
    }]
  };

  // Candidate Appeal Process
  const [appeals, setAppeals] = useState<any[]>([]);
  const [appealsModalOpen, setAppealsModalOpen] = useState(false);
  const fetchAppeals = async () => {
    const res = await axios.get('/api/appeals');
    setAppeals(res.data);
  };
  const resolveAppeal = (idx: number) => {
    setAppeals(a => a.map((ap, i) => i === idx ? { ...ap, status: 'resolved' } : ap));
  };

  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceView, setPerformanceView] = useState<'employees' | 'departments' | 'goals'>('employees');

  return showPerformance ? (
    <PerformanceAnalysis view={performanceView} onBack={() => setShowPerformance(false)} />
  ) : (
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
                  <button className="font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary flex items-center transition-custom" type="button" onClick={() => setShowPerformance(v => !v)}>
                    Performance Analysis
                    <i className="fas fa-chevron-down ml-1 text-xs transition-transform" style={{}}></i>
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
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => { setShowPerformance(true); setPerformanceView('employees'); }}>Employee Metrics</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => { setShowPerformance(true); setPerformanceView('departments'); }}>Department Reports</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={() => { setShowPerformance(true); setPerformanceView('goals'); }}>Goal Tracking</button>
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
                  <button className="block px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={onLogout}><i className="fas fa-sign-out-alt mr-2"></i>Logout</button>
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
              {/* User Profile */}
              <div
                className="relative"
                onMouseEnter={() => setProfileMenuOpen(true)}
                onMouseLeave={() => setProfileMenuOpen(false)}
              >
                <button className="flex items-center space-x-2 focus:outline-none">
                  <img alt="User Profile" className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-primary transition-custom" src="https://design.gemcoder.com/staticResource/echoAiSystemImages/a0e44940c11c252165b3e480ebae9a1b.png" />
                  <span className="hidden md:block font-medium">{userData.email}</span>
                  <i className="fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400 hidden md:block"></i>
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 transition-custom">
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button"><i className="fas fa-user mr-2"></i>Profile</button>
                    <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" type="button"><i className="fas fa-cog mr-2"></i>Settings</button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button className="block px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700" type="button" onClick={onLogout}><i className="fas fa-sign-out-alt mr-2"></i>Logout</button>
                  </div>
                )}
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
            {(userData.role === 'admin' || userData.role === 'hr') && (
              <button
                className="mt-4 md:mt-0 px-5 py-2 bg-primary text-white rounded-lg btn-hover font-semibold flex items-center shadow-lg"
                onClick={() => setJobModalOpen(true)}
              >
                <i className="fas fa-plus mr-2"></i>Create Job
              </button>
            )}
          </div>
        </div>
        {/* Create Job Modal */}
        {jobModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl" onClick={() => setJobModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
                <i className="fas fa-briefcase mr-2"></i>Create New Job
              </h2>
              <form className="space-y-4" onSubmit={handleCreateJob}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-800"
                    name="title"
                    value={jobForm.title}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-800"
                    name="description"
                    value={jobForm.description}
                    onChange={handleJobFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements <span className="text-xs text-gray-400">(comma separated)</span></label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-800"
                    name="requirements"
                    value={jobForm.requirements}
                    onChange={handleJobFormChange}
                    placeholder="e.g. Bachelor degree, 2+ years experience"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-800"
                      name="location"
                      value={jobForm.location}
                      onChange={handleJobFormChange}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-800"
                      name="department"
                      value={jobForm.department}
                      onChange={handleJobFormChange}
                      required
                    />
                  </div>
                </div>
                {jobError && <div className="text-red-500 text-sm">{jobError}</div>}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-4 rounded-lg btn-hover flex items-center justify-center"
                  disabled={jobLoading}
                >
                  {jobLoading ? 'Creating...' : 'Create Job'}
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </form>
            </div>
          </div>
        )}
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Open Positions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Positions</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">{jobs.length}</h3>
                  <p className="text-success text-sm mt-2 flex items-center">
                    <i className="fas fa-arrow-up mr-1"></i>
                  <span>+{jobs.length > 10 ? jobs.length - 10 : 0} from last week</span>
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
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">{candidateCount}</h3>
                <p className="text-danger text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-down mr-1"></i>
                  <span>5 from last week</span>
                </p>
                <button
                  className="mt-2 text-xs text-primary underline hover:text-primary/80 transition"
                  onClick={() => setCandidatesModalOpen(true)}
                >
                  More details
                </button>
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
          {/* Clock In/Out Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div className="w-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Clock In/Out</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {clockTrend.count}
                </h3>
                <p className={`text-${clockTrend.up ? 'success' : 'danger'} text-sm mt-2 flex items-center`}>
                  <i className={`fas fa-arrow-${clockTrend.up ? 'up' : 'down'} mr-1`}></i>
                  <span>{clockTrend.up ? '+' : '-'}{clockTrend.diff} from last week</span>
                </p>
                {/* Recent events list */}
                <div className="mt-4 max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {clockRecords.slice(0, 7).map((rec, idx) => (
                    <button
                      key={rec.id || idx}
                      className="w-full text-left py-2 px-1 hover:bg-primary/5 rounded flex items-center gap-2"
                      onClick={() => setSelectedClock(rec)}
                    >
                      <span className="font-medium text-gray-800 dark:text-white">{getUserName(rec.email)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">clocked {rec.type === 'in' ? 'in' : 'out'}</span>
                      <span className="ml-auto text-xs text-gray-400">{new Date(rec.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </button>
                  ))}
                  {clockRecords.length === 0 && <div className="text-xs text-gray-400 py-2">No clock records</div>}
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-info ml-2">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
            {/* Modal for details */}
            {selectedClock && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-xs w-full mx-4 shadow-2xl relative">
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl" onClick={() => setSelectedClock(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                  <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center">
                    <i className="fas fa-clock mr-2"></i>Clock Event Details
                  </h2>
                  <div className="mb-2">
                    <span className="font-semibold">User:</span> {getUserName(selectedClock.email)}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Type:</span> {selectedClock.type === 'in' ? 'Clock In' : 'Clock Out'}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Time:</span> {new Date(selectedClock.time).toLocaleString()}
                  </div>
                  {selectedClock.address && (
                    <div className="mb-2">
                      <span className="font-semibold">Address:</span> {selectedClock.address}
                    </div>
                  )}
                  {selectedClock.location && (
                    <div className="mb-2">
                      <span className="font-semibold">Location:</span> {selectedClock.location.latitude.toFixed(5)}, {selectedClock.location.longitude.toFixed(5)}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                onClick={generatePerformanceReport}
              >
                Generate Report
              </button>
            </div>
          </div>
          <div className="w-full h-[300px]">
            <ReactECharts option={performanceMetricsOption} style={{ height: 300 }} />
          </div>
        </div>
        {/* Applications & AI Screening Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Job Applications & AI Screening</h2>
            <button className="text-sm text-primary hover:underline transition-custom" onClick={fetchApplications} disabled={applicationsLoading}>
              {applicationsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {applications.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No applications yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Job</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Applicant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">CV</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">AI Rating</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Highlights</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {visibleApplications.map(app => (
                    <tr key={app.id}>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 font-medium">{getJobTitle(app.jobId)}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {userData.role.toLowerCase() === 'hr' && app.status === 'pending' ? (
                          <>
                            <div>{`Candidate #${app.id}`}</div>
                            <div className="text-xs text-gray-400">(anonymized)</div>
                          </>
                        ) : (
                          <>
                            <div>{app.applicantName}</div>
                            <div className="text-xs text-gray-400">{app.applicantEmail}</div>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="space-y-1">
                          <a
                            href={`http://localhost:5001/api/applications/${app.id}/cv`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center text-xs"
                          >
                            <i className="fas fa-file-pdf mr-1"></i>Original CV
                          </a>
                          <a
                            href={`http://localhost:5001/api/applications/${app.id}/ai-highlighted-original`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline flex items-center text-xs"
                          >
                            <i className="fas fa-highlighter mr-1"></i>AI-Highlighted
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowAIModal(true);
                          }}
                          className="text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span className={
                              app.aiScreening?.rating === 'Highly Recommended' ? 'text-green-600 font-bold' :
                              app.aiScreening?.rating === 'Rejected' ? 'text-red-600 font-bold' :
                              'text-yellow-600 font-bold'
                            }>
                              {app.aiScreening?.rating || 'N/A'}
                            </span>
                            {app.aiScreening?.details?.score && (
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                Score: {app.aiScreening.details.score}/100
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{app.aiScreening?.summary}</div>
                          {app.aiScreening?.details?.confidence && (
                            <div className="text-xs text-gray-500 mt-1">
                              Confidence: {app.aiScreening.details.confidence}%
                            </div>
                          )}
                          <div className="text-xs text-primary mt-1">Click to view details →</div>
                        </button>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <div className="space-y-1">
                          {app.aiScreening?.highlights?.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Key Highlights:</div>
                              <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300">
                                {app.aiScreening.highlights.map((h: string, i: number) => <li key={i}>{h}</li>)}
                              </ul>
                            </div>
                          )}
                          {app.aiScreening?.details?.skills?.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Skills:</div>
                              <div className="flex flex-wrap gap-1">
                                {app.aiScreening.details.skills.map((skill: string, i: number) => (
                                  <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          app.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'waiting for onboarding' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'hired' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'withdrawn' ? 'bg-gray-300 text-gray-700' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        {/* Withdrawn: show Delete button */}
                        {app.status === 'withdrawn' && (
                          <button
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                            onClick={async () => {
                              // Optionally call backend to delete
                              await axios.delete(`/api/applications/${app.id}`);
                              setApplications(applications => applications.filter(a => a.id !== app.id));
                              logHRAction('delete_withdrawn', app);
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Defer Modal */}
        {deferModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Defer Candidate</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Select New Job</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-700"
                  value={deferTarget.jobId}
                  onChange={e => setDeferTarget({ ...deferTarget, jobId: e.target.value })}
                >
                  <option value="">-- Select Job --</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Or Enter Department</label>
                <input
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 input-focus bg-white dark:bg-gray-700"
                  placeholder="Department name"
                  value={deferTarget.department}
                  onChange={e => setDeferTarget({ ...deferTarget, department: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  onClick={() => setDeferModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={deferLoading}
                  onClick={async () => {
                    setDeferLoading(true);
                    try {
                      if (deferTarget.jobId) {
                        await axios.patch(`/api/applications/${deferAppId}/defer`, { jobId: deferTarget.jobId });
                      } else if (deferTarget.department) {
                        await axios.patch(`/api/applications/${deferAppId}/defer`, { department: deferTarget.department });
                      }
                      setDeferModalOpen(false);
                      setDeferTarget({ jobId: '', department: '' });
                      setDeferAppId(null);
                      fetchApplications();
                    } finally {
                      setDeferLoading(false);
                    }
                  }}
                >
                  {deferLoading ? 'Deferring...' : 'Defer'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Diversity & Inclusion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Diversity & Inclusion Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Diversity & Inclusion</h2>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={departmentOption} style={{ height: 300 }} />
            </div>
            <div className="mt-4">
              {Array.isArray(departmentData) && departmentData.length > 0 ? (
                departmentData.map((d: { name: string; value: number }) => (
                  <div key={d.name} className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{d.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{d.value}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">No department data available.</div>
              )}
            </div>
          </div>
          {/* ...existing other cards... */}
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

      {/* AI Screening Details Modal */}
      {showAIModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                AI Screening Details - {selectedApplication.applicantName}
              </h3>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Applicant Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Name:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">{selectedApplication.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Email:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">{selectedApplication.applicantEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Job Applied:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">{getJobTitle(selectedApplication.jobId)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Applied Date:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">
                      {new Date(selectedApplication.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Rating */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">AI Assessment</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Overall Rating:</span>
                    <span className={`ml-2 font-bold ${
                      selectedApplication.aiScreening?.rating === 'Highly Recommended' ? 'text-green-600' :
                      selectedApplication.aiScreening?.rating === 'Rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {selectedApplication.aiScreening?.rating}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Score:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">
                      {selectedApplication.aiScreening?.details?.score}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Confidence:</span>
                    <span className="ml-2 text-gray-800 dark:text-white">
                      {selectedApplication.aiScreening?.details?.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              {selectedApplication.aiScreening?.details && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Detailed Analysis</h4>
                  <div className="space-y-3">
                    {selectedApplication.aiScreening.details.education && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">Education:</span>
                        <span className="ml-2 text-gray-800 dark:text-white text-sm">
                          {selectedApplication.aiScreening.details.education}
                        </span>
                      </div>
                    )}
                    {selectedApplication.aiScreening.details.experience && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">Experience:</span>
                        <span className="ml-2 text-gray-800 dark:text-white text-sm">
                          {selectedApplication.aiScreening.details.experience}
                        </span>
                      </div>
                    )}
                    {selectedApplication.aiScreening.details.skills?.length > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">Skills:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedApplication.aiScreening.details.skills.map((skill: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedApplication.aiScreening.details.languages?.length > 0 && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm">Languages:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedApplication.aiScreening.details.languages.map((lang: string, i: number) => (
                            <span key={i} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Analysis & Reasoning */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">AI Analysis & Reasoning</h4>
                <div className="space-y-3">
                  {/* Key Highlights */}
                  {selectedApplication.aiScreening?.highlights?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">✅ Positive Factors:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-200 space-y-1">
                        {selectedApplication.aiScreening.highlights.map((highlight: string, i: number) => (
                          <li key={i} className="text-green-700 dark:text-green-300">{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* AI Reasoning */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">🤖 AI Reasoning:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 p-3 rounded border">
                      {selectedApplication.aiScreening?.rating === 'Highly Recommended' && (
                        <p>This candidate demonstrates exceptional qualifications with relevant education, substantial experience, and strong performance metrics. The combination of technical skills and leadership experience makes them an ideal fit for the position.</p>
                      )}
                      {selectedApplication.aiScreening?.rating === 'Recommended' && (
                        <p>This candidate meets the basic requirements and shows potential. While they may need some development, their background and skills align well with the role requirements.</p>
                      )}
                      {selectedApplication.aiScreening?.rating === 'Rejected' && (
                        <p>This candidate does not meet the minimum requirements for the position. Key gaps include insufficient education level and limited relevant experience that would prevent them from performing effectively in this role.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Keyword Analysis */}
                  <div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">🔍 Keywords Found:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.aiScreening?.details?.skills?.map((skill: string, i: number) => (
                        <span key={i} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border">
                          {skill}
                        </span>
                      ))}
                      {selectedApplication.aiScreening?.details?.languages?.map((lang: string, i: number) => (
                        <span key={i} className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded border">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <a
                  href={`http://localhost:5001/api/applications/${selectedApplication.id}/cv`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors inline-block"
                >
                  <i className="fas fa-file-pdf mr-2"></i>Original CV
                </a>
                <a
                  href={`http://localhost:5001/api/applications/${selectedApplication.id}/ai-highlighted-original`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors inline-block"
                >
                  <i className="fas fa-highlighter mr-2"></i>AI-Highlighted CV
                </a>
                {/* HR Action Buttons - Best Practice */}
                {userData.role.toLowerCase() === 'hr' && selectedApplication.status === 'pending' && (
                  <div className="flex justify-end space-x-2 mb-4">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to HIRE this candidate?')) {
                          await axios.post(`/api/applications/${selectedApplication.id}/hire`);
                          setShowAIModal(false);
                          fetchApplications();
                        }
                      }}
                    >
                      <i className="fas fa-user-check mr-2"></i>Hire
                    </button>
                    <button
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      onClick={() => {
                        setDeferAppId(selectedApplication.id);
                        setDeferModalOpen(true);
                      }}
                    >
                      <i className="fas fa-clock mr-2"></i>Defer
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to REJECT this candidate?')) {
                          await axios.patch(`/api/applications/${selectedApplication.id}/reject`);
                          setShowAIModal(false);
                          fetchApplications();
                        }
                      }}
                    >
                      <i className="fas fa-user-times mr-2"></i>Reject
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Candidates Modal */}
      {candidatesModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-xs w-full mx-4 shadow-2xl relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl" onClick={() => setCandidatesModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-user-plus mr-2"></i>Recent Candidates
            </h2>
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {uniqueCandidates.slice(0, 20).map(email => (
                <div key={email} className="py-2 px-1">
                  <span className="font-medium text-gray-800 dark:text-white">{getCandidateName(email)}</span>
                  <span className="ml-2 text-xs text-gray-500">{email}</span>
                </div>
              ))}
              {uniqueCandidates.length === 0 && <div className="text-xs text-gray-400 py-2">No candidates</div>}
            </div>
          </div>
        </div>
      )}
      {/* Audit Log Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl" onClick={() => setAuditModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-clipboard-list mr-2"></i>Audit Log
            </h2>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {auditLog.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">No actions logged yet.</div>
              ) : (
                auditLog.map((log, idx) => (
                  <div key={idx} className="py-2 px-1">
                    <span className="font-medium text-gray-800 dark:text-white">{log.action.toUpperCase()}</span>
                    <span className="ml-2 text-xs text-gray-500">{log.candidate} ({log.email})</span>
                    <span className="ml-2 text-xs text-gray-400">by {log.by} at {log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Appeals Modal */}
      {appealsModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl" onClick={() => setAppealsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white flex items-center">
              <i className="fas fa-gavel mr-2"></i>Candidate Appeals
            </h2>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {appeals.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">No appeals submitted.</div>
              ) : (
                appeals.map((ap, idx) => (
                  <div key={idx} className="py-2 px-1">
                    <div className="font-medium text-gray-800 dark:text-white">{ap.email} (App ID: {ap.applicationId})</div>
                    <div className="text-xs text-gray-500 mb-1">{ap.reason}</div>
                    <div className="text-xs text-gray-400 mb-1">{new Date(ap.time).toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${ap.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{ap.status}</span>
                      {ap.status !== 'resolved' && (
                        <button className="text-xs text-primary underline" onClick={() => resolveAppeal(idx)}>Mark as Resolved</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* For demo: add a button to simulate a candidate appeal (in the dashboard, for now) */}
      <button className="ml-4 text-xs text-secondary underline" onClick={async () => {
        await axios.post('/api/appeals', { email: userData.email, applicationId: 999, reason: 'I believe my AI score was unfair.' });
        alert('Appeal submitted!');
      }}>Simulate Candidate Appeal</button>
      <button className="ml-4 text-xs text-primary underline" onClick={async () => { await fetchAppeals(); setAppealsModalOpen(true); }}>View Appeals</button>
    </div>
  );
};

export default Dashboard;