import { Button, Card, Form, Input, Select, Space, Typography, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortalPost, uploadImage } from './portalApi.js'

export default function PortalPostNew() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)

  const beforeUpload = async (file) => {
    setUploading(true)
    try {
      const result = await uploadImage(file)
      setImages((list) => [...list, result.url])
      message.success('图片上传成功')
    } finally {
      setUploading(false)
    }
    return false
  }

  const submitPost = async () => {
    const values = await form.validateFields()
    await createPortalPost({ ...values, images: images.join(','), status: '显示' })
    message.success('动态发布成功')
    navigate('/portal/posts')
  }

  return (
    <div className="portal-page portal-form-page">
      <Card className="portal-card">
        <Typography.Title level={2}>发布校园动态</Typography.Title>
        <Typography.Paragraph>分享你看到的猫咪日常、救助线索、领养宣传或物资求助。</Typography.Paragraph>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}><Input /></Form.Item>
          <Form.Item name="publisher" label="发布人" rules={[{ required: true, message: '请输入发布人' }]}><Input /></Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={['日常动态', '寻猫启事', '救助公告', '领养宣传', '活动通知', '物资求助'].map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}><Input.TextArea rows={5} /></Form.Item>
          <Form.Item label="图片">
            <Upload listType="picture-card" beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
              <button type="button" className="portal-upload-button" disabled={uploading}>
                <PlusOutlined />
                <span>{uploading ? '上传中' : '上传图片'}</span>
              </button>
            </Upload>
            <Space wrap>
              {images.map((url) => <img key={url} src={url} className="portal-upload-preview" />)}
            </Space>
          </Form.Item>
          <Button type="primary" size="large" onClick={submitPost}>发布动态</Button>
        </Form>
      </Card>
    </div>
  )
}
