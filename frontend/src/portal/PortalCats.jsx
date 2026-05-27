import { Button, Card, Input, Row, Select, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPortalCats } from './portalApi.js'
import { CatCard } from './PortalHome.jsx'

export default function PortalCats() {
  const navigate = useNavigate()
  const [cats, setCats] = useState([])
  const [filters, setFilters] = useState({})

  const fetchCats = (params = filters) => {
    getPortalCats(params).then(setCats)
  }

  useEffect(() => {
    fetchCats({})
  }, [])

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value || undefined }
    setFilters(next)
    fetchCats(next)
  }

  return (
    <div className="portal-page">
      <Card className="portal-card">
        <Typography.Title level={2}>猫咪图鉴</Typography.Title>
        <Typography.Paragraph>在这里认识校园里的猫咪，了解它们的活动区域、健康状态和领养状态。</Typography.Paragraph>
        <Space wrap className="portal-filter">
          <Input.Search allowClear placeholder="搜索猫咪名称" onSearch={(value) => updateFilter('keyword', value)} />
          <Select allowClear placeholder="健康状态" style={{ width: 160 }} onChange={(value) => updateFilter('health_status', value)} options={['健康', '观察中', '治疗中'].map((item) => ({ label: item, value: item }))} />
          <Select allowClear placeholder="领养状态" style={{ width: 160 }} onChange={(value) => updateFilter('adoption_status', value)} options={['待领养', '已领养', '暂不开放'].map((item) => ({ label: item, value: item }))} />
        </Space>
      </Card>
      <Row gutter={[16, 16]} className="portal-list">
        {cats.map((cat) => <CatCard key={cat.id} cat={cat} onClick={() => navigate(`/portal/cats/${cat.id}`)} />)}
      </Row>
      {cats.length === 0 && <Card className="portal-card"><Tag>暂无猫咪数据</Tag></Card>}
    </div>
  )
}
