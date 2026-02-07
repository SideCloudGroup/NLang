import {useState} from 'react';
import {Alert, Button, Card, Input, List, message} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {queryAbbrev} from '../api/client';

export default function QueryPage() {
    const [abbrev, setAbbrev] = useState('');
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [searchedEmpty, setSearchedEmpty] = useState(false);

    const handleSearch = async () => {
        const trimmed = abbrev.trim();
        if (!trimmed) {
            message.info('请输入缩写');
            return;
        }
        setLoading(true);
        setItems([]);
        setSearchedEmpty(false);
        try {
            const list = await queryAbbrev(trimmed.toLowerCase());
            setItems(list);
            if (list.length === 0) setSearchedEmpty(true);
        } catch (e) {
            message.error(e.message || '查询失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="NLang 缩写查询" style={{maxWidth: 560, margin: '24px auto'}}>
            <Input
                placeholder="输入缩写，如 nlk"
                autoComplete="off"
                value={abbrev}
                onChange={(e) => setAbbrev(e.target.value)}
                onPressEnter={handleSearch}
                suffix={
                    <Button type="primary" icon={<SearchOutlined/>} loading={loading} onClick={handleSearch}>
                        查询
                    </Button>
                }
                allowClear
                size="large"
            />
            {searchedEmpty && (
                <Alert
                    type="info"
                    message="暂无收录"
                    description="该缩写尚未收录，欢迎联系管理员添加。"
                    showIcon
                    style={{marginTop: 16}}
                />
            )}
            {items.length > 0 && (
                <List
                    style={{marginTop: 16}}
                    dataSource={items}
                    renderItem={(item) => (
                        <List.Item>{item.meaning}</List.Item>
                    )}
                />
            )}
        </Card>
    );
}
