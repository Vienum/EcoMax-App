import { Card, Col, Row, Alert, Spin, Empty, Select, Statistic, Progress, Modal, Table, Button } from "antd";
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
import { ArrowUpOutlined, ArrowDownOutlined, ThunderboltOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [pieData, setPieData] = useState<any>([]);
  const [hourlyData, setHourlyData] = useState<any>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [gsiData, setGsiData] = useState<any>([]);
  const [gsiTimeRange, setGsiTimeRange] = useState<any>('next24');
  const [consumptionTimeRange, setConsumptionTimeRange] = useState<any>('24h');
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<any>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch all dashboard data
        const [summaryRes, pieRes, hourlyRes, gsiRes] = await Promise.all([
          fetch(`http://localhost:3001/api/consumption/summary?range=${consumptionTimeRange}`, { headers }),
          fetch(`http://localhost:3001/api/consumption/by-room?range=${consumptionTimeRange}`, { headers }),
          fetch(`http://localhost:3001/api/consumption/hourly?range=${consumptionTimeRange}`, { headers }),
          fetch("http://localhost:3001/api/gsi", { headers }).catch(() => null),
        ]);

        // Parse GSI data once
        let gsiResult = null;
        if (gsiRes && gsiRes.ok) {
          gsiResult = await gsiRes.json();
        }

        // Summary
        if (summaryRes.ok) {
          const summary = await summaryRes.json();

          // Premium extras
          if (summary.premium === 1 && gsiResult?.forecast) {
            const forecast = gsiResult.forecast;

            const avgCO2 =
              forecast.reduce((sum: any, item: any) => sum + (item.co2_g_standard || 0), 0) /
              forecast.length;

            const avgGSI =
              forecast.reduce((sum: any, item: any) => sum + (item.gsi || 0), 0) /
              forecast.length;

            const totalCO2kg = (summary.total_consumption * avgCO2) / 1000;

            setSummaryData({
              ...summary,
              total_co2_kg: totalCO2kg,
              green_percentage: avgGSI,
            });
          } else {
            setSummaryData(summary);
          }
        }

        // Pie data
        if (pieRes.ok) {
          const pie = await pieRes.json();
          setPieData(pie);
        }

        // Hourly data
        if (hourlyRes.ok) {
          const hourly = await hourlyRes.json();
          setHourlyData(hourly);
        }

        // GSI transformed data (for chart)
        if (gsiResult?.forecast) {
          const transformed = gsiResult.forecast.map((item: any) => ({
            time: new Date(item.timeStamp).toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            fullDate: new Date(item.timeStamp),
            gsi: item.gsi,
            co2: item.co2_g_standard,
          }));

          setGsiData(transformed);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [consumptionTimeRange]);

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

  const featureComparison = [
    {
      key: '1',
      feature: 'Room Breakdown (Pie Chart)',
      free: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '2',
      feature: 'Hourly/Daily Consumption Chart',
      free: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '3',
      feature: 'Total Consumption Tracking',
      free: <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '4',
      feature: 'Household Average Comparison',
      free: <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '5',
      feature: 'Green Energy Index (GSI)',
      free: <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '6',
      feature: 'CO₂ Emissions Tracking',
      free: <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
    {
      key: '7',
      feature: 'Renewable Energy Percentage',
      free: <CloseOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />,
      premium: <CheckOutlined style={{ color: '#52c41a', fontSize: 18 }} />,
    },
  ];

  const columns: any = [
    {
      title: 'Feature',
      dataIndex: 'feature',
      key: 'feature',
      width: '60%',
    },
    {
      title: 'Free',
      dataIndex: 'free',
      key: 'free',
      align: 'center',
    },
    {
      title: 'Premium',
      dataIndex: 'premium',
      key: 'premium',
      align: 'center',
    },
  ];

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
        {/* Premium-only Summary Cards */}
        {summaryData?.premium === 1 && (
          <>
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
                  format={() => `${summaryData?.total_consumption.toFixed(0) || 0} / ${summaryData?.average_consumption.toFixed(0) || 0} kWh`}
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

            {/* Premium: CO2 Emissions */}
            <Col span={24} lg={12}>
              <Card>
                <Statistic
                  title="Total CO₂ Emissions"
                  value={summaryData?.total_co2_kg?.toFixed(2) || 0}
                  suffix="kg CO₂"
                  valueStyle={{ color: '#ff7875' }}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                  Based on your consumption and regional grid carbon intensity
                </div>
              </Card>
            </Col>

            {/* Premium: Green Energy Percentage */}
            <Col span={24} lg={12}>
              <Card>
                <Statistic
                  title="Green Energy Usage"
                  value={summaryData?.green_percentage?.toFixed(1) || 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress
                  percent={summaryData?.green_percentage || 0}
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ marginTop: 12 }}
                />
                <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                  Percentage of your energy from renewable sources
                </div>
              </Card>
            </Col>
          </>
        )}

        {/* Free User: Upgrade Banner */}
        {summaryData?.premium === 0 && (
          <Col span={24}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px', color: 'white' }}>
                <h2 style={{ color: 'white', marginBottom: 16 }}>🌟 Upgrade to Premium</h2>
                <p style={{ fontSize: 16, marginBottom: 20, color: 'rgba(255,255,255,0.9)' }}>
                  Unlock advanced analytics including consumption tracking, average comparison,
                  CO₂ emissions monitoring, and green energy insights!
                </p>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setUpgradeModalOpen(true)}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </Card>
          </Col>
        )}

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
                    {pieData.map((entry: any, idx: any) => (
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

        {/* GSI Chart - Premium Only */}
        {summaryData?.premium === 1 && (
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
        )}
      </Row>

      {/* Upgrade Modal */}
      <Modal
        title="Upgrade to Premium"
        open={upgradeModalOpen}
        onCancel={() => setUpgradeModalOpen(false)}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 24 }}>
          <h3>Feature Comparison</h3>
          <Table
            dataSource={featureComparison}
            columns={columns}
            pagination={false}
            size="middle"
            bordered
          />
        </div>

        <Alert
          message="Contact Us to Upgrade"
          description={
            <div>
              <p>To upgrade your account to Premium, please contact us at:</p>
              <p style={{ fontSize: 16, fontWeight: 'bold', color: '#1890ff', marginTop: 8 }}>
                info@ecomax.com
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default Dashboard;