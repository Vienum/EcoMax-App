import { Card, Col, Row, Alert, Spin, Empty, Select } from "antd";
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
  CartesianGrid
} from "recharts";

const Dashboard = () => {
  const [pieData, setPieData] = useState([]);
  const [gsiData, setGsiData] = useState([]);
  const [gsiTimeRange, setGsiTimeRange] = useState('next24');
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

        // Fetch pie chart data
        const pieResponse = await fetch("http://localhost:3001/api/pie", { headers });

        if (!pieResponse.ok) {
          throw new Error("Failed to fetch energy data");
        }

        const pieDataResult = await pieResponse.json();

        // Check if we got data
        if (pieDataResult && pieDataResult.length > 0) {
          setPieData(pieDataResult);
        } else {
          setPieData([]);
        }

        // Fetch GSI (Grünstromindex) data
        try {
          const gsiResponse = await fetch("http://localhost:3001/api/gsi", { headers });

          if (gsiResponse.ok) {
            const gsiResult = await gsiResponse.json();

            // Store the full forecast data
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
        } catch (gsiError) {
          console.log("GSI data not available:", gsiError);
          // Don't fail the whole dashboard if GSI fails
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Energy Consumption Dashboard</h2>

      <Row gutter={[16, 16]}>
        <Col span={24} lg={12}>
          <Card
            title="Total Energy Consumption by Room"
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
                    label={({ name, value }) => `${name}: ${value} kWh`}
                    labelLine={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => `${value} kWh`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty
                description="No energy consumption data available yet"
                style={{ marginTop: 60 }}
              />
            )}
          </Card>
        </Col>

        <Col span={24} lg={12}>
          <Card
            title="Energy Insights"
            styles={{
              body: {
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }
            }}
          >
            {pieData.length > 0 ? (
              <div>
                <h3>Consumption Summary</h3>
                <div style={{ marginTop: 20 }}>
                  {pieData.map((room: any, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 500 }}>{room.name}</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {room.value} kWh
                        </span>
                      </div>
                    </div>
                  ))}
                  <div style={{
                    marginTop: 20,
                    padding: '16px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '6px',
                    borderLeft: '4px solid #1890ff'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 600, fontSize: '16px' }}>Total Consumption</span>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                        {pieData.reduce((sum, room: any) => sum + room.value, 0).toFixed(2)} kWh
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Empty
                description="Start tracking your energy consumption by adding devices in Room View"
              />
            )}
          </Card>
        </Col>

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

        <Col span={24}>
          <Card title="Additional Insights">
            <Alert
              message="Coming Soon"
              description="Country/area average comparison will be displayed here."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;