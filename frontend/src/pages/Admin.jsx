import {useEffect, useState} from 'react';
import {isAdminLoggedIn} from '../api/client';
import AdminLogin from './AdminLogin';
import AdminList from './AdminList';

export default function Admin() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        setLoggedIn(isAdminLoggedIn());
        setChecking(false);
    }, []);

    if (checking) return null;
    if (!loggedIn) return <AdminLogin onSuccess={() => setLoggedIn(true)}/>;
    return <AdminList/>;
}
