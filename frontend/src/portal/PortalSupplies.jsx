import { Card, Col, Row, Select, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { getPortalSupplies } from './portalApi.js'

const statusColors = { 充足: 'green', 偏少: 'orange', 短缺: 'red' }

export default function PortalSupplies() {
  const [supplies, setSupplies] = useState([])

  const fetchSupplies = (category) => {
    getPortalSupplies({ category }).then(setSupplies)
  }

  useEffect(() => {
    fetchSupplies()
  }, [])

  return (
    <div className="portal-page">
      <Card className="portal-card">
        <Typography.Title level={2}>物资需求</Typography.Title>
        <Typography.Paragraph>了解当前猫粮、猫砂、药品和清洁用品库存情况，优先帮助短缺物资。</Typography.Paragraph>
        <Select allowClear placeholder="物资分类" style={{ width: 180 }} onChange={fetchSupplies} options={['猫粮', '猫砂', '药品', '清洁用品', '笼具', '其他'].map((item) => ({ label: item, value: item }))} />
      </Card>
      <Row gutter={[16, 16]} className="portal-list">
        {supplies.map((item) => (
          <Col xs={24} md={8} key={item.id}>
            <Card className="portal-card" title={item.name}>
              <Tag color="blue">{item.category}</Tag>
              <Tag color={statusColors[item.status] || 'default'}>{item.status}</Tag>
              <Typography.Title level={3} style={{ marginTop: 16 }}>{item.quantity || 0} {item.unit}</Typography.Title>
              <Typography.Text type="secondary">存放位置：{item.storage_location || '-'}</Typography.Text>
              <Typography.Paragraph style={{ marginTop: 12 }}>{item.remark || '暂无备注'}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
