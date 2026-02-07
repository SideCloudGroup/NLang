import {BrowserRouter, Link, Route, Routes, useLocation} from 'react-router-dom';
import {Layout, Menu} from 'antd';
import QueryPage from './pages/QueryPage';
import Admin from './pages/Admin';

const {Header, Content} = Layout;

function AppMenu() {
    const location = useLocation();
    return (
        <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname === '/admin' ? 'admin' : 'query']}
            style={{flex: 1}}
            items={[
                {key: 'query', label: <Link to="/">查询</Link>},
                {key: 'admin', label: <Link to="/admin">管理后台</Link>},
            ]}
        />
    );
}

function App() {
    return (
        <BrowserRouter>
            <Layout style={{minHeight: '100vh'}}>
                <Header style={{display: 'flex', alignItems: 'center'}}>
                    <AppMenu/>
                </Header>
                <Content>
                    <Routes>
                        <Route path="/" element={<QueryPage/>}/>
                        <Route path="/admin" element={<Admin/>}/>
                    </Routes>
                </Content>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
