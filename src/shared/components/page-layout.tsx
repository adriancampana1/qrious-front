import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  type MenuProps,
  Avatar,
  Dropdown,
  Drawer,
  Badge
} from 'antd';
import { Link } from 'react-router';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileQuestion,
  MenuIcon,
  ChevronLeft,
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useMediaQuery } from '../hooks/use-mobile';
import { useAuth } from '../../features/auth/hooks/use-auth';
import LoadingFallback from './loading-fallback';
import { useLayoutLoading } from '../hooks/use-layout';

const { Header, Content, Sider } = Layout;

type PageLayoutPropsType = {
  readonly children: React.ReactNode;
};

const PageLayout: React.FC<PageLayoutPropsType> = ({ children }) => {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isLoading } = useLayoutLoading();

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <LayoutDashboard size={18} />,
      label: <Link to={'/'}>Dashboard</Link>
    },
    {
      key: '2',
      icon: <Users size={18} />,
      label: <Link to={'/usuarios'}>Usuários</Link>
    },
    {
      key: '3',
      icon: <BookOpen size={18} />,
      label: <Link to={'/sessoes'}>Sessões</Link>
    },
    {
      key: '4',
      icon: <HelpCircle size={18} />,
      label: <Link to={'/banco-questoes'}>Banco de questões</Link>
    },
    {
      key: '5',
      icon: <FileQuestion size={18} />,
      label: <Link to={'/questionarios'}>Questionários</Link>
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

  return (
    <Layout className="h-screen overflow-hidden">
      {!isMobile && (
        <Sider
          width={240}
          className="h-screen overflow-hidden shadow-sm"
          collapsed={collapsed}
          collapsedWidth={80}
          trigger={null}
          theme="light"
          style={{
            position: 'sticky',
            left: 0,
            top: 0,
            borderRight: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        >
          <div className="p-4 flex items-center justify-center h-16 border-b border-gray-100">
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {!collapsed ? 'QRious' : 'QR'}
            </h1>
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
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
          style={{ padding: 0 }}
        >
          <div className="p-4 flex items-center justify-between h-16 border-b border-gray-100">
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              EduSystem
            </h1>
            <Button
              type="text"
              icon={<ChevronLeft size={18} />}
              onClick={() => setCollapsed(true)}
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            items={menuItems}
            className="border-0"
          />
        </Drawer>
      )}

      <Layout>
        <Header className="px-4 shadow-sm sticky top-0 z-10 flex items-center justify-between w-full h-16 bg-white!">
          <div className="flex items-center">
            <Button
              type="text"
              icon={<MenuIcon size={20} />}
              onClick={toggleSidebar}
              className="mr-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <Badge count={3} size="small">
              <Button
                type="text"
                shape="circle"
                icon={<Bell size={18} />}
                className="flex items-center justify-center"
              />
            </Badge>

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
          style={{ height: 'calc(100vh - 64px)' }}
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
              <LoadingFallback />
            </div>
          ) : (
            <div className="m-4 p-6 shadow-sm rounded-md bg-white">
              {children}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PageLayout;
