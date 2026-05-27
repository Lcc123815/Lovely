import { AppstoreOutlined, HeartOutlined, HomeOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Layout, Menu, Space, Typography } from 'antd'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Content, Footer } = Layout

const items = [
  { key: '/portal', label: <Link to="/portal">首页</Link> },
  { key: '/portal/cats', label: <Link to="/portal/cats">猫咪图鉴</Link> },
  { key: '/portal/posts', label: <Link to="/portal/posts">校园动态</Link> },
  { key: '/portal/supplies', label: <Link to="/portal/supplies">物资需求</Link> },
  { key: '/portal/donations', label: <Link to="/portal/donations">爱心捐助</Link> },
]

const mobileItems = [
  { key: '/portal', icon: <HomeOutlined />, label: '首页' },
  { key: '/portal/cats', icon: <HeartOutlined />, label: '猫咪' },
  { key: '/portal/posts', icon: <MessageOutlined />, label: '动态' },
  { key: '/portal/supplies', icon: <AppstoreOutlined />, label: '物资' },
  { key: '/portal/me', icon: <UserOutlined />, label: '我的' },
]

export default function PortalLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedKey = items.find((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))?.key || '/portal'
  const selectedMobileKey = mobileItems.find((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))?.key || '/portal'

  return (
    <Layout className="portal-layout">
      <Header className="portal-header">
        <Link to="/portal" className="portal-brand">
          <HeartOutlined />
          <span>校园萌宠守护</span>
        </Link>
        <Menu mode="horizontal" selectedKeys={[selectedKey]} items={items} className="portal-menu" />
        <Space className="portal-actions">
          <Button type="primary" onClick={() => navigate('/portal/posts/new')}>发布动态</Button>
          <Button onClick={() => navigate('/auth')}>后台入口</Button>
        </Space>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer className="portal-footer">
        <Typography.Text type="secondary">校园萌宠守护系统 · 用温柔守护每一只小生命</Typography.Text>
      </Footer>
      <div className="portal-bottom-nav">
        {mobileItems.map((item) => (
          <button key={item.key} className={selectedMobileKey === item.key ? 'active' : ''} onClick={() => navigate(item.key)}>
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </Layout>
  )
}
