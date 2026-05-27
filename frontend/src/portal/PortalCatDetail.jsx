import { Button, Card, Col, Descriptions, Form, Image, Input, Modal, Row, Space, Tag, Timeline, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createPortalAdoption, getPortalCatDetail } from './portalApi.js'

export default function PortalCatDetail() {
  const { id } = useParams()
  const [cat, setCat] = useState(null)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getPortalCatDetail(id).then(setCat)
  }, [id])

  const submitAdoption = async () => {
    const values = await form.validateFields()
    await createPortalAdoption({ ...values, cat_id: Number(id), cat_name: cat.name })
    message.success('申请已提交，请等待后台审核')
    form.resetFields()
    setOpen(false)
  }

  if (!cat) {
    return <div className="portal-page"><Card>加载中...</Card></div>
  }

  return (
    <div className="portal-page">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card className="portal-card">
            {cat.photo && <Image src={cat.photo} className="portal-detail-photo" />}
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card className="portal-card">
            <Space align="center">
              <Typography.Title level={2} style={{ margin: 0 }}>{cat.name}</Typography.Title>
              <Tag color={cat.adoption_status === '待领养' ? 'gold' : 'blue'}>{cat.adoption_status}</Tag>
              <Tag color={cat.health_status === '健康' ? 'green' : 'orange'}>{cat.health_status}</Tag>
            </Space>
            <Descriptions column={2} bordered style={{ marginTop: 20 }}>
              <Descriptions.Item label="性别">{cat.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{cat.age || '-'}</Descriptions.Item>
              <Descriptions.Item label="毛色">{cat.color || '-'}</Descriptions.Item>
              <Descriptions.Item label="品种">{cat.breed || '-'}</Descriptions.Item>
              <Descriptions.Item label="活动区域">{cat.campus_area || '-'}</Descriptions.Item>
              <Descriptions.Item label="是否绝育">{cat.sterilized || '-'}</Descriptions.Item>
              <Descriptions.Item label="性格" span={2}>{cat.personality || '-'}</Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>{cat.description || '-'}</Descriptions.Item>
            </Descriptions>
            <Button type="primary" size="large" disabled={cat.adoption_status !== '待领养'} onClick={() => setOpen(true)} style={{ marginTop: 20 }}>
              {cat.adoption_status === '待领养' ? '申请领养' : '暂不可申请'}
            </Button>
          </Card>
        </Col>
      </Row>

      <Card className="portal-card" title="健康记录" style={{ marginTop: 24 }}>
        <Timeline items={(cat.health_records || []).map((item) => ({ children: `${item.record_date || ''} ${item.record_type || ''}：${item.treatment || item.symptom || '暂无详情'}` }))} />
        {(cat.health_records || []).length === 0 && <Typography.Text type="secondary">暂无健康记录</Typography.Text>}
      </Card>

      <Modal title="领养申请" open={open} onCancel={() => setOpen(false)} onOk={submitAdoption} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="applicant_name" label="申请人姓名" rules={[{ required: true, message: '请输入申请人姓名' }]}><Input /></Form.Item>
          <Form.Item name="student_no" label="学号"><Input /></Form.Item>
          <Form.Item name="phone" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}><Input /></Form.Item>
          <Form.Item name="college" label="学院"><Input /></Form.Item>
          <Form.Item name="reason" label="申请理由" rules={[{ required: true, message: '请输入申请理由' }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="experience" label="养宠经验"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
