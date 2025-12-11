
import { useState } from 'react';
import { Tabs, Button, Empty } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';

const RoomView = () => {
    const [rooms, setRooms] = useState([
        { key: '1', label: 'Kitchen', devices: [] },
        { key: '2', label: 'Living Room', devices: [] },
    ]);
    const [activeKey, setActiveKey] = useState('1');

    const addRoom = () => {
        const newRoomNumber = rooms.length + 1;
        const newRoom = {
            key: `${Date.now()}`,
            label: `Room ${newRoomNumber}`,
            devices: [],
        };
        setRooms([...rooms, newRoom]);
        setActiveKey(newRoom.key);
    };

    const removeRoom = (targetKey: string) => {
        const newRooms = rooms.filter((room) => room.key !== targetKey);

        if (newRooms.length && activeKey === targetKey) {
            setActiveKey(newRooms[newRooms.length - 1].key);
        }

        setRooms(newRooms);
    };

    const addDevice = () => {
        // TODO: Open modal to add device
        console.log('Add device to room:', activeKey);
    };

    const items = rooms.map((room) => ({
        key: room.key,
        label: room.label,
        children: (
            <div style={{ padding: '20px 0' }}>
                {room.devices.length === 0 ? (
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
                        {/* Device list will go here */}
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
                    onClick={addDevice}
                >
                    Add Device
                </Button>
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
        </div>
    );
};

export default RoomView;