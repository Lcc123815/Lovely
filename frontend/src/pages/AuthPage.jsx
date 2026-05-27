import { useState } from 'react'
import { App, Button, Card, Col, Form, Input, Row, Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api/index.js'

export default function AuthPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async () => {
    try {
      const values = await loginForm.validateFields()
      const result = await login(values)
      localStorage.setItem('campus_cats_token', result.token)
      localStorage.setItem('campus_cats_user', JSON.stringify(result.user))
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (error) {
      message.error(error?.code === 'ECONNABORTED' ? '请求超时，请检查后端是否已启动' : error?.response?.data?.detail || error?.message || '登录失败')
    }
  }

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields()
      await register(values)
      message.success('注册成功，请登录')
      registerForm.resetFields()
      setActiveTab('login')
      navigate('/auth', { replace: true })
    } catch (error) {
      message.error(error?.code === 'ECONNABORTED' ? '请求超时，请检查后端是否已启动' : error?.response?.data?.detail || error?.message || '注册失败')
    }
  }

  return (
    <div className="auth-page">
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: 24 }}>
        <Col xs={24} sm={22} md={16} lg={10} xl={8}>
          <Card className="auth-card" title="校园萌宠守护系统">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'login',
                  label: '登录',
                  children: (
                    <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
                      <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                        <Input placeholder="请输入用户名" />
                      </Form.Item>
                      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                        <Input.Password placeholder="请输入密码" />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        登录并进入首页概览
                      </Button>
                    </Form>
                  ),
                },
                {
                  key: 'register',
                  label: '注册',
                  children: (
                    <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
                      <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }, { min: 3, message: '用户名至少 3 个字符' }]}>
                        <Input placeholder="请输入用户名" />
                      </Form.Item>
                      <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少 6 个字符' }]}>
                        <Input.Password placeholder="请输入密码" />
                      </Form.Item>
                      <Form.Item name="confirmPassword" label="确认密码" dependencies={["password"]} rules={[
                        { required: true, message: '请再次输入密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve()
                            }
                            return Promise.reject(new Error('两次密码输入不一致'))
                          },
                        }),
                      ]}>
                        <Input.Password placeholder="请再次输入密码" />
                      </Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        onClick={() => {
                          const password = registerForm.getFieldValue('password')
                          const confirmPassword = registerForm.getFieldValue('confirmPassword')
                          if (password && confirmPassword && password !== confirmPassword) {
                            return
                          }
                        }}
                      >
                        注册
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
