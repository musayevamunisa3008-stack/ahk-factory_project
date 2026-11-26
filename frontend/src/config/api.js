// Centralized API and Asset configuration
// Supports local development (with Vite proxy) and production deployment (Render/Railway/GitHub Pages)

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const getApiUrl = (endpoint = '') => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export const resolveAssetUrl = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  // If path already starts with base, return as-is (idempotent)
  if (base !== '/' && (path.startsWith(base) || path.startsWith(base.replace(/\/$/, '')))) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, '');
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const baseWithoutLeadingSlash = cleanBase.replace(/^\/+/, '');
  if (baseWithoutLeadingSlash && cleanPath.startsWith(baseWithoutLeadingSlash)) {
    return `/${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
};

export const safeParseResponse = async (res) => {
  try {
    const text = await res.text();
    if (!text || !text.trim()) {
      if (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504) {
        return {
          error: `Бэкенд-сервер на http://localhost:5000 не запущен (HTTP ${res.status}). Запустите бэкенд в отдельном терминале: cd backend && npm start`
        };
      }
      return { error: res.ok ? null : `Сервер вернул пустой ответ (HTTP ${res.status})` };
    }
    return JSON.parse(text);
  } catch (err) {
    return { error: `Ошибка ответа сервера (HTTP ${res.status}). Убедитесь, что бэкенд запущен.` };
  }
};
