import {useState} from 'react';
import {Button, Card, Form, Input, message} from 'antd';
import {adminAuth} from '../api/client';

export default function AdminLogin({onSuccess}) {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await adminAuth(values.email, values.password);
            message.success('登录成功');
            onSuccess();
        } catch (e) {
            message.error(e.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="管理后台登录" style={{maxWidth: 400, margin: '48px auto'}}>
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item name="email" label="邮箱" rules={[{required: true}]}>
                    <Input type="email" placeholder="admin@example.com"/>
                </Form.Item>
                <Form.Item name="password" label="密码" rules={[{required: true}]}>
                    <Input.Password placeholder="密码"/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
