import { HeartOutlined, HomeOutlined, MedicineBoxOutlined, MessageOutlined, GiftOutlined, DollarOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Space, Typography } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Sider, Header, Content } = Layout

const menuItems = [
  { key: '/', icon: <HomeOutlined />, label: <Link to="/">首页概览</Link> },
  { key: '/cats', icon: <HeartOutlined />, label: <Link to="/cats">猫咪档案</Link> },
  { key: '/health', icon: <MedicineBoxOutlined />, label: <Link to="/health">健康管理</Link> },
  { key: '/adoptions', icon: <FileTextOutlined />, label: <Link to="/adoptions">猫咪领养</Link> },
  { key: '/community', icon: <MessageOutlined />, label: <Link to="/community">动态社区</Link> },
  { key: '/supplies', icon: <GiftOutlined />, label: <Link to="/supplies">物资管理</Link> },
  { key: '/donations', icon: <DollarOutlined />, label: <Link to="/donations">爱心捐助</Link> },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('campus_cats_user') || '{}')

  const logout = () => {
    localStorage.removeItem('campus_cats_token')
    localStorage.removeItem('campus_cats_user')
    navigate('/auth', { replace: true })
  }

  return (
    <Layout className="site-layout">
      <Sider width={230} theme="dark">
        <div className="logo">校园萌宠守护系统</div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="header-bar">
          <Typography.Title level={4} style={{ margin: 0 }}>校园猫咪后台管理</Typography.Title>
          <Space>
            <Typography.Text type="secondary">{user.username ? `当前用户：${user.username}` : '守护校园里的每一只小生命'}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={logout}>退出登录</Button>
          </Space>
        </Header>
        <Content className="page-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
