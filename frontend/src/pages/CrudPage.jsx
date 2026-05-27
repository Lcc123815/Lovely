import { Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, message } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { createItem, deleteItem, listItems, updateItem } from '../api/index.js'

export default function CrudPage({ config }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({})
  const [form] = Form.useForm()

  const fetchData = async (params = filters) => {
    setLoading(true)
    try {
      const rows = await listItems(config.resource, params)
      setData(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setFilters({})
    setEditing(null)
    setModalOpen(false)
    form.resetFields()
    fetchData({})
  }, [config.resource])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    const values = { ...record }
    config.fields.forEach((field) => {
      if (field.type === 'date' && values[field.name]) {
        values[field.name] = dayjs(values[field.name])
      }
    })
    form.setFieldsValue(values)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    config.fields.forEach((field) => {
      if (field.type === 'date' && values[field.name]) {
        values[field.name] = values[field.name].format('YYYY-MM-DD')
      }
    })
    if (editing) {
      await updateItem(config.resource, editing.id, values)
      message.success('修改成功')
    } else {
      await createItem(config.resource, values)
      message.success('新增成功')
    }
    setModalOpen(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    await deleteItem(config.resource, id)
    message.success('删除成功')
    fetchData()
  }

  const columns = useMemo(() => [
    ...config.columns,
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除这条数据吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [config])

  const updateFilter = (name, value) => {
    const next = { ...filters, [name]: value || undefined }
    setFilters(next)
    fetchData(next)
  }

  return (
    <Card className="page-card" title={config.title} extra={<Button type="primary" onClick={openCreate}>新增</Button>}>
      <div className="toolbar">
        <Input.Search
          allowClear
          placeholder={config.searchPlaceholder}
          style={{ width: 240 }}
          onSearch={(value) => updateFilter('keyword', value)}
        />
        {(config.filters || []).map((filter) => (
          <Select
            allowClear
            key={filter.name}
            placeholder={filter.placeholder}
            style={{ width: 180 }}
            options={filter.options.map((item) => ({ label: item, value: item }))}
            onChange={(value) => updateFilter(filter.name, value)}
          />
        ))}
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={data} scroll={{ x: 1000 }} />
      <Modal
        title={editing ? `编辑${config.title}` : `新增${config.title}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          {config.fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
            >
              {field.type === 'select' ? (
                <Select options={field.options.map((item) => ({ label: item, value: item }))} />
              ) : field.type === 'textarea' ? (
                <Input.TextArea rows={4} />
              ) : field.type === 'number' ? (
                <InputNumber style={{ width: '100%' }} />
              ) : field.type === 'date' ? (
                <DatePicker style={{ width: '100%' }} />
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </Card>
  )
}
