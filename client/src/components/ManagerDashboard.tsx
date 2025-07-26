import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ManagerDashboardProps {
  userData: {
    email: string;
    role: string;
    department?: string;
    position?: string;
    storeId?: string;
    region?: string;
  };
  onLogout?: () => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ userData }) => {
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

  // Store performance period state
  const [storePeriod, setStorePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Store performance data
  const storeDataMap = {
    daily: {
      sales: [8500, 9200, 7800, 10500, 11200, 9800, 12500],
      footTraffic: [120, 135, 98, 145, 160, 140, 180],
      staffHours: [45, 48, 42, 52, 55, 50, 58],
      customerSatisfaction: [4.2, 4.5, 4.1, 4.6, 4.7, 4.3, 4.8]
    },
    weekly: {
      sales: [58000, 62000, 55000, 72000, 78000, 68000, 85000],
      footTraffic: [850, 920, 780, 1050, 1120, 980, 1250],
      staffHours: [320, 350, 280, 420, 450, 380, 520],
      customerSatisfaction: [4.3, 4.4, 4.2, 4.5, 4.6, 4.4, 4.7]
    },
    monthly: {
      sales: [250000, 280000, 240000, 320000, 350000, 300000, 400000],
      footTraffic: [3500, 3800, 3200, 4200, 4500, 4000, 5200],
      staffHours: [1200, 1350, 1100, 1500, 1600, 1400, 1800],
      customerSatisfaction: [4.4, 4.5, 4.3, 4.6, 4.7, 4.5, 4.8]
    }
  };

  const currentData = storeDataMap[storePeriod];

  // Staff management data
  const staffData = [
    { name: 'Sarah Johnson', position: 'Sales Associate', hours: 32, performance: 85, status: 'active' },
    { name: 'Mike Brown', position: 'Cashier', hours: 28, performance: 78, status: 'active' },
    { name: 'Emily Davis', position: 'Sales Associate', hours: 35, performance: 92, status: 'active' },
    { name: 'John Smith', position: 'Stock Clerk', hours: 40, performance: 88, status: 'active' },
    { name: 'Lisa Wilson', position: 'Sales Associate', hours: 0, performance: 0, status: 'off' }
  ];

  // Inventory data
  const inventoryData = [
    { category: 'Electronics', stock: 85, lowStock: 15, reorderPoint: 20 },
    { category: 'Clothing', stock: 120, lowStock: 8, reorderPoint: 25 },
    { category: 'Home & Garden', stock: 65, lowStock: 22, reorderPoint: 30 },
    { category: 'Sports', stock: 95, lowStock: 12, reorderPoint: 18 },
    { category: 'Books', stock: 45, lowStock: 28, reorderPoint: 35 }
  ];

  // Chart options
  const storePerformanceOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Sales', 'Foot Traffic'], textStyle: { color: '#4E5969' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: storePeriod === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            storePeriod === 'weekly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'] :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Sales ($)',
        axisLabel: { color: '#86909C' },
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        splitLine: { lineStyle: { color: '#F2F3F5' } }
      },
      {
        type: 'value',
        name: 'Foot Traffic',
        axisLabel: { color: '#86909C' },
        axisLine: { lineStyle: { color: '#E5E6EB' } },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: currentData.sales,
        itemStyle: { color: '#165DFF' }
      },
      {
        name: 'Foot Traffic',
        type: 'line',
        yAxisIndex: 1,
        data: currentData.footTraffic,
        itemStyle: { color: '#52C41A' },
        lineStyle: { color: '#52C41A', width: 2 }
      }
    ]
  };

  const staffPerformanceOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: staffData.map(s => s.name),
      axisLabel: { color: '#86909C', rotate: 45 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#86909C' }
    },
    series: [{
      type: 'bar',
      data: staffData.map(s => s.performance),
      itemStyle: { color: '#165DFF' }
    }]
  };

  const inventoryOption = {
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#4E5969' }
    },
    series: [{
      name: 'Inventory',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false, position: 'center' },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      labelLine: { show: false },
      data: inventoryData.map(item => ({
        value: item.stock,
        name: item.category
      }))
    }]
  };

  const satisfactionChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ 
      data: currentData.customerSatisfaction, 
      type: 'line', 
      smooth: true, 
      symbol: 'none', 
      lineStyle: { color: '#FAAD14', width: 2 }, 
      areaStyle: { color: 'rgba(250,173,20,0.08)' } 
    }]
  };

  // Recent activities
  const recentActivities = [
    { type: 'staff', text: 'Sarah Johnson completed training module', time: '2 hours ago', status: 'success' },
    { type: 'inventory', text: 'Low stock alert: Electronics category', time: '4 hours ago', status: 'warning' },
    { type: 'customer', text: 'Customer complaint resolved', time: '6 hours ago', status: 'success' },
    { type: 'sales', text: 'Daily sales target exceeded by 15%', time: '1 day ago', status: 'success' },
    { type: 'staff', text: 'Mike Brown requested time off', time: '2 days ago', status: 'info' }
  ];

  // Notification system
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([]);
  const addMessage = (text: string) => {
    const id = Date.now() + Math.random();
    setMessages((msgs) => [...msgs, { id, text }]);
    setTimeout(() => {
      setMessages((msgs) => msgs.filter((msg) => msg.id !== id));
    }, 4000);
  };

  // PDF Generation for Store Report
  const generateStoreReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Store Performance Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Store Period: ${storePeriod}`, 20, 45);
    doc.text(`Store Manager: ${userData.email}`, 20, 55);
    
    // Store summary table
    const totalSales = currentData.sales.reduce((a, b) => a + b, 0);
    const totalFootTraffic = currentData.footTraffic.reduce((a, b) => a + b, 0);
    const avgSatisfaction = (currentData.customerSatisfaction.reduce((a, b) => a + b, 0) / currentData.customerSatisfaction.length).toFixed(1);
    
    const tableData = [
      ['Total Sales', `$${totalSales.toLocaleString()}`],
      ['Total Foot Traffic', totalFootTraffic.toString()],
      ['Average Customer Satisfaction', `${avgSatisfaction}/5.0`],
      ['Active Staff', staffData.filter(s => s.status === 'active').length.toString()],
      ['Low Stock Items', inventoryData.filter(i => i.lowStock > 0).length.toString()]
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
    
    doc.save(`store-report-${storePeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    addMessage('Store report generated successfully!');
  };

  return (
    <div className="font-inter bg-gray-50 text-dark dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-custom">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 nav-shadow z-50 transition-custom">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-store text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-primary hidden md:block">StoreManager</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 md:pt-36 pb-16">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800 dark:text-white">Store Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {userData.email}. Here's your store overview for today.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Store Sales</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  ${currentData.sales.reduce((a, b) => a + b, 0).toLocaleString()}
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+8% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
            </div>
          </div>

          {/* Foot Traffic */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Foot Traffic</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {currentData.footTraffic.reduce((a, b) => a + b, 0)}
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+12% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <i className="fas fa-users text-xl"></i>
              </div>
            </div>
          </div>

          {/* Staff Hours */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Staff Hours</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {currentData.staffHours.reduce((a, b) => a + b, 0)}
                </h3>
                <p className="text-info text-sm mt-2 flex items-center">
                  <i className="fas fa-clock mr-1"></i>
                  <span>This period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-info">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Customer Satisfaction</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {(currentData.customerSatisfaction.reduce((a, b) => a + b, 0) / currentData.customerSatisfaction.length).toFixed(1)}
                </h3>
                <p className="text-warning text-sm mt-2 flex items-center">
                  <i className="fas fa-star mr-1"></i>
                  <span>out of 5.0</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <i className="fas fa-star text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={satisfactionChartOption} style={{ height: 40 }} />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Store Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Store Performance</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${storePeriod === 'daily' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setStorePeriod('daily')}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${storePeriod === 'weekly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setStorePeriod('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${storePeriod === 'monthly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setStorePeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={storePerformanceOption} style={{ height: 300 }} />
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Staff Performance</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={staffPerformanceOption} style={{ height: 300 }} />
            </div>
          </div>
        </div>

        {/* Staff Management & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Staff Management */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Staff Management</h2>
              <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('Manage staff coming soon!')}>Manage</button>
            </div>
            <div className="space-y-4">
              {staffData.map((staff, idx) => (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" key={idx}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      staff.status === 'active' ? 'bg-success/10 text-success' : 'bg-gray-300 text-gray-600'
                    }`}>
                      <i className="fas fa-user"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{staff.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{staff.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 dark:text-white">{staff.hours}h</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{staff.performance}% perf</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Inventory Status</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={inventoryOption} style={{ height: 300 }} />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Activities</h2>
            <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('View all activities coming soon!')}>View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div className="flex items-center space-x-4" key={idx}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-success/10 text-success' :
                  activity.status === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-info/10 text-info'
                }`}>
                  <i className={`fas ${
                    activity.type === 'staff' ? 'fa-users' :
                    activity.type === 'inventory' ? 'fa-boxes' :
                    activity.type === 'customer' ? 'fa-user-check' :
                    'fa-chart-line'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Store Reports</h2>
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-custom mt-4 md:mt-0"
              onClick={generateStoreReport}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Generate Store Report
            </button>
          </div>
        </div>
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

export default ManagerDashboard; 