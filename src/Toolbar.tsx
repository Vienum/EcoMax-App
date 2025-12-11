import React from "react";
import { Layout, Dropdown, Space, Typography, Empty, Row, Col, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import raw from "../src/assets/raw.png"


const { Text } = Typography;

interface ToolbarProps {
    logout: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ logout }) => {
    const username = localStorage.getItem("user")
    const items = [
        {
            key: "1",
            label: <Text strong>Hallo {username}</Text>,
        },
        {
            key: "2",
            label: <Button onClick={() => logout()} >Logout</Button>,
        },
        {
            key: "3",
            label: <Empty description="Work in progress..." />,
        },
    ];

    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow trigger={["click"]}>
            <Space
                style={{
                    cursor: "pointer"
                }}
            >
                <UserOutlined style={{ fontSize: '22px', color: "white" }} />
            </Space>
        </Dropdown>
    );
};

export default Toolbar;
