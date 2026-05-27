import { Button, Card, Col, Row, Statistic, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPortalCats, getPortalPosts, getPortalStats } from './portalApi.js'

export default function PortalHome() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({})
  const [cats, setCats] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getPortalStats().then(setStats)
    getPortalCats({ adoption_status: '待领养' }).then((rows) => setCats(rows.slice(0, 3)))
    getPortalPosts().then((rows) => setPosts(rows.slice(0, 3)))
  }, [])

  return (
    <div className="portal-page">
      <section className="portal-hero">
        <div>
          <Typography.Title>守护校园里的每一只小生命</Typography.Title>
          <Typography.Paragraph>查看校园猫咪档案，了解救助动态，提交领养申请，用一点点爱让它们拥有更安全的生活。</Typography.Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/portal/cats')}>去看猫咪</Button>
          <Button size="large" className="portal-hero-button" onClick={() => navigate('/portal/donations')}>我要捐助</Button>
        </div>
      </section>

      <Row gutter={[16, 16]} className="portal-stats">
        <Col xs={12} md={6}><Card><Statistic title="猫咪总数" value={stats.cats_total || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="待领养" value={stats.adoptable_total || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="社区动态" value={stats.posts_total || 0} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="累计捐助" value={stats.donation_amount || 0} suffix="元" /></Card></Col>
      </Row>

      <PortalSection title="待领养猫咪" action="查看更多" onAction={() => navigate('/portal/cats')}>
        <Row gutter={[16, 16]}>
          {cats.map((cat) => <CatCard key={cat.id} cat={cat} onClick={() => navigate(`/portal/cats/${cat.id}`)} />)}
        </Row>
      </PortalSection>

      <PortalSection title="最新校园动态" action="查看动态" onAction={() => navigate('/portal/posts')}>
        <Row gutter={[16, 16]}>
          {posts.map((post) => (
            <Col xs={24} md={8} key={post.id}>
              <Card className="portal-card" title={post.title}>
                <Typography.Paragraph ellipsis={{ rows: 3 }}>{post.content}</Typography.Paragraph>
                <Typography.Text type="secondary">{post.category} · {post.publisher}</Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </PortalSection>
    </div>
  )
}

export function PortalSection({ title, action, onAction, children }) {
  return (
    <section className="portal-section">
      <div className="portal-section-title">
        <Typography.Title level={3}>{title}</Typography.Title>
        {action && <Button onClick={onAction}>{action}</Button>}
      </div>
      {children}
    </section>
  )
}

export function CatCard({ cat, onClick }) {
  return (
    <Col xs={24} sm={12} md={8}>
      <Card hoverable className="portal-cat-card" cover={cat.photo ? <img src={cat.photo} /> : null} onClick={onClick}>
        <Card.Meta title={cat.name} description={`${cat.campus_area || '校园'} · ${cat.health_status || '状态未知'} · ${cat.adoption_status || '暂无状态'}`} />
      </Card>
    </Col>
  )
}
