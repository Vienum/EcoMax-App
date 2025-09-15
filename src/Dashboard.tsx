import { Card, Col, Row, Select, Tooltip } from "antd";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const Dashboard = () => {

  const [roomSelection, setRoomSelection] = React.useState('kitchen')

  // Pie = household daily totals (kWh)
  const pieData = [
    { name: "Kitchen", value: 8.09 },    // ~32.5% of the day
    { name: "Living Room", value: 9.96 },// ~40.0%
    { name: "Bedroom", value: 5.06 },    // ~20.3%
    { name: "Other", value: 1.79 },      // ~7.2%
  ];

  // Hourly total consumption (24 points) — units: kWh per hour (sums to ~24.9 kWh/day)
  const hourlyTotals = [
    { time: "00:00", value: 0.4 },
    { time: "01:00", value: 0.4 },
    { time: "02:00", value: 0.4 },
    { time: "03:00", value: 0.4 },
    { time: "04:00", value: 0.4 },
    { time: "05:00", value: 0.4 },
    { time: "06:00", value: 0.9 },
    { time: "07:00", value: 1.2 },
    { time: "08:00", value: 0.9 },
    { time: "09:00", value: 1.1 },
    { time: "10:00", value: 1.1 },
    { time: "11:00", value: 1.1 },
    { time: "12:00", value: 1.1 },
    { time: "13:00", value: 1.1 },
    { time: "14:00", value: 1.1 },
    { time: "15:00", value: 1.1 },
    { time: "16:00", value: 1.1 },
    { time: "17:00", value: 1.8 },
    { time: "18:00", value: 2.0 },
    { time: "19:00", value: 2.5 },
    { time: "20:00", value: 2.0 },
    { time: "21:00", value: 1.6 },
    { time: "22:00", value: 0.4 },
    { time: "23:00", value: 0.4 },
  ];


  // Per-room hourly breakdown (same time axis). these are realistic-looking room contributions
  const kitchenHourly = [
    { time: "00:00", kitchen: 0.21 }, { time: "01:00", kitchen: 0.21 }, { time: "02:00", kitchen: 0.21 },
    { time: "03:00", kitchen: 0.21 }, { time: "04:00", kitchen: 0.21 }, { time: "05:00", kitchen: 0.21 },
    { time: "06:00", kitchen: 0.35 }, { time: "07:00", kitchen: 0.58 }, { time: "08:00", kitchen: 0.53 },
    { time: "09:00", kitchen: 0.41 }, { time: "10:00", kitchen: 0.41 }, { time: "11:00", kitchen: 0.41 },
    { time: "12:00", kitchen: 0.41 }, { time: "13:00", kitchen: 0.41 }, { time: "14:00", kitchen: 0.41 },
    { time: "15:00", kitchen: 0.41 }, { time: "16:00", kitchen: 0.44 }, { time: "17:00", kitchen: 0.72 },
    { time: "18:00", kitchen: 0.77 }, { time: "19:00", kitchen: 0.80 }, { time: "20:00", kitchen: 0.70 },
    { time: "21:00", kitchen: 0.58 }, { time: "22:00", kitchen: 0.21 }, { time: "23:00", kitchen: 0.21 },
  ];

  const livingHourly = [
    { time: "00:00", living: 0.11 }, { time: "01:00", living: 0.11 }, { time: "02:00", living: 0.11 },
    { time: "03:00", living: 0.11 }, { time: "04:00", living: 0.11 }, { time: "05:00", living: 0.11 },
    { time: "06:00", living: 0.16 }, { time: "07:00", living: 0.35 }, { time: "08:00", living: 0.60 },
    { time: "09:00", living: 0.80 }, { time: "10:00", living: 0.86 }, { time: "11:00", living: 0.86 },
    { time: "12:00", living: 0.86 }, { time: "13:00", living: 0.86 }, { time: "14:00", living: 0.86 },
    { time: "15:00", living: 0.86 }, { time: "16:00", living: 0.95 }, { time: "17:00", living: 1.20 },
    { time: "18:00", living: 1.40 }, { time: "19:00", living: 1.50 }, { time: "20:00", living: 1.30 },
    { time: "21:00", living: 1.10 }, { time: "22:00", living: 0.22 }, { time: "23:00", living: 0.22 },
  ];

  const bedroomHourly = [
    { time: "00:00", bedroom: 0.21 }, { time: "01:00", bedroom: 0.21 }, { time: "02:00", bedroom: 0.21 },
    { time: "03:00", bedroom: 0.21 }, { time: "04:00", bedroom: 0.21 }, { time: "05:00", bedroom: 0.21 },
    { time: "06:00", bedroom: 0.20 }, { time: "07:00", bedroom: 0.27 }, { time: "08:00", bedroom: 0.06 },
    { time: "09:00", bedroom: 0.06 }, { time: "10:00", bedroom: 0.06 }, { time: "11:00", bedroom: 0.06 },
    { time: "12:00", bedroom: 0.06 }, { time: "13:00", bedroom: 0.06 }, { time: "14:00", bedroom: 0.06 },
    { time: "15:00", bedroom: 0.06 }, { time: "16:00", bedroom: 0.06 }, { time: "17:00", bedroom: 0.06 },
    { time: "18:00", bedroom: 0.06 }, { time: "19:00", bedroom: 0.20 }, { time: "20:00", bedroom: 0.20 },
    { time: "21:00", bedroom: 0.20 }, { time: "22:00", bedroom: 0.14 }, { time: "23:00", bedroom: 0.14 },
  ];

  const mergedHourly = hourlyTotals.map((t, i) => ({
    ...t,
    kitchen: kitchenHourly[i]?.kitchen ?? 0,
    living: livingHourly[i]?.living ?? 0,
    bedroom: bedroomHourly[i]?.bedroom ?? 0,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

  return (
    <Row style={{ height: "100vh" }} gutter={[16, 16]}>
      <Col span={12}>
        <Card
          title="Total Consumption"
          styles={{
            body: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: 'black',
              height: "92.5%",
            }
          }}
          style={{ backgroundColor: "grey", height: "100%" }}
        >
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={160} innerRadius={80} label>
                {pieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} />
              <Legend formatter={(v) => <span style={{ color: "#fff" }}>{v}</span>} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col span={12} style={{ height: "100%" }}>
        <Row style={{ height: "50%" }} gutter={[0, 16]}>
          <Col span={24}>
            <Card
              title="Room View"
              extra={<Select style={{ width: "120px" }} onChange={(val) => setRoomSelection(val)} defaultValue="kitchen" options={[{ value: "kitchen", label: "Kitchen" }, { value: "living", label: "Livingroom" }, { value: "bedroom", label: "Bedroom" }]} />}
              styles={{
                body: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "85%",
                  backgroundColor: 'black'
                },
                header: { paddingLeft: "125px" }

              }}
              style={{ backgroundColor: "grey", height: "100%" }}
            >
              {/* Graph 2 card content — paste inside Graph 2 <Card> ... </Card> */}
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  gap: 12,
                  alignItems: "stretch",
                  height: "100%",      // <- ensure the row/card gives a height to this container
                }}
              >
                {roomSelection === "kitchen" ?
                  <div style={{ flex: 1, minWidth: 120, height: "100%" }}>
                    <div style={{ fontSize: 12, marginBottom: 6, textAlign: "center", color: "#fff" }}>
                      Kitchen
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={kitchenHourly}>
                        <CartesianGrid stroke="rgba(255,255,255,0.10)" />
                        <XAxis dataKey="time" stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <Tooltip formatter={(v) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
                        <Line type="monotone" dataKey="kitchen" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  : null}
                {roomSelection === "living" ?
                  <div style={{ flex: 1, minWidth: 120, height: "100%" }}>
                    <div style={{ fontSize: 12, marginBottom: 6, textAlign: "center", color: "#fff" }}>
                      Living Room
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={livingHourly}>
                        <CartesianGrid stroke="rgba(255,255,255,0.10)" />
                        <XAxis dataKey="time" stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <Tooltip formatter={(v) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
                        <Line type="monotone" dataKey="living" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  : null}
                {roomSelection === "bedroom" ?
                  <div style={{ flex: 1, minWidth: 120, height: "100%" }}>
                    <div style={{ fontSize: 12, marginBottom: 6, textAlign: "center", color: "#fff" }}>
                      Bedroom
                    </div>
                    <ResponsiveContainer width="100%" height="90%">
                      <LineChart data={bedroomHourly}>
                        <CartesianGrid stroke="rgba(255,255,255,0.10)" />
                        <XAxis dataKey="time" stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <YAxis stroke="#fff" tick={{ fill: "#fff", fontSize: 10 }} />
                        <Tooltip formatter={(v) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
                        <Line type="monotone" dataKey="bedroom" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  : null}
              </div>

            </Card>
          </Col>
        </Row>

        <Row style={{ height: "50%" }}>
          <Col span={24}>
            <Card
              title="Graph 3"
              styles={{
                body: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: 'black',
                  height: "85%",
                },
              }}
              style={{ backgroundColor: "grey", height: "100%" }}
            >
              {/* Graph 3 card content — paste inside Graph 3 <Card> ... </Card> */}
              <div style={{ width: "100%", height: 340, minHeight: 260 }}>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={mergedHourly} margin={{ top: 8, right: 0, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.12)" />
                    <XAxis
                      dataKey="time"
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                      padding={{ right: 0 }}
                    />
                    <YAxis
                      stroke="#fff"
                      tick={{ fill: "#fff", fontSize: 12 }}
                      label={{ value: "kWh", angle: -90, position: "insideLeft", fill: "#fff" }}
                    />
                    <Tooltip
                      formatter={(v) => `${v} kWh`}
                      contentStyle={{ backgroundColor: "#0b0b0b", borderColor: "#333" }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Legend formatter={(value) => <span style={{ color: "#fff" }}>{value}</span>} verticalAlign="top" />
                    <Line dataKey="value" name="Total" stroke="#ffffff" strokeWidth={2.5} dot={false} />
                    <Line dataKey="kitchen" name="Kitchen" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 2 }} />
                    <Line dataKey="living" name="Living Room" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 2 }} />
                    <Line dataKey="bedroom" name="Bedroom" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </Card>
          </Col>
        </Row>
      </Col >
    </Row >
  );
};

export default Dashboard;
