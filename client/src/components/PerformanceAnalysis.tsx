import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PerformanceAnalysis: React.FC<{ view: 'employees' | 'departments' | 'goals', onBack: () => void }> = ({ view, onBack }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let endpoint = '/api/performance/employees';
    if (view === 'departments') endpoint = '/api/performance/departments';
    if (view === 'goals') endpoint = '/api/performance/goals';
    axios.get(endpoint).then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, [view]);

  // Employee Metrics
  const employeeTable = (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">On-Time Rate (%)</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hours Worked</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sales</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {data.map((d, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 font-medium">{d.name}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{d.department}</td>
              <td className="px-4 py-2 text-sm text-green-700 dark:text-green-300">{d.onTimeRate}</td>
              <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300">{d.hoursWorked}</td>
              <td className="px-4 py-2 text-sm text-purple-700 dark:text-purple-300">{d.sales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Department Reports
  const departmentTable = (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Department</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg On-Time Rate (%)</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Hours</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Sales</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {data.map((d, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 font-medium">{d.department}</td>
              <td className="px-4 py-2 text-sm text-green-700 dark:text-green-300">{d.avgOnTimeRate}</td>
              <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300">{d.totalHours}</td>
              <td className="px-4 py-2 text-sm text-purple-700 dark:text-purple-300">{d.totalSales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Goal Tracking
  const goalTable = (
    <div className="overflow-x-auto mb-8">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Goal</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Progress</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Target</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {data.map((d, idx) => (
            <tr key={idx}>
              <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100 font-medium">{d.name}</td>
              <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{d.goal}</td>
              <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300">{d.progress}</td>
              <td className="px-4 py-2 text-sm text-blue-700 dark:text-blue-300">{d.target}</td>
              <td className={`px-4 py-2 text-sm ${d.status === 'Achieved' ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'}`}>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <button className="mb-4 text-primary underline" onClick={onBack}>← Back to Dashboard</button>
      <h1 className="text-2xl font-bold mb-6">{view === 'employees' ? 'Employee Metrics' : view === 'departments' ? 'Department Reports' : 'Goal Tracking'}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {view === 'employees' && employeeTable}
          {view === 'departments' && departmentTable}
          {view === 'goals' && goalTable}
        </>
      )}
    </div>
  );
};

export default PerformanceAnalysis; 