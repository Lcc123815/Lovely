import { Card, Col, Row, Statistic } from 'antd'
import { useEffect, useState } from 'react'
import { getDashboardStats } from '../api/index.js'

export default function Dashboard() {
  const [stats, setStats] = useState({})

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  const items = [
    { title: '猫咪总数', value: stats.cats_total || 0 },
    { title: '待领养', value: stats.adoptable_total || 0 },
    { title: '健康异常', value: stats.health_warning_total || 0 },
    { title: '社区动态', value: stats.posts_total || 0 },
    { title: '物资总量', value: stats.supplies_total || 0 },
    { title: '捐助总额', value: stats.donation_amount || 0 },
  ]

  return (
    <div>
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.title}>
            <Card className="stat-card">
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="系统说明" className="page-card" style={{ marginTop: 24 }}>
        这是校园萌宠守护系统的后台管理首页，当前版本已接入 FastAPI + MySQL，并支持猫咪档案、健康管理、领养、社区、物资和捐助模块的基础增删改查。
      </Card>
    </div>
  )
}
