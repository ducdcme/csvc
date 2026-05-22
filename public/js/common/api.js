/**
 * API HELPER - CLEAN & SAFE VERSION
 * - support JSON + FormData
 * - safe loading
 * - no crash
 * - no hard redirect (UI decide)
 * - retry network only
 */

const API_CONFIG = {
    retry: 1,
    retryDelay: 500
}

// =========================
// LOADING SAFE
// =========================
function showLoading() {
    try {
        document?.body?.classList.add('loading')
    } catch { }
}

function hideLoading() {
    try {
        document?.body?.classList.remove('loading')
    } catch { }
}

// =========================
// CORE API
// =========================
async function api(url, options = {}, retryCount = 0) {

    const isFormData = options.body instanceof FormData

    const config = {
        credentials: 'include',
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(options.headers || {})
        },
        ...options
    }

    try {
        showLoading()

        const res = await fetch(url, config)

        const json = await res.json().catch(() => ({}))

        if (res.status === 401) {
            window.location.href = '/login'
            return
        }

        if (!res.ok || json.success === false) {
            throw new Error(json.message || 'API Error')
        }

        return json

    } catch (err) {

        console.error('API ERROR:', err)

        throw err
    } finally {
        hideLoading()
    }
}