import { Button, Card, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function PortalMe() {
  const navigate = useNavigate()

  return (
    <div className="portal-page portal-form-page">
      <Card className="portal-card">
        <Typography.Title level={2}>我的</Typography.Title>
        <Typography.Paragraph>这里是学生端个人入口，可以快速发布动态、提交捐助或进入后台管理。</Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button type="primary" block size="large" onClick={() => navigate('/portal/posts/new')}>发布校园动态</Button>
          <Button block size="large" onClick={() => navigate('/portal/donations')}>登记爱心捐助</Button>
          <Button block size="large" onClick={() => navigate('/portal/cats')}>查看猫咪图鉴</Button>
          <Button block size="large" onClick={() => navigate('/auth')}>进入后台管理</Button>
        </Space>
      </Card>
    </div>
  )
}
