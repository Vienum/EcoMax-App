import { Card, Col, Row, Alert, Spin, Empty, Select, Statistic, Progress } from "antd";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import { ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [pieData, setPieData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [gsiData, setGsiData] = useState([]);
  const [gsiTimeRange, setGsiTimeRange] = useState('next24');
  const [consumptionTimeRange, setConsumptionTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch all dashboard data with time range parameter
        const [summaryRes, pieRes, hourlyRes, gsiRes] = await Promise.all([
          fetch(`http://localhost:3001/api/consumption/summary?range=${consumptionTimeRange}`, { headers }),
          fetch(`http://localhost:3001/api/consumption/by-room?range=${consumptionTimeRange}`, { headers }),
          fetch(`http://localhost:3001/api/consumption/hourly?range=${consumptionTimeRange}`, { headers }),
          fetch("http://localhost:3001/api/gsi", { headers }).catch(() => null)
        ]);

        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          setSummaryData(summary);
        }

        if (pieRes.ok) {
          const pie = await pieRes.json();
          setPieData(pie);
        }

        if (hourlyRes.ok) {
          const hourly = await hourlyRes.json();
          setHourlyData(hourly);
        }

        // Fetch GSI data
        if (gsiRes && gsiRes.ok) {
          const gsiResult = await gsiRes.json();

          if (gsiResult.forecast && Array.isArray(gsiResult.forecast)) {
            const transformedGsi = gsiResult.forecast.map((item: any) => ({
              time: new Date(item.timeStamp).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              fullDate: new Date(item.timeStamp),
              gsi: item.gsi,
              co2: item.co2_g_standard
            }));
            setGsiData(transformedGsi);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [consumptionTimeRange]); // Re-fetch when time range changes

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a28bd4", "#ff6b9d"];

  // Filter GSI data based on selected time range
  const getFilteredGsiData = () => {
    if (gsiData.length === 0) return [];

    const now = new Date();

    switch (gsiTimeRange) {
      case 'next12':
        return gsiData.filter((item: any) => item.fullDate >= now).slice(0, 12);
      case 'next24':
        return gsiData.filter((item: any) => item.fullDate >= now).slice(0, 24);
      case 'next36':
        return gsiData.filter((item: any) => item.fullDate >= now);
      case 'all':
        return gsiData;
      default:
        return gsiData.filter((item: any) => item.fullDate >= now).slice(0, 24);
    }
  };

  const filteredGsiData = getFilteredGsiData();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <Spin size="large" tip="Loading energy data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  const isAboveAverage = summaryData?.percentage_difference > 0;
  const progressPercent = summaryData
    ? Math.min((summaryData.total_consumption / summaryData.average_consumption) * 100, 100)
    : 0;

  const getTimeRangeLabel = () => {
    switch (consumptionTimeRange) {
      case '24h': return 'Daily';
      case '7d': return 'Weekly';
      case '30d': return 'Monthly';
      default: return 'Daily';
    }
  };

  const getAverageDivisor = () => {
    switch (consumptionTimeRange) {
      case '24h': return '365 (daily)';
      case '7d': return '52 (weekly)';
      case '30d': return '12 (monthly)';
      default: return '365';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Energy Consumption Dashboard</h2>
        <Select
          value={consumptionTimeRange}
          onChange={setConsumptionTimeRange}
          style={{ width: 180 }}
          options={[
            { value: '24h', label: 'Last 24 Hours' },
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]}>
        {/* Summary Cards */}
        <Col span={24} lg={8}>
          <Card>
            <Statistic
              title="Your Total Consumption"
              value={summaryData?.total_consumption.toFixed(2) || 0}
              suffix="kWh"
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card>
            <Statistic
              title={`${getTimeRangeLabel()} Household Average`}
              value={summaryData?.average_consumption.toFixed(2) || 0}
              suffix="kWh"
              valueStyle={{ color: '#666' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              Based on {summaryData?.people_in_household || 0} {summaryData?.people_in_household === 1 ? 'person' : 'people'} × 1,500 kWh ÷ {getAverageDivisor()}
            </div>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card>
            <Statistic
              title="Comparison to Average"
              value={Math.abs(summaryData?.percentage_difference || 0)}
              suffix="%"
              prefix={isAboveAverage ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: isAboveAverage ? '#cf1322' : '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: isAboveAverage ? '#cf1322' : '#3f8600' }}>
              {isAboveAverage ? 'Above' : 'Below'} average consumption
            </div>
          </Card>
        </Col>

        {/* Consumption Progress */}
        <Col span={24}>
          <Card title="Consumption vs. Average">
            <Progress
              percent={progressPercent}
              strokeColor={progressPercent > 100 ? '#cf1322' : '#3f8600'}
              format={() => `${summaryData?.total_consumption.toFixed(0) || 0} / ${summaryData?.average_consumption.toFixed(2) || 0} kWh`}
            />
            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14 }}>
              {isAboveAverage ? (
                <span style={{ color: '#cf1322' }}>
                  💡 Tip: Try to reduce consumption during peak hours to save energy!
                </span>
              ) : (
                <span style={{ color: '#3f8600' }}>
                  ✅ Great job! You're consuming less energy than the average household!
                </span>
              )}
            </div>
          </Card>
        </Col>

        {/* Pie Chart - Room Breakdown */}
        <Col span={24} lg={12}>
          <Card
            title={`Energy Consumption by Room - ${consumptionTimeRange === '24h' ? 'Last 24 Hours' :
              consumptionTimeRange === '7d' ? 'Last 7 Days' :
                'Last 30 Days'
              }`}
            styles={{
              body: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }
            }}
          >
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    label={({ name, value }: any) => `${name}: ${value.toFixed(1)} kWh`}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${value.toFixed(2)} kWh`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="No room data available yet"
                style={{ marginTop: 60 }}
              />
            )}
          </Card>
        </Col>

        {/* Hourly Consumption Line Chart */}
        <Col span={24} lg={12}>
          <Card
            title={`${consumptionTimeRange === '24h' ? 'Hourly' : 'Daily'
              } Consumption Pattern`}
            styles={{
              body: {
                minHeight: "400px",
              }
            }}
          >
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)} kWh`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Consumption"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="No hourly data available yet"
                style={{ marginTop: 60 }}
              />
            )}
          </Card>
        </Col>

        {/* GSI Chart */}
        <Col span={24}>
          <Card
            title="Green Energy Index (Grünstromindex)"
            extra={
              <Select
                value={gsiTimeRange}
                onChange={setGsiTimeRange}
                style={{ width: 160 }}
                options={[
                  { value: 'next12', label: 'Next 12 Hours' },
                  { value: 'next24', label: 'Next 24 Hours' },
                  { value: 'next36', label: 'Next 36 Hours' },
                  { value: 'all', label: 'All Available' },
                ]}
              />
            }
          >
            {filteredGsiData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredGsiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    interval={filteredGsiData.length > 24 ? 3 : 2}
                  />
                  <YAxis
                    label={{ value: 'Green Energy Index', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'gsi') return [`${value}%`, 'Green Index'];
                      if (name === 'co2') return [`${value} g/kWh`, 'CO₂ Intensity'];
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="gsi" fill="#52c41a" name="Green Energy %" />
                  <Bar dataKey="co2" fill="#ff7875" name="CO₂ g/kWh" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Alert
                message="Green Energy Data"
                description="Green energy forecast data based on your ZIP code will be displayed here once available."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;