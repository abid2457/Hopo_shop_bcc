/**
 * HOPO SHOP INDIA — Centralized HTTP API Client
 * Connects frontend directly to the PHP 8.5 + MySQL REST backend.
 */
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : "";

export function buildApiUrl(endpoint) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  const base = (RAW_API_BASE || "").trim().replace(/\/+$/, "");
  let ep = endpoint.trim().replace(/^\/+/, "");

  if (base.endsWith("/api") && ep.startsWith("api/")) {
    ep = ep.replace(/^api\//, "");
  }
  if (!base && !ep.startsWith("api/")) {
    ep = `api/${ep}`;
  }

  return base ? `${base}/${ep}` : `/${ep}`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hopo_auth_token");
}
export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("hopo_auth_token", token);
  } else {
    localStorage.removeItem("hopo_auth_token");
  }
}
export async function fetchApi(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const token = getAuthToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401 && token) {
      // If server rejected token (e.g. expired session), notify app
      try {
        const errJson = await res.clone().json();
        if (typeof window !== "undefined" && errJson?.message) {
          window.dispatchEvent(new CustomEvent("hopo-auth-expired", { detail: errJson.message }));
        }
      } catch {
        // ignore
      }
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const statusText = res.statusText || (res.ok ? "OK" : "Error");
      throw new Error(
        `Backend returned non-JSON response (${res.status} ${statusText}). Endpoint: ${url}`,
      );
    }
    const json = await res.json();
    if (!res.ok && !json.message) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return json;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[API Call Failed: ${endpoint}]`, err.message);
    }
    throw err;
  }
}
export const apiService = {
  get: (endpoint) => fetchApi(endpoint, { method: "GET" }),
  post: (endpoint, body) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return fetchApi(endpoint, {
      method: "POST",
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put: (endpoint, body) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return fetchApi(endpoint, {
      method: "PUT",
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete: (endpoint) => fetchApi(endpoint, { method: "DELETE" }),
  upload: (endpoint, formData) => fetchApi(endpoint, { method: "POST", body: formData }),
};
