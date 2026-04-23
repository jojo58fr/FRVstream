import { ApiURL as DefaultApiUrl } from '../config/config.json';

const DEFAULT_AUTH_ORIGIN = 'https://frvtubers.example.com';
const DEFAULT_FRVSTREAM_BASE = 'https://stream.frvtubers.com';

const sanitizeOrigin = (origin) => {
    if (typeof origin !== 'string' || origin.length === 0) {
        return DEFAULT_AUTH_ORIGIN;
    }
    return origin.replace(/\/+$/, '');
};

const ensureTrailingSlash = (url) => {
    if (typeof url !== 'string' || url.length === 0) {
        return '/';
    }
    return url.endsWith('/') ? url : `${url}/`;
};

const sanitizeCallbackBase = (url) => {
    if (typeof url !== 'string' || url.length === 0) {
        return DEFAULT_FRVSTREAM_BASE;
    }
    return url.replace(/\/+$/, '');
};

const isLocalhost = (origin) => {
    if (typeof origin !== 'string') {
        return false;
    }
    return /localhost|127\.0\.0\.1/i.test(origin);
};

const getCookieValue = (name) => {
    if (typeof document === 'undefined' || typeof name !== 'string') {
        return null;
    }
    const cookies = document.cookie?.split(';') ?? [];
    const entry = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
    if (!entry) {
        return null;
    }
    return entry.split('=').slice(1).join('=') || null;
};

const markAsApiSynced = (session) => {
    if (session && typeof session === 'object') {
        Object.defineProperty(session, '__fromApiSync', {
            value: true,
            enumerable: false
        });
    }
    return session;
};

class UniversalLoginSystem {

    constructor() {
        if (UniversalLoginSystem._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.");
        }
        UniversalLoginSystem._instance = this;

        const envOrigin = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_FRVTUBERS_AUTH_ORIGIN : null;
        this.authBaseUrl = sanitizeOrigin(envOrigin ?? DEFAULT_AUTH_ORIGIN);
        const envApiUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : null;
        this.apiBaseUrl = sanitizeOrigin(envApiUrl ?? DefaultApiUrl ?? '');
        const envCallbackBase = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_FRVSTREAM_CALLBACK_URL : null;
        const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : null;

        // By default, always send users back to FRVStream, unless running locally
        this.callbackBaseUrl = sanitizeCallbackBase(
            envCallbackBase ?? (isLocalhost(runtimeOrigin) ? runtimeOrigin : DEFAULT_FRVSTREAM_BASE)
        );
        this._session = null;
    }

    getAuthBaseUrl() {
        return this.authBaseUrl;
    }

    getDefaultCallbackUrl() {
        return ensureTrailingSlash(this.callbackBaseUrl);
    }

    getSignInUrl(callbackUrl) {
        const target = callbackUrl ?? this.getDefaultCallbackUrl();
        if (target) {
            return `${this.authBaseUrl}/api/auth/signin/discord?callbackUrl=${encodeURIComponent(target)}`;
        }
        return `${this.authBaseUrl}/api/auth/signin/discord`;
    }

    startLogin(callbackUrl) {
        const destination = this.getSignInUrl(callbackUrl);
        if (typeof window !== 'undefined') {
            window.location.href = destination;
        }
        return destination;
    }

    isLogged() {
        return this._session;
    }

    async fetchSessionFromApi() {
        if (!this.apiBaseUrl) {
            return null;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/sync`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.status === 401) {
                return null;
            }

            if (!response.ok) {
                return null;
            }

            const payload = await response.json().catch(() => null);
            if (!payload || Object.keys(payload).length === 0) {
                return null;
            }

            return markAsApiSynced(payload);
        } catch (error) {
            console.error('UniversalLoginSystem.fetchSessionFromApi failed', error);
            return null;
        }
    }

    async fetchSession() {
        // Prefer the FRVStream API proxy to avoid cross-origin issues with the auth domain
        const apiSession = await this.fetchSessionFromApi();
        if (apiSession) {
            this._session = apiSession;
            return apiSession;
        }

        const isSameOrigin = typeof window !== 'undefined' && window.location.origin === this.authBaseUrl;
        if (!isSameOrigin) {
            this._session = null;
            return null;
        }

        try {
            const response = await fetch(`${this.authBaseUrl}/api/auth/session`, {
                credentials: 'include'
            });

            if (!response.ok) {
                this._session = null;
                return null;
            }

            const session = await response.json();

            if (!session || Object.keys(session).length === 0) {
                this._session = null;
                return null;
            }

            this._session = session;
            return session;
        } catch (error) {
            console.error('UniversalLoginSystem.fetchSession failed', error);
            this._session = null;
            return null;
        }
    }

    async request_status() {
        return this.fetchSession();
    }

    async request_logout(callbackUrl) {
        try {
            const parseCsrfToken = () => {
                const raw = getCookieValue('__Host-next-auth.csrf-token') ?? getCookieValue('next-auth.csrf-token');
                if (!raw) {
                    return null;
                }
                return raw.split('|')?.[0] ?? null;
            };

            const rawCallbackUrl = callbackUrl
                ?? (typeof window !== 'undefined' ? window.location.origin ?? this.authBaseUrl : this.authBaseUrl);
            const targetCallbackUrl = ensureTrailingSlash(rawCallbackUrl);
            const isSameOrigin = typeof window !== 'undefined' && window.location.origin === this.authBaseUrl;
            const csrfTokenFromCookie = parseCsrfToken();
            const signOutUrl = `${this.authBaseUrl}/api/auth/signout`;

            // Cross-origin safe: use a POST form with the CSRF token when available
            if (!isSameOrigin && csrfTokenFromCookie && typeof document !== 'undefined') {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = signOutUrl;
                form.style.display = 'none';
                form.target = '_self';
                const appendField = (name, value) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                };
                appendField('csrfToken', csrfTokenFromCookie);
                appendField('callbackUrl', targetCallbackUrl);
                appendField('redirect', 'true');
                document.body.appendChild(form);
                form.submit();
                form.remove();
                this._session = null;
                return 1;
            }

            if (!isSameOrigin && typeof window !== 'undefined') {
                const fallbackUrl = `${signOutUrl}?callbackUrl=${encodeURIComponent(targetCallbackUrl)}`;
                window.location.href = fallbackUrl;
                this._session = null;
                return 1;
            }

            const csrfResponse = await fetch(`${this.authBaseUrl}/api/auth/csrf`, {
                credentials: 'include'
            });

            if (!csrfResponse.ok) {
                return 0;
            }

            const csrfPayload = await csrfResponse.json();
            const csrfToken = csrfPayload?.csrfToken ?? csrfTokenFromCookie;

            if (!csrfToken) {
                return 0;
            }

            const response = await fetch(signOutUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    csrfToken,
                    callbackUrl: targetCallbackUrl,
                    redirect: false
                })
            });

            if (!response.ok) {
                return 0;
            }

            this._session = null;
            return 1;
        } catch (error) {
            console.error('UniversalLoginSystem.request_logout failed', error);
            return 0;
        }
    }

}

const instance = new UniversalLoginSystem();

export default instance;
