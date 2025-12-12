import { useEffect, useState } from "react";
import { Card, Col, Row } from "antd";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

const Dashboard = () => {
  const [pieData, setPieData] = useState<any[]>([]);
  const [hourlyTotals, setHourlyTotals] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/pieData")
      .then(res => res.json())
      .then(data => setPieData(data));

    fetch("/api/hourlyTotals")
      .then(res => res.json())
      .then(data => setHourlyTotals(data));
  }, []);

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Total Consumption">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={160} innerRadius={80} label>
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v} kWh`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Hourly Consumption">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={hourlyTotals}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
