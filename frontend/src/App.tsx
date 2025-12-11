import { Flex, Layout } from 'antd';
import Dashboard from './Dashboard';

const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#000000ff',
  height: 64,
  paddingInline: 48,
  lineHeight: '64px',
  borderStyle: "solid", 
  borderWidth: "2px",
  borderColor: '#42bb2fff',
  backgroundColor: '#ffffffff',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#000000ff',
  backgroundColor: '#ffffffff',
};

const siderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#1677ff',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  backgroundColor: '#42bb2fff',
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
  width: '100%',
  maxWidth: '100%',
};

const App = () => {
  
  return (
  <Flex gap="middle" wrap style={{height: "100%", width:  "100%"}}>
    <Layout style={layoutStyle}>
      <Header style={headerStyle}>TOOLBAR</Header>
      <Content style={contentStyle}><Dashboard /></Content>
      <Footer style={footerStyle}>EcoMax App - All rights reserved</Footer>
    </Layout>
  </Flex>
  
  )
}

export default App

