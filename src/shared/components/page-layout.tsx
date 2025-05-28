import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  type MenuProps,
  Avatar,
  Dropdown,
  Drawer
} from 'antd';
import { Link } from 'react-router';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileQuestion,
  MenuIcon,
  User,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useMediaQuery } from '../hooks/use-mobile';
import LoadingFallback from './loading-fallback';
import { useLayoutLoading } from '../hooks/use-layout';
import { useAuth } from '../../features/auth/hooks/use-auth';

const { Header, Content, Sider } = Layout;

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [collapsed, setCollapsed] = useState(isMobile);
  const { isLoading } = useLayoutLoading();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']);

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <LayoutDashboard size={18} />,
      label: <Link to={'/'}>Dashboard</Link>
    },
    {
      key: '2',
      icon: <BookOpen size={18} />,
      label: <Link to={'/sessoes/lista'}>Sessões</Link>
    },
    {
      key: '3',
      icon: <HelpCircle size={18} />,
      label: <Link to={'/banco-questoes/lista'}>Banco de questões</Link>
    },
    {
      key: '4',
      icon: <FileQuestion size={18} />,
      label: (
        <Link
          to={
            user?.role === 'admin' || user?.role === 'teacher'
              ? '/questionarios/gerenciar'
              : '/questionarios/meus'
          }
        >
          Questionários
        </Link>
      )
    }
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'Meu perfil'
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'Configurações'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'Sair',
      onClick: logout
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setSelectedKeys(['1']);
    } else if (path.includes('/sessoes')) {
      setSelectedKeys(['2']);
    } else if (path.includes('/banco-questoes')) {
      setSelectedKeys(['3']);
    } else if (path.includes('/questionarios')) {
      setSelectedKeys(['4']);
    }
  }, []);

  return (
    <Layout className="h-screen overflow-hidden">
      {!isMobile && (
        <Sider
          width={240}
          className="h-screen overflow-hidden border-r border-gray-100"
          collapsed={collapsed}
          collapsedWidth={80}
          trigger={null}
          theme="light"
          style={{
            position: 'sticky',
            left: 0,
            top: 0
          }}
        >
          <Link
            to={'/'}
            className="p-4 flex items-center justify-center h-16 border-b border-gray-100 cursor-pointer"
          >
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {!collapsed ? 'QRious' : 'QR'}
            </h1>
          </Link>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            className="border-0"
          />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          width={240}
          className="p-0!"
          styles={{
            body: {
              padding: 0
            }
          }}
        >
          <div className="p-4 flex items-center justify-between h-16 border-b border-gray-100">
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              QRious
            </h1>
            <Button
              type="text"
              icon={<X size={18} />}
              onClick={() => setCollapsed(true)}
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            className="border-0 w-full! px-0!"
            style={{
              width: '100%',
              padding: 0
            }}
          />
        </Drawer>
      )}

      <Layout>
        <Header className="px-4 bg-white! shadow-sm border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between w-full h-16">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={toggleSidebar}
              className="mt-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full px-2"
              >
                <Avatar
                  size="small"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center"
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                {!isMobile && (
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user?.name || 'Usuário'}
                  </span>
                )}
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content
          className="overflow-auto relative"
          style={{ height: 'calc(100vh - 80px)' }}
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
              <LoadingFallback />
            </div>
          ) : (
            <div className="m-4 p-6 bg-white border border-gray-100 rounded-lg shadow-sm">
              {children}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PageLayout;
