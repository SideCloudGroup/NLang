import {useEffect, useMemo, useState} from 'react';
import {Button, Card, Input, message, Modal, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {adminLogout, deleteEntry, listEntries,} from '../api/client';
import AdminEntryForm from '../components/AdminEntryForm';

export default function AdminList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const items = await listEntries();
            setData(items);
        } catch (e) {
            message.error(e.message || '加载失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchText.trim()) return data;
        const kw = searchText.trim().toLowerCase();
        return data.filter(
            (row) =>
                (row.abbrev && row.abbrev.toLowerCase().includes(kw)) ||
                (row.meaning && row.meaning.toLowerCase().includes(kw))
        );
    }, [data, searchText]);

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: `删除缩写「${record.abbrev}」的含义「${record.meaning}」？`,
            onOk: async () => {
                try {
                    await deleteEntry(record.id);
                    message.success('已删除');
                    load();
                } catch (e) {
                    message.error(e.message || '删除失败');
                }
            },
        });
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        setModalOpen(true);
    };

    const handleFormClose = (refreshed) => {
        setModalOpen(false);
        setEditingRecord(null);
        if (refreshed) load();
    };

    const columns = [
        {title: '缩写', dataIndex: 'abbrev', key: 'abbrev', width: 120},
        {title: '含义', dataIndex: 'meaning', key: 'meaning'},
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined/>}
                            onClick={() => handleDelete(record)}>
                        删除
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="缩写管理"
            extra={
                <Space>
                    <Button onClick={() => {
                        adminLogout();
                        window.location.href = '/admin';
                    }}>
                        退出
                    </Button>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
                        新增
                    </Button>
                </Space>
            }
            style={{margin: 24}}
        >
            <Space direction="vertical" style={{width: '100%', marginBottom: 16}} size="middle">
                <Input
                    placeholder="按缩写或含义搜索"
                    prefix={<SearchOutlined/>}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    style={{maxWidth: 320}}
                />
            </Space>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{
                    defaultPageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
            />
            <Modal
                title={editingRecord ? '编辑' : '新增缩写'}
                open={modalOpen}
                onCancel={() => handleFormClose(false)}
                footer={null}
                destroyOnClose
            >
                <AdminEntryForm
                    initial={editingRecord}
                    onSuccess={() => handleFormClose(true)}
                    onCancel={() => handleFormClose(false)}
                />
            </Modal>
        </Card>
    );
}
