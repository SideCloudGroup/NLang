import {useEffect, useState} from 'react';
import {message} from 'antd';
import {AUTH_EXPIRED_EVENT, isAdminLoggedIn} from '../api/client';

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

    if (checking) return null;
    if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)}/>;
    return <AdminList/>;
}
