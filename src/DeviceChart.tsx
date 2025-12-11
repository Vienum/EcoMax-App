import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

interface Reading {
    timestamp: string;
    value: number;
}

interface DeviceChartProps {
    deviceId: number;
    deviceName: string;
}

const DeviceChart = ({ deviceId, deviceName }: DeviceChartProps) => {
    const [data, setData] = useState<Reading[]>([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/device/${deviceId}/readings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                console.log(json)
                setData(json.map((r: any) => ({
                    timestamp: new Date(r.timestamp).getHours() + ":00",
                    value: r.kwh // <- use kwh from backend
                })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
        console.log(data)
    }, [deviceId]);



    return (
        <div style={{ width: '100%', height: 300 }}>
            <h4>{deviceName}</h4>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis unit=" kWh" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Consumption" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DeviceChart;
