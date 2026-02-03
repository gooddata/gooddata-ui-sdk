// (C) 2007-2025 GoodData Corporation
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

import packageJson from "./package.json";

const backendUrl = packageJson.gooddata.hostname;
const workspaceId = packageJson.gooddata.workspaceId;

console.log("backendUrl: ", backendUrl);

export default defineConfig({
    entry: "src/index.tsx",
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
