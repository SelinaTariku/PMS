import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { 
  FiTrendingUp, 
  FiUsers, 
  FiPackage, 
  FiDollarSign, 
  FiCalendar, 
  FiAlertTriangle,
  FiRefreshCw,
  FiShoppingCart,
  FiPieChart
} from 'react-icons/fi';
import { format } from 'date-fns';
import { SimpleLinearRegression } from 'ml-regression';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

// Custom Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

// Custom Button Component
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Select Component
const Select = ({ value, onValueChange, children, className = '' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
        onClick={() => setOpen(!open)}
      >
        <span>{value}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2 h-4 w-4"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {React.Children.map(children, child => 
            React.cloneElement(child, { 
              onSelect: (val) => {
                onValueChange(val);
                setOpen(false);
              }
            })
          )}
        </div>
      )}
    </div>
  );
};

const SelectTrigger = ({ children }) => children;
const SelectContent = ({ children }) => children;

const SelectItem = ({ value, children, onSelect }) => (
  <div
    className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
    onClick={() => onSelect(value)}
  >
    {children}
  </div>
);

const SelectValue = ({ placeholder }) => placeholder;

// Custom Skeleton Component
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

// Custom Badge Component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    outline: 'border border-gray-200 bg-white',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Custom Progress Component
const Progress = ({ value = 0, className = '' }) => (
  <div className={`h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
    <div
      className="h-full bg-blue-500 transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const [predictiveMonths, setPredictiveMonths] = useState(3);
  const pharmacyId = localStorage.getItem("pharmacy");

  // Fetch data with error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [salesRes, customerRes, inventoryRes] = await Promise.all([
        axios.get(`http://localhost:5000/dashboard/sales-trend/pharmacy/${pharmacyId}`),
        axios.get(`http://localhost:5000/dashboard/customer-insights/pharmacy/${pharmacyId}`),
        axios.get(`http://localhost:5000/dashboard/additional-metrics/pharmacy/${pharmacyId}`)
      ]);

      setSalesData(salesRes.data);
      setCustomerData(customerRes.data);
      setInventoryData(inventoryRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pharmacyId) {
      fetchData();
    } else {
      setError("Pharmacy ID not found in localStorage");
      setLoading(false);
    }
  }, [pharmacyId, timeRange]);

  // Generate predictive sales data using linear regression
  const generatePredictiveSales = (historicalData, monthsToPredict) => {
    if (!historicalData || historicalData.length < 3) return null;

    try {
      const x = historicalData.map((_, i) => i);
      const y = historicalData.map(item => item.totalSales);
      
      const regression = new SimpleLinearRegression(x, y);
      
      const predictions = [];
      for (let i = 0; i < monthsToPredict; i++) {
        const nextIndex = x.length + i;
        predictions.push({
          month: (historicalData[0].month + nextIndex) % 12 || 12,
          year: historicalData[0].year + Math.floor((historicalData[0].month + nextIndex - 1) / 12),
          predictedSales: regression.predict(nextIndex)
        });
      }
      
      return predictions;
    } catch (error) {
      console.error("Error generating predictions:", error);
      return null;
    }
  };

  // Prepare sales trend chart data with predictions
  const prepareSalesTrendData = () => {
    if (!salesData?.monthlySales) return { labels: [], datasets: [] };

    const historicalData = salesData.monthlySales.slice().sort((a, b) => {
      return new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1);
    });

    const predictions = generatePredictiveSales(historicalData, predictiveMonths);
    const allData = [...historicalData, ...(predictions || [])];

    return {
      labels: allData.map(item => 
        `${new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' })} ${item.year}`
      ),
      datasets: [
        {
          label: 'Actual Sales (ETB)',
          data: historicalData.map(item => item.totalSales)
            .concat(new Array(predictiveMonths).fill(null)),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          type: 'bar'
        },
        {
          label: 'Predicted Sales (ETB)',
          data: historicalData.map(() => null)
            .concat(predictions?.map(p => p.predictedSales) || []),
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointBackgroundColor: 'rgba(239, 68, 68, 1)',
          pointRadius: 4,
          type: 'line'
        }
      ]
    };
  };

  // Prepare inventory status with expiration alerts
  const prepareInventoryStatus = () => {
    if (!inventoryData?.inventoryLevels) return { expiringSoon: 0, expired: 0, items: [] };

    const now = new Date();
    const warningThreshold = new Date();
    warningThreshold.setDate(warningThreshold.getDate() + 30); // 30 days warning

    const expiringSoon = inventoryData.inventoryLevels.filter(item => 
      item.expirationDate?.some(exp => 
        new Date(exp.expiredDate) < warningThreshold && new Date(exp.expiredDate) > now
      )
    );

    const expired = inventoryData.inventoryLevels.filter(item => 
      item.expirationDate?.some(exp => new Date(exp.expiredDate) <= now)
    );

    return {
      expiringSoon: expiringSoon.length,
      expired: expired.length,
      items: inventoryData.inventoryLevels.map(item => ({
        ...item,
        totalQuantity: item.expirationDate?.reduce((sum, exp) => sum + (exp.quantity || 0), 0) || 0,
        expiring: item.expirationDate?.filter(exp => 
          new Date(exp.expiredDate) < warningThreshold && new Date(exp.expiredDate) > now
        ).reduce((sum, exp) => sum + (exp.quantity || 0), 0) || 0,
        expired: item.expirationDate?.filter(exp => 
          new Date(exp.expiredDate) <= now
        ).reduce((sum, exp) => sum + (exp.quantity || 0), 0) || 0
      }))
    };
  };

  // Prepare customer segmentation data
  const prepareCustomerSegmentation = () => {
    if (!customerData) return { newVsReturning: { labels: [], datasets: [] }, demographics: { labels: [], datasets: [] } };

    return {
      newVsReturning: {
        labels: ['New Customers', 'Returning Customers'],
        datasets: [{
          data: [customerData.newCustomers || 0, customerData.returningCustomers || 0],
          backgroundColor: ['rgba(99, 102, 241, 0.6)', 'rgba(16, 185, 129, 0.6)'],
          borderColor: ['rgba(99, 102, 241, 1)', 'rgba(16, 185, 129, 1)'],
          borderWidth: 1
        }]
      },
      demographics: {
        labels: customerData?.customerDemographics?.map(item => item.ageGroup) || ['No Data'],
        datasets: [{
          label: 'Customers by Age Group',
          data: customerData?.customerDemographics?.map(item => item.count) || [1],
          backgroundColor: [
            'rgba(239, 68, 68, 0.6)',
            'rgba(99, 102, 241, 0.6)',
            'rgba(234, 179, 8, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(139, 92, 246, 0.6)'
          ],
          borderWidth: 1
        }]
      }
    };
  };

  // Prepare top products data
  const prepareTopProducts = () => {
    if (!salesData?.salesByCategory || !inventoryData?.inventoryLevels) return [];

    return salesData.salesByCategory
      .map(item => ({
        ...item,
        name: inventoryData.inventoryLevels.find(prod => prod._id === item.productId)?.name || `Product ${item.productId}`,
        quantity: inventoryData.inventoryLevels.find(prod => prod._id === item.productId)?.expirationDate?.reduce((sum, exp) => sum + (exp.quantity || 0), 0) || 0
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);
  };

  const salesTrendData = prepareSalesTrendData();
  const inventoryStatus = prepareInventoryStatus();
  const customerSegmentation = prepareCustomerSegmentation();
  const topProducts = prepareTopProducts();

  if (loading) return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <FiAlertTriangle className="mx-auto text-red-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-700 mb-4">{error}</p>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={fetchData} variant="outline">
            <FiRefreshCw className="mr-2" /> Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  return (
   <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pharmacy Analytics Dashboard</h1>
          <p className="text-gray-600">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger>
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={predictiveMonths.toString()} onValueChange={(val) => setPredictiveMonths(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Forecast" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Predict 1 month</SelectItem>
              <SelectItem value="3">Predict 3 months</SelectItem>
              <SelectItem value="6">Predict 6 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Sales</h3>
            <FiDollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData?.totalSales?.toFixed(2) || '0.00'} ETB</div>
            <p className="text-xs text-gray-500">
              {salesData?.salesGrowth >= 0 ? '+' : ''}{salesData?.salesGrowth?.toFixed(2) || 0}% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Customers</h3>
            <FiUsers className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData?.totalCustomers || 0}</div>
            <p className="text-xs text-gray-500">
              {customerData?.newCustomers || 0} new this period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Inventory Items</h3>
            <FiPackage className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData?.inventoryLevels?.length || 0}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="destructive">{inventoryStatus.expired} expired</Badge>
              <Badge variant="warning">{inventoryStatus.expiringSoon} expiring</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Top Product</h3>
            <FiTrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProducts[0]?.name}
            </div>
            <p className="text-xs text-gray-500">
              {topProducts[0]?.totalSales?.toFixed(2) || '0.00'} ETB in sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Sales Trend & Forecast</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Actual
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Forecast
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={salesTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.dataset.label || '';
                          const value = context.raw?.toFixed(2) || '0.00';
                          return `${label}: ${value} ETB`;
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${value} ETB`
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-500">
            {predictiveMonths}-month forecast based on linear regression
          </CardFooter>
        </Card>
        
        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Customer Segmentation</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <Pie
                  data={customerSegmentation.newVsReturning}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="h-64">
                <Pie
                  data={customerSegmentation.demographics}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Top Selling Products</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} in stock</p>
                      </div>
                    </div>
                    <span className="font-semibold">{product.totalSales?.toFixed(2) || '0.00'} ETB</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <FiShoppingCart className="w-8 h-8 mb-2" />
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Inventory Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold">Inventory Status</h3>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar
                data={{
                  labels: inventoryStatus.items.map(item => item.name),
                  datasets: [
                    {
                      label: 'Total Quantity',
                      data: inventoryStatus.items.map(item => item.totalQuantity),
                      backgroundColor: 'rgba(99, 102, 241, 0.6)',
                      borderColor: 'rgba(99, 102, 241, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Expiring Soon',
                      data: inventoryStatus.items.map(item => item.expiring),
                      backgroundColor: 'rgba(234, 179, 8, 0.6)',
                      borderColor: 'rgba(234, 179, 8, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Expired',
                      data: inventoryStatus.items.map(item => item.expired),
                      backgroundColor: 'rgba(239, 68, 68, 0.6)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      beginAtZero: true
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        afterLabel: (context) => {
                          const item = inventoryStatus.items[context.dataIndex];
                          const expDates = item.expirationDate
                            ?.sort((a, b) => new Date(a.expiredDate) - new Date(b.expiredDate))
                            ?.map(exp => `• ${exp.quantity} expiring on ${format(new Date(exp.expiredDate), 'MMM d, yyyy')}`)
                            ?.join('\n') || 'No expiration data';
                          return `\nExpiration Dates:\n${expDates}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Reorder Recommendations */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Reorder Recommendations</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryStatus.items
                .filter(item => item.totalQuantity < (item.outOfStock || 10))
                .sort((a, b) => a.totalQuantity - b.totalQuantity)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="p-3 rounded-lg border border-red-100 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Stock: {item.totalQuantity}</span>
                          <Progress 
                            value={(item.totalQuantity / (item.outOfStock || 10)) * 100} 
                            className="h-2 w-20" 
                          />
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))}
              {inventoryStatus.items.filter(item => item.totalQuantity < (item.outOfStock || 10)).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <FiPackage className="w-8 h-8 mb-2 text-green-500" />
                  <p>Inventory levels are healthy</p>
                  <p className="text-sm">No urgent reorders needed</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;