import {useEffect, useState} from 'react';
import {message, Spin} from 'antd';
import {AUTH_EXPIRED_EVENT, isAdminLoggedIn} from '../api/client';
import AdminLogin from './AdminLogin';
import AdminList from './AdminList';

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        setLoggedIn(isAdminLoggedIn());
        setChecking(false);
    }, []);

    useEffect(() => {
        const onAuthExpired = () => {
            setLoggedIn(false);
            message.warning('登录已过期，请重新登录');
        };
        window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    }, []);

    if (checking) return <Spin size="large" style={{display: 'block', margin: '48px auto'}}/>;
    if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)}/>;
    return <AdminList/>;
}
