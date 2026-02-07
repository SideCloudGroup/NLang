// 默认同源；需覆盖时通过环境变量 NLANG_API_URL 在部署时注入到 index.html（占位符 __NLANG_API_URL__）
function getApiBase() {
    if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, '__NLANG_API_URL__')) {
        const v = window.__NLANG_API_URL__;
        if (v !== undefined && v !== null && v !== '' && v !== '__NLANG_API_URL_VALUE__') return String(v);
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin;
    }
    return '';
}

function headers(includeAuth = false) {
    const h = {'Content-Type': 'application/json'};
    if (includeAuth) {
        const token = localStorage.getItem('nlang_admin_token');
        if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
}

export async function queryAbbrev(abbrev) {
    const q = encodeURIComponent(`(abbrev='${String(abbrev).replace(/'/g, "\\'")}')`);
    const res = await fetch(`${getApiBase()}/api/collections/nlang_entries/records?filter=${q}`, {
        headers: headers(false),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.items || [];
}

export async function adminAuth(email, password) {
    const res = await fetch(`${getApiBase()}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: headers(false),
        body: JSON.stringify({identity: email, password}),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
    }
    const data = await res.json();
    localStorage.setItem('nlang_admin_token', data.token);
    return data;
}

export function adminLogout() {
    localStorage.removeItem('nlang_admin_token');
}

export function isAdminLoggedIn() {
    return !!localStorage.getItem('nlang_admin_token');
}

export async function listEntries() {
    const res = await fetch(`${getApiBase()}/api/collections/nlang_entries/records?perPage=500`, {
        headers: headers(true),
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return data.items || [];
}

export async function createEntry(abbrev, meaning) {
    const res = await fetch(`${getApiBase()}/api/collections/nlang_entries/records`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({abbrev: abbrev.trim().toLowerCase(), meaning: meaning.trim()}),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
    }
    return res.json();
}

export async function updateEntry(id, abbrev, meaning) {
    const res = await fetch(`${getApiBase()}/api/collections/nlang_entries/records/${id}`, {
        method: 'PATCH',
        headers: headers(true),
        body: JSON.stringify({abbrev: abbrev.trim().toLowerCase(), meaning: meaning.trim()}),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
    }
    return res.json();
}

export async function deleteEntry(id) {
    const res = await fetch(`${getApiBase()}/api/collections/nlang_entries/records/${id}`, {
        method: 'DELETE',
        headers: headers(true),
    });
    if (!res.ok) throw new Error(res.statusText);
}
