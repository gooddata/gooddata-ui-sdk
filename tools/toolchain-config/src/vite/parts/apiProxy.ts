// (C) 2026 GoodData Corporation

import { type ProxyOptions } from "vite";

import { applyProxyRequestHeaders } from "../plugins/locationStyleProxy.js";

/**
 * Dev server proxy of `/api` to a GoodData backend, with the cookie and header rewrites the Tiger
 * backend needs.
 */
export function backendApiProxy(backend: string): ProxyOptions {
    return {
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
        target: backend,
        headers: {
            host: backend,
            "X-Requested-With": "XMLHttpRequest",
        },
        configure: (proxy) => {
            proxy.on("proxyReq", applyProxyRequestHeaders);
        },
    };
}
