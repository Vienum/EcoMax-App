import { useState, useEffect } from 'react';
import { Tabs, Button, Empty, Select, Card, Row, Col, Modal, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const RoomView = () => {
    const [rooms, setRooms] = useState([]);
    const [activeKey, setActiveKey] = useState<any>('');
    const [timeRange, setTimeRange] = useState<any>('24h');
    const [roomConsumption, setRoomConsumption] = useState<any>({});
    const [loading, setLoading] = useState<any>(false);
    const [isRoomModalOpen, setIsRoomModalOpen] = useState<any>(false);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<any>(false);
    const [newRoomName, setNewRoomName] = useState<any>('');
    const [deviceNumber, setDeviceNumber] = useState<any>('');

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a28bd4", "#ff6b9d"];

    // Fetch rooms on component mount
    useEffect(() => {
        fetchRooms();
    }, []);

    // Fetch room consumption when active room or time range changes
    useEffect(() => {
        if (activeKey) {
            fetchRoomConsumption(activeKey);
        }
    }, [activeKey, timeRange]);

    const fetchRooms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRooms(data);
            if (data.length > 0 && !activeKey) {
                setActiveKey(data[0].room_id.toString());
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const fetchRoomConsumption = async (roomId: any) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/api/room/${roomId}/consumption?range=${timeRange}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const data = await response.json();
            setRoomConsumption({ ...roomConsumption, [roomId]: data });
        } catch (error) {
            console.error('Error fetching room consumption:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRoom = () => {
        setIsRoomModalOpen(true);
        setNewRoomName('');
    };

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) {
            message.error('Please enter a room name');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/rooms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ room_name: newRoomName })
            });

            if (response.ok) {
                const data = await response.json();
                message.success('Room created successfully');
                setIsRoomModalOpen(false);
                fetchRooms(); // Refresh the rooms list
            } else {
                message.error('Failed to create room');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            message.error('Error creating room');
        }
    };

    const addDevice = () => {
        setIsDeviceModalOpen(true);
        setDeviceNumber('');
    };

    const handleLinkDevice = async () => {
        if (!deviceNumber.trim()) {
            message.error('Please enter a device number');
            return;
        }

        // TODO: Implement device linking logic with backend
        message.success(`Device ${deviceNumber} linked successfully!`);
        setIsDeviceModalOpen(false);

        // You would typically call your backend here to link the device
        // For now, just close the modal
    };

    const removeRoom = async (targetKey: any) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:3001/api/room/${targetKey}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const newRooms: any = rooms.filter((room: any) => room.room_id.toString() !== targetKey);

            if (newRooms.length && activeKey === targetKey) {
                setActiveKey(newRooms[newRooms.length - 1].room_id.toString());
            }

            setRooms(newRooms);
            message.success('Room deleted successfully');
        } catch (error) {
            console.error('Error deleting room:', error);
            message.error('Error deleting room');
        }
    };

    // Merge device data for chart
    const getMergedChartData = (devices: any) => {
        if (!devices || devices.length === 0) return [];

        const timeMap: any = {};

        devices.forEach((device: any) => {
            device.data.forEach((point: any) => {
                if (!timeMap[point.time]) {
                    timeMap[point.time] = { time: point.time };
                }
                timeMap[point.time][device.device_name] = point.kwh;
            });
        });

        return Object.values(timeMap).sort((a: any, b: any) => a.time.localeCompare(b.time));
    };

    const items = rooms.map((room: any) => {
        const consumption = roomConsumption[room.room_id] || [];
        const chartData = getMergedChartData(consumption);

        return {
            key: room.room_id.toString(),
            label: room.room_name,
            children: (
                <div style={{ padding: '20px 0' }}>
                    {room.devices && room.devices.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {/* Device List */}
                            <Col span={24}>
                                <Card title="Devices in this Room" size="small">
                                    <Row gutter={[8, 8]}>
                                        {room.devices.map((device: any) => (
                                            <Col span={8} key={device.device_id}>
                                                <Card
                                                    size="small"
                                                    style={{
                                                        backgroundColor: '#f5f5f5',
                                                        borderLeft: '4px solid #1890ff'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 500 }}>{device.device_name}</div>
                                                    <div style={{ fontSize: 12, color: '#666' }}>{device.device_type}</div>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>
                            </Col>

                            {/* Consumption Chart */}
                            <Col span={24}>
                                <Card
                                    title={`${timeRange === '24h' ? 'Hourly' : 'Daily'} Consumption`}
                                    loading={loading}
                                >
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="time"
                                                    tick={{ fontSize: 10 }}
                                                    interval={timeRange === '24h' ? 2 : 1}
                                                />
                                                <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip formatter={(value: any) => `${value.toFixed(2)} kWh`} />
                                                <Legend />
                                                {consumption.map((device: any, idx: any) => (
                                                    <Line
                                                        key={device.device_id}
                                                        type="monotone"
                                                        dataKey={device.device_name}
                                                        stroke={COLORS[idx % COLORS.length]}
                                                        strokeWidth={2}
                                                        dot={{ r: 3 }}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Empty description="No consumption data available" />
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Empty
                            description="No devices added yet"
                            style={{ marginTop: 60 }}
                        >
                            <Button type="primary" onClick={addDevice}>
                                Add Your First Device
                            </Button>
                        </Empty>
                    )}
                </div>
            ),
            closable: rooms.length > 1,
        };
    });

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                <h2 style={{ margin: 0 }}>Room View</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        style={{ width: 160 }}
                        options={[
                            { value: '24h', label: 'Last 24 Hours' },
                            { value: '7d', label: 'Last 7 Days' },
                            { value: '30d', label: 'Last 30 Days' },
                        ]}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addDevice}
                    >
                        Add Device
                    </Button>
                </div>
            </div>

            <Tabs
                type="editable-card"
                activeKey={activeKey}
                onChange={setActiveKey}
                onEdit={(targetKey, action) => {
                    if (action === 'add') {
                        addRoom();
                    } else if (action === 'remove') {
                        removeRoom(targetKey as string);
                    }
                }}
                items={items}
            />

            {/* Create Room Modal */}
            <Modal
                title="Create New Room"
                open={isRoomModalOpen}
                onOk={handleCreateRoom}
                onCancel={() => setIsRoomModalOpen(false)}
                okText="Create"
            >
                <Input
                    placeholder="Enter room name (e.g., Kitchen, Bedroom)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    onPressEnter={handleCreateRoom}
                />
            </Modal>

            {/* Link Device Modal */}
            <Modal
                title="Link Your EcoMax Current-O-Meter"
                open={isDeviceModalOpen}
                onOk={handleLinkDevice}
                onCancel={() => setIsDeviceModalOpen(false)}
                okText="Link Device"
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                        Enter Device Number:
                    </label>
                    <Input
                        type="number"
                        placeholder="e.g., 12345678"
                        value={deviceNumber}
                        onChange={(e) => setDeviceNumber(e.target.value)}
                        onPressEnter={handleLinkDevice}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                    You can find the device number on the back of your EcoMax Current-O-Meter.
                </div>
            </Modal>
        </div>
    );
};

export default RoomView;