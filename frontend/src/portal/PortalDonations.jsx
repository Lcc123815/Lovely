import { Button, Card, DatePicker, Form, Input, InputNumber, Select, Typography, message } from 'antd'
import { createPortalDonation } from './portalApi.js'

export default function PortalDonations() {
  const [form] = Form.useForm()

  const submitDonation = async () => {
    const values = await form.validateFields()
    if (values.donation_date) {
      values.donation_date = values.donation_date.format('YYYY-MM-DD')
    }
    await createPortalDonation(values)
    message.success('感谢你的爱心捐助，后台已收到记录')
    form.resetFields()
  }

  return (
    <div className="portal-page portal-form-page">
      <Card className="portal-card">
        <Typography.Title level={2}>爱心捐助</Typography.Title>
        <Typography.Paragraph>你可以登记资金或物资捐助信息，后台守护团队会统一确认和记录。</Typography.Paragraph>
        <Form form={form} layout="vertical">
          <Form.Item name="donor_name" label="捐助人" rules={[{ required: true, message: '请输入捐助人' }]}><Input /></Form.Item>
          <Form.Item name="donation_type" label="捐助类型" rules={[{ required: true, message: '请选择捐助类型' }]}><Select options={['资金', '物资', '其他'].map((item) => ({ label: item, value: item }))} /></Form.Item>
          <Form.Item name="amount" label="金额"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="material_name" label="物资名称"><Input /></Form.Item>
          <Form.Item name="quantity" label="物资数量"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="donation_date" label="捐助日期"><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="contact" label="联系方式"><Input /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={4} /></Form.Item>
          <Button type="primary" size="large" onClick={submitDonation}>提交捐助信息</Button>
        </Form>
      </Card>
    </div>
  )
}
