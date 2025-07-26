import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface SalesDashboardProps {
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

const SalesDashboard: React.FC<SalesDashboardProps> = ({ userData }) => {
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

  // Sales period state
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Sales data based on period
  const salesDataMap = {
    daily: {
      sales: [1200, 1350, 980, 1450, 1600, 1400, 1800],
      targets: [1500, 1500, 1500, 1500, 1500, 1500, 1500],
      customers: [45, 52, 38, 58, 65, 55, 72],
      conversion: [68, 72, 65, 75, 78, 70, 82]
    },
    weekly: {
      sales: [8500, 9200, 7800, 10500, 11200, 9800, 12500],
      targets: [10000, 10000, 10000, 10000, 10000, 10000, 10000],
      customers: [320, 350, 280, 420, 450, 380, 520],
      conversion: [72, 75, 68, 78, 80, 73, 85]
    },
    monthly: {
      sales: [35000, 38000, 32000, 42000, 45000, 40000, 52000],
      targets: [45000, 45000, 45000, 45000, 45000, 45000, 45000],
      customers: [1200, 1350, 1100, 1500, 1600, 1400, 1800],
      conversion: [75, 78, 72, 80, 82, 76, 85]
    }
  };

  const currentData = salesDataMap[salesPeriod];

  // Chart options
  const salesChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Sales', 'Target'], textStyle: { color: '#4E5969' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: salesPeriod === 'daily' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            salesPeriod === 'weekly' ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'] :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#86909C' },
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      splitLine: { lineStyle: { color: '#F2F3F5' } }
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        data: currentData.sales,
        itemStyle: { color: '#165DFF' }
      },
      {
        name: 'Target',
        type: 'line',
        data: currentData.targets,
        itemStyle: { color: '#FAAD14' },
        lineStyle: { color: '#FAAD14', width: 2 }
      }
    ]
  };

  const conversionChartOption = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Conversion Rate',
      type: 'gauge',
      min: 0,
      max: 100,
      detail: { formatter: '{value}%', color: '#4E5969' },
      data: [{ value: currentData.conversion[currentData.conversion.length - 1], name: 'Conversion' }],
      axisLabel: { color: '#86909C' },
      title: { color: '#4E5969' }
    }]
  };

  const customerChartOption = {
    xAxis: { type: 'category', show: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value', show: false },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{ 
      data: currentData.customers, 
      type: 'line', 
      smooth: true, 
      symbol: 'none', 
      lineStyle: { color: '#52C41A', width: 2 }, 
      areaStyle: { color: 'rgba(82,196,26,0.08)' } 
    }]
  };

  // Product performance data
  const productPerformance = [
    { name: 'Electronics', sales: 45, target: 50, growth: 12 },
    { name: 'Clothing', sales: 38, target: 40, growth: 8 },
    { name: 'Home & Garden', sales: 32, target: 35, growth: 15 },
    { name: 'Sports', sales: 28, target: 30, growth: 5 },
    { name: 'Books', sales: 22, target: 25, growth: -2 }
  ];

  const productChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: productPerformance.map(p => p.name),
      axisLabel: { color: '#86909C', rotate: 45 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#86909C' }
    },
    series: [{
      type: 'bar',
      data: productPerformance.map(p => p.sales),
      itemStyle: { color: '#165DFF' }
    }]
  };

  // Recent sales activities
  const recentSales = [
    { customer: 'John Smith', product: 'iPhone 15', amount: 999, status: 'completed', time: '2 hours ago' },
    { customer: 'Sarah Johnson', product: 'Nike Shoes', amount: 129, status: 'pending', time: '4 hours ago' },
    { customer: 'Mike Brown', product: 'Samsung TV', amount: 799, status: 'completed', time: '6 hours ago' },
    { customer: 'Emily Davis', product: 'Adidas Jacket', amount: 89, status: 'cancelled', time: '1 day ago' }
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

  // PDF Generation for Sales Report
  const generateSalesReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Sales Performance Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Sales Period: ${salesPeriod}`, 20, 45);
    doc.text(`Salesperson: ${userData.email}`, 20, 55);
    
    // Sales summary table
    const totalSales = currentData.sales.reduce((a, b) => a + b, 0);
    const totalTarget = currentData.targets[0] * currentData.targets.length;
    const achievement = ((totalSales / totalTarget) * 100).toFixed(1);
    
    const tableData = [
      ['Total Sales', `$${totalSales.toLocaleString()}`],
      ['Target', `$${totalTarget.toLocaleString()}`],
      ['Achievement', `${achievement}%`],
      ['Customers', currentData.customers.reduce((a, b) => a + b, 0).toString()],
      ['Avg Conversion', `${(currentData.conversion.reduce((a, b) => a + b, 0) / currentData.conversion.length).toFixed(1)}%`]
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
    
    doc.save(`sales-report-${salesPeriod}-${new Date().toISOString().split('T')[0]}.pdf`);
    addMessage('Sales report generated successfully!');
  };

  return (
    <div className="font-inter bg-gray-50 text-dark dark:bg-gray-900 dark:text-gray-100 min-h-screen transition-custom">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 nav-shadow z-50 transition-custom">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-xl"></i>
              </div>
              <span className="text-xl font-bold text-primary hidden md:block">SalesInsight</span>
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
          <h1 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-gray-800 dark:text-white">Sales Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {userData.email}. Here's your sales overview for today.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sales</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  ${currentData.sales.reduce((a, b) => a + b, 0).toLocaleString()}
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+12% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
            </div>
          </div>

          {/* Sales Target */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Target Achievement</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {((currentData.sales.reduce((a, b) => a + b, 0) / (currentData.targets[0] * currentData.targets.length)) * 100).toFixed(1)}%
                </h3>
                <p className="text-warning text-sm mt-2 flex items-center">
                  <i className="fas fa-target mr-1"></i>
                  <span>Target: ${(currentData.targets[0] * currentData.targets.length).toLocaleString()}</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <i className="fas fa-bullseye text-xl"></i>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Customers</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {currentData.customers.reduce((a, b) => a + b, 0)}
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+8% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <i className="fas fa-users text-xl"></i>
              </div>
            </div>
            <div className="mt-4 h-10">
              <ReactECharts option={customerChartOption} style={{ height: 40 }} />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow hover:shadow-lg transition-custom">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Conversion Rate</p>
                <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gray-800 dark:text-white">
                  {(currentData.conversion.reduce((a, b) => a + b, 0) / currentData.conversion.length).toFixed(1)}%
                </h3>
                <p className="text-success text-sm mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  <span>+3% from last period</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center text-info">
                <i className="fas fa-percentage text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Performance Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Sales Performance</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 text-xs rounded-full ${salesPeriod === 'daily' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setSalesPeriod('daily')}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${salesPeriod === 'weekly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setSalesPeriod('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded-full ${salesPeriod === 'monthly' ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-custom'}`}
                  onClick={() => setSalesPeriod('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={salesChartOption} style={{ height: 300 }} />
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Product Performance</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={productChartOption} style={{ height: 300 }} />
            </div>
          </div>
        </div>

        {/* Recent Sales & Conversion Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Sales */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Sales</h2>
              <button className="text-sm text-primary hover:underline transition-custom" onClick={() => addMessage('View all sales coming soon!')}>View All</button>
            </div>
            <div className="space-y-4">
              {recentSales.map((sale, idx) => (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg" key={idx}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      sale.status === 'completed' ? 'bg-success/10 text-success' :
                      sale.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      <i className={`fas ${
                        sale.status === 'completed' ? 'fa-check' :
                        sale.status === 'pending' ? 'fa-clock' :
                        'fa-times'
                      }`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{sale.customer}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{sale.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800 dark:text-white">${sale.amount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sale.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Rate Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Conversion Rate</h2>
              <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-custom">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
            <div className="w-full h-[300px]">
              <ReactECharts option={conversionChartOption} style={{ height: 300 }} />
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 card-shadow mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Sales Reports</h2>
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-custom mt-4 md:mt-0"
              onClick={generateSalesReport}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Generate Sales Report
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

export default SalesDashboard; 