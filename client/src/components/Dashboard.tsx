import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { User, SalesData, SalesmanData } from '../models/User';

interface DashboardProps {
  userData: User;
}

const Dashboard = ({ userData }: DashboardProps) => {
  const [departmentSales, setDepartmentSales] = useState<SalesData[]>([]);
  const [salesmenData, setSalesmenData] = useState<SalesmanData[]>([]);

  useEffect(() => {
    if (userData.role === 'manager' && userData.department === 'Sales') {
      // Fetch department sales data
      const fetchDepartmentSales = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/sales/department');
          setDepartmentSales(response.data);
        } catch (error) {
          console.error('Error fetching department sales:', error);
        }
      };

      // Fetch individual salesmen data
      const fetchSalesmenData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/sales/salesmen');
          setSalesmenData(response.data);
        } catch (error) {
          console.error('Error fetching salesmen data:', error);
        }
      };

      fetchDepartmentSales();
      fetchSalesmenData();
    }
  }, [userData]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {userData.role === 'manager' && userData.department === 'Sales' && (
        <>
          {/* Department Performance */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Department Performance (2025)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Total Sales: ${departmentSales.reduce((sum, data) => sum + data.sales, 0)} | Average Monthly Sales: $
              {(departmentSales.reduce((sum, data) => sum + data.sales, 0) / departmentSales.length).toFixed(2)}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={departmentSales} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#1976d2" name="Sales ($)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Individual Salesmen Performance */}
          <Typography variant="h6" gutterBottom>
            Sales Team Performance
          </Typography>
          <Grid container spacing={3}>
            {salesmenData.map((salesman) => (
              <Grid item xs={12} md={6} key={salesman.id}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {salesman.email}
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={salesman.sales} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#388e3c" name="Sales ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;