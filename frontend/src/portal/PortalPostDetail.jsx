import { HeartOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Card, Form, Image, Input, List, Space, Tag, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createPortalComment, getPortalComments, getPortalPostDetail, likePortalPost } from './portalApi.js'

export default function PortalPostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [form] = Form.useForm()

  const fetchData = () => {
    getPortalPostDetail(id).then(setPost)
    getPortalComments(id).then(setComments)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const like = async () => {
    const next = await likePortalPost(id)
    setPost(next)
  }

  const submitComment = async () => {
    const values = await form.validateFields()
    await createPortalComment(id, values)
    message.success('评论已发布')
    form.resetFields()
    getPortalComments(id).then(setComments)
  }

  if (!post) {
    return <div className="portal-page"><Card>加载中...</Card></div>
  }

  const images = (post.images || '').split(',').filter(Boolean)

  return (
    <div className="portal-page portal-detail-page">
      <Card className="portal-card">
        <Space wrap>
          <Tag color="orange">{post.category}</Tag>
          <Typography.Text type="secondary">发布人：{post.publisher || '匿名同学'}</Typography.Text>
          <Typography.Text type="secondary">{post.created_at}</Typography.Text>
        </Space>
        <Typography.Title level={2} style={{ marginTop: 16 }}>{post.title}</Typography.Title>
        <Typography.Paragraph className="portal-post-content">{post.content}</Typography.Paragraph>
        {images.length > 0 && (
          <Image.PreviewGroup>
            <div className="portal-image-grid">
              {images.map((url) => <Image key={url} src={url} />)}
            </div>
          </Image.PreviewGroup>
        )}
        <Space style={{ marginTop: 20 }}>
          <Button type="primary" icon={<HeartOutlined />} onClick={like}>点赞 {post.likes || 0}</Button>
          <Button icon={<MessageOutlined />}>评论 {comments.length}</Button>
        </Space>
      </Card>

      <Card className="portal-card" title="评论" style={{ marginTop: 24 }}>
        <Form form={form} layout="vertical">
          <Form.Item name="author_name" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}><Input /></Form.Item>
          <Form.Item name="content" label="评论内容" rules={[{ required: true, message: '请输入评论内容' }]}><Input.TextArea rows={3} /></Form.Item>
          <Button type="primary" onClick={submitComment}>发表评论</Button>
        </Form>
        <List
          style={{ marginTop: 20 }}
          dataSource={comments}
          locale={{ emptyText: '暂无评论' }}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta title={item.author_name} description={item.content} />
              <Typography.Text type="secondary">{item.created_at}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
