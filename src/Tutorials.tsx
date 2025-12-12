
import { useState } from 'react';
import { Row, Col, Menu, Card, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Tutorials = () => {
    const [selectedTutorial, setSelectedTutorial] = useState('add-devices');

    const tutorials = {
        'activate-premium': {
            title: 'How to activate Premium access',
            content: '1. Click on your profile in the top right corner\n2. Look for a button called "activate Premium"\n3. Click on the button'
        },
        'deactivate-premium': {
            title: 'How to deactivate Premium Access',
            content: '1. Click on your profile in the top right corner\n2. Look for a button called "deactivate Premium"\n3. Click on the button'
        },
        'add-devices': {
            title: 'How to Add Devices',
            content: 'this is still a work in progress...'
        },
    };

    const menuItems = [
        {
            key: 'activate-premium',
            icon: <BookOutlined />,
            label: 'How to activate Premium Access',
        },
        {
            key: 'deactivate-premium',
            icon: <BookOutlined />,
            label: 'How to deactivate Premium Access',
        },
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
                        <Paragraph style={{ whiteSpace: 'pre-line', fontSize: 16, lineHeight: 1.8 }}>
                            {tutorials[selectedTutorial as keyof typeof tutorials].content}
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Tutorials;