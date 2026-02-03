// (C) 2007-2026 GoodData Corporation

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import packageJson from "./package.json" with { type: "json" };

const backendUrl = packageJson.gooddata.hostname;
const workspaceId = packageJson.gooddata.workspaceId;

console.log("backendUrl: ", backendUrl);

export default defineConfig({
    plugins: [
        react(),
        createHtmlPlugin({
            entry: "/src/index.tsx",
            template: "./src/public/index.html",
        }),
    ],
    define: {
        WORKSPACE_ID: JSON.stringify(workspaceId),
    },
    build: {
        outDir: "esm",
        chunkSizeWarningLimit: 10000,
    },
    server: {
        port: 8080,
        allowedHosts: [".csb.app"],
        fs: {
            strict: false,
        },
        proxy: {
            "/api": {
                changeOrigin: true,
                cookieDomainRewrite: "localhost",
                secure: false,
                target: backendUrl,
                headers: {
                    host: backendUrl,
                    origin: null,
                },
                configure: (proxy) => {
                    proxy.on("proxyReq", (proxyReq) => {
                        // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                        proxyReq.removeHeader("origin");
                        proxyReq.setHeader("accept-encoding", "identity");
                    });
                },
            },
        },
    },
});
