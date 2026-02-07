import {useEffect, useState} from 'react';
import {Button, Form, Input, message, Space} from 'antd';
import {createEntry, updateEntry} from '../api/client';

export default function AdminEntryForm({initial, onSuccess, onCancel}) {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (initial) {
            form.setFieldsValue({abbrev: initial.abbrev, meaning: initial.meaning});
        } else {
            form.resetFields();
        }
    }, [initial, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (initial) {
                await updateEntry(initial.id, values.abbrev.trim(), values.meaning.trim());
                message.success('已更新');
            } else {
                await createEntry(values.abbrev.trim(), values.meaning.trim());
                message.success('已添加');
            }
            onSuccess();
        } catch (e) {
            message.error(e.message || '保存失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="abbrev" label="缩写" rules={[{required: true, message: '请输入缩写'}]}>
                <Input placeholder="如 nlk" autoComplete="off"/>
            </Form.Item>
            <Form.Item name="meaning" label="含义" rules={[{required: true, message: '请输入含义'}]}>
                <Input placeholder="如 奶龙king" autoComplete="off"/>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button onClick={onCancel}>取消</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        保存
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
}
