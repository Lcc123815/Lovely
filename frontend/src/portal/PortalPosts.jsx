import { Button, Card, Col, Image, Row, Select, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPortalPosts } from './portalApi.js'

export default function PortalPosts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])

  const fetchPosts = (category) => {
    getPortalPosts({ category }).then(setPosts)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="portal-page">
      <Card className="portal-card">
        <Space className="portal-title-row" align="start">
          <div>
            <Typography.Title level={2}>校园动态</Typography.Title>
            <Typography.Paragraph>浏览和发布校园猫咪日常、救助公告、领养宣传和活动通知。</Typography.Paragraph>
          </div>
          <Button type="primary" onClick={() => navigate('/portal/posts/new')}>发布动态</Button>
        </Space>
        <Select allowClear placeholder="动态分类" style={{ width: 180 }} onChange={fetchPosts} options={['日常动态', '寻猫启事', '救助公告', '领养宣传', '活动通知', '物资求助'].map((item) => ({ label: item, value: item }))} />
      </Card>
      <Row gutter={[16, 16]} className="portal-list">
        {posts.map((post) => {
          const image = (post.images || '').split(',').filter(Boolean)[0]
          return (
            <Col xs={24} md={8} key={post.id}>
              <Card hoverable className="portal-card portal-post-card" onClick={() => navigate(`/portal/posts/${post.id}`)} cover={image ? <Image src={image} preview={false} /> : null}>
                <Tag color="orange">{post.category}</Tag>
                <Typography.Title level={4} style={{ marginTop: 12 }}>{post.title}</Typography.Title>
                <Typography.Paragraph ellipsis={{ rows: 3 }}>{post.content}</Typography.Paragraph>
                <Typography.Text type="secondary">发布人：{post.publisher || '校园猫咪守护队'} · 点赞 {post.likes || 0}</Typography.Text>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
