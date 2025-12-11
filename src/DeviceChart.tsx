import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ResponsiveContainer
} from "recharts";

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
                const res = await fetch(
                    `http://localhost:3001/api/device/${deviceId}/readings`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                const json = await res.json();

                setData(
                    json.map((r: any) => ({
                        timestamp: new Date(r.timestamp).getHours() + ":00",
                        value: Number(r.kwh) // keep raw, formatting handled by chart
                    }))
                );
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [deviceId, token]);

    return (
        <div style={{ width: "100%", height: 300 }}>
            <h4>{deviceName}</h4>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis
                        unit=" kWh"
                        tickFormatter={(value) => value.toFixed(2)}
                    />

                    <Tooltip
                        formatter={(value: number) => [
                            `${value.toFixed(2)} kWh`,
                            "Consumption"
                        ]}
                    />

                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Consumption"
                        stroke="#8884d8"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DeviceChart;
