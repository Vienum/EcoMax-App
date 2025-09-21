import { Card, Col, Row, Select, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const calculateMergedHourly = (
  hourlyTotals: { time: string; value: number }[],
  kitchenHourly: { kitchen: number }[],
  livingHourly: { living: number }[],
  bedroomHourly: { bedroom: number }[]
) => {
  return hourlyTotals.map((t, i) => ({
    ...t,
    kitchen: kitchenHourly[i]?.kitchen ?? 0,
    living: livingHourly[i]?.living ?? 0,
    bedroom: bedroomHourly[i]?.bedroom ?? 0,
  }));
};

module.exports = { calculateMergedHourly };




const Dashboard = () => {

  const [roomSelection, setRoomSelection] = React.useState('kitchen')


  const [pieData, setPieData] = useState([]);
  const [hourlyTotals, setHourlyTotals] = useState([]);
  const [kitchenHourly, setKitchenHourly] = useState([]);
  const [livingHourly, setLivingHourly] = useState([]);
  const [bedroomHourly, setBedroomHourly] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/pie").then(r => r.json()).then(setPieData);
    fetch("http://localhost:3001/api/hourlyTotals").then(r => r.json()).then(setHourlyTotals);
    fetch("http://localhost:3001/api/kitchen").then(r => r.json()).then(setKitchenHourly);
    fetch("http://localhost:3001/api/living").then(r => r.json()).then(setLivingHourly);
    fetch("http://localhost:3001/api/bedroom").then(r => r.json()).then(setBedroomHourly);
  }, []);

  const mergedHourly = calculateMergedHourly(hourlyTotals, kitchenHourly, livingHourly, bedroomHourly);


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
              <Tooltip formatter={(v: any) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} />
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
                        <Tooltip formatter={(v: any) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
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
                        <Tooltip formatter={(v: any) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
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
                        <Tooltip formatter={(v: any) => `${v} kWh`} contentStyle={{ backgroundColor: "#0b0b0b" }} itemStyle={{ color: "#fff" }} />
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
              title="Hourly Consumption"
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
                      formatter={(v: any) => `${v} kWh`}
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
