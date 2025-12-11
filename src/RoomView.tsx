import { useState, useEffect } from 'react';
import { Tabs, Button, Empty, message, Modal, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DeviceChart from './DeviceChart';

interface Device {
    device_id: number;
    device_name: string;
    device_type: string;
}

interface Room {
    room_id: number;
    room_name: string;
    devices: Device[];
}

const RoomView = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeKey, setActiveKey] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    const token = localStorage.getItem('token');

    // Fetch rooms and devices from backend
    const fetchRooms = async () => {
        if (!token) return;
        try {
            const res = await fetch('http://localhost:3001/api/rooms', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data: Room[] = await res.json();
            setRooms(data);
            if (data.length > 0) setActiveKey(data[0].room_id.toString());
        } catch (err) {
            console.error(err);
            message.error('Failed to fetch rooms');
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // Open modal to name new room
    const addRoom = () => {
        setNewRoomName('');
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        if (!newRoomName.trim()) {
            message.error("Room name cannot be empty");
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ room_name: newRoomName })
            });

            if (!res.ok) {
                throw new Error('Failed to create room');
            }

            const newRoom: Room = await res.json();
            setRooms([...rooms, newRoom]);
            setActiveKey(newRoom.room_id.toString());
            setIsModalOpen(false);
            message.success(`Room "${newRoomName}" created!`);
        } catch (err) {
            console.error(err);
            message.error("Error creating room");
        }
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
    };

    const removeRoom = (targetKey: string) => {
        const newRooms = rooms.filter((room) => room.room_id.toString() !== targetKey);
        if (newRooms.length && activeKey === targetKey) {
            setActiveKey(newRooms[0].room_id.toString());
        }
        setRooms(newRooms);
        // TODO: Add backend delete endpoint later
    };

    const addDevice = () => {
        console.log('Add device to room:', activeKey);
        // TODO: Open modal to add device and POST to backend
    };

    const items = rooms.map((room) => ({
        key: room.room_id.toString(),
        label: room.room_name,
        children: (
            <div style={{ padding: '20px 0' }}>
                {!room.devices ? (
                    <Empty
                        description="No devices added yet"
                        style={{ marginTop: 60 }}
                    >
                        <Button type="primary" onClick={addDevice}>
                            Add Your First Device
                        </Button>
                    </Empty>
                ) : (
                    <div>
                        {room.devices.map(device => (
                            <DeviceChart
                                key={device.device_id}
                                deviceId={device.device_id}
                                deviceName={device.device_name}
                            />
                        ))}
                    </div>
                )}
            </div>
        ),
        closable: rooms.length > 1,
    }));

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                <h2 style={{ margin: 0 }}>Room View</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addRoom}
                >
                    Add Room
                </Button>
            </div>

            <Tabs
                type="editable-card"
                activeKey={activeKey}
                onChange={setActiveKey}
                onEdit={(targetKey, action) => {
                    if (action === 'add') addRoom();
                    else if (action === 'remove') removeRoom(targetKey as string);
                }}
                items={items}
            />

            <Modal
                title="New Room"
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Create"
            >
                <Input
                    placeholder="Enter room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default RoomView;
