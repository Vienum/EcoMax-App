import { useState } from 'react';
import { Row, Col, Menu, Card, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Tutorials = () => {
    const [selectedTutorial, setSelectedTutorial] = useState('add-devices');

    const tutorials = {
        'add-devices': {
            title: 'How to Add Devices',
            content: 'EMPTY'
        },
    };

    const menuItems = [
        {
            key: 'add-devices',
            icon: <BookOutlined />,
            label: 'How to Add Devices',
        },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: 24 }}>Tutorials</h2>

            <Row gutter={24}>
                <Col span={6}>
                    <Card bodyStyle={{ padding: 0 }}>
                        <Menu
                            mode="inline"
                            selectedKeys={[selectedTutorial]}
                            onClick={(e) => setSelectedTutorial(e.key)}
                            items={menuItems}
                            style={{ border: 'none' }}
                        />
                    </Card>
                </Col>

                <Col span={18}>
                    <Card>
                        <Title level={3}>
                            {tutorials[selectedTutorial as keyof typeof tutorials].title}
                        </Title>
                        <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
                            {tutorials[selectedTutorial as keyof typeof tutorials].content}
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Tutorials;