import { Layout, Menu } from 'antd';
import { useState, useEffect } from 'react';
import { DashboardOutlined, AppstoreOutlined, BookOutlined } from '@ant-design/icons';
import Login from './Login';
import Toolbar from './Toolbar';
import Register from './Register';
import Dashboard from './Dashboard';
import RoomView from './RoomView';
import Tutorials from './Tutorials';

const { Header, Footer, Content, Sider } = Layout;

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedModule, setSelectedModule] = useState('dashboard');

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user');

    console.log("UseEffeeecT! =>  ", token, userId)

    if (token && userId) {
      setLoggedIn(true);
    }
  }, []);

  const logout = () => {
    setLoggedIn(false);
    localStorage.clear();
  };

  const renderContent = () => {
    switch (selectedModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'roomview':
        return <RoomView />;
      case 'tutorials':
        return <Tutorials />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ height: "100vh", width: "100%" }}>
      {loggedIn ? (
        <>
          <Header style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            background: '#00631eff'
          }}>
            <div style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              marginRight: 'auto'
            }}>
              EcoMax
            </div>
            <Toolbar logout={logout} />
          </Header>

          <Layout>
            <Sider width={200} style={{ background: '#fff' }}>
              <Menu
                mode="inline"
                selectedKeys={[selectedModule]}
                onClick={(e) => setSelectedModule(e.key)}
                style={{ height: '100%', borderRight: 0 }}
                items={[
                  {
                    key: 'dashboard',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                  },
                  {
                    key: 'roomview',
                    icon: <AppstoreOutlined />,
                    label: 'Room View',
                  },
                  {
                    key: 'tutorials',
                    icon: <BookOutlined />,
                    label: 'Tutorials',
                  },
                ]}
              />
            </Sider>

            <Layout style={{ padding: '24px' }}>
              <Content
                style={{
                  padding: 24,
                  margin: 0,
                  minHeight: 280,
                  background: '#fff',
                  borderRadius: 8,
                  overflow: 'auto'
                }}
              >
                {renderContent()}
              </Content>
            </Layout>
          </Layout>

          <Footer style={{ textAlign: 'center', background: '#00631eff', color: "white" }}>
            EcoMax App - All rights reserved
          </Footer>
        </>
      ) : (
        <Content>
          {authMode === "login" ? (
            <Login
              setLoggedIn={setLoggedIn}
              switchToRegister={() => setAuthMode("register")}
            />
          ) : (
            <Register
              setLoggedIn={setLoggedIn}
              switchToLogin={() => setAuthMode("login")}
            />
          )}
        </Content>
      )}
    </Layout>
  );
};

export default App;