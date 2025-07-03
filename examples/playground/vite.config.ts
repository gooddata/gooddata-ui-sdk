// (C) 2019-2025 GoodData Corporation
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import * as fs from "fs";

const packagesWithoutStyles = [
    "@gooddata/sdk-model",
    "@gooddata/sdk-backend-base",
    "@gooddata/sdk-backend-spi",
    "@gooddata/sdk-backend-tiger",
    "@gooddata/sdk-ui-loaders",
    "@gooddata/sdk-ui-theme-provider",
    "@gooddata/sdk-embedding",
];

const packagesWithStyles = [
    "@gooddata/sdk-ui-dashboard",
    "@gooddata/sdk-ui-ext",
    "@gooddata/sdk-ui",
    "@gooddata/sdk-ui-charts",
    "@gooddata/sdk-ui-filters",
    "@gooddata/sdk-ui-gen-ai",
    "@gooddata/sdk-ui-geo",
    "@gooddata/sdk-ui-pivot",
    "@gooddata/sdk-ui-semantic-search",
    "@gooddata/sdk-ui-kit",
    "@gooddata/sdk-ui-vis-commons",
];

function makePackageSourceAlias(packageName: string) {
    return {
        find: packageName,
        replacement: path.resolve(__dirname, `./../../libs/${packageName.split("/")[1]}/src`),
    };
}

function makePackageStylesAlias(packageName: string) {
    return {
        find: `${packageName}/styles`,
        replacement: path.resolve(__dirname, `./../../libs/${packageName.split("/")[1]}/styles`),
    };
}

// Define the directory to store certificates
const certDir = path.join(process.env.HOME || process.env.USERPROFILE, ".gooddata", "certs");
let serverOptions = {};

try {
    serverOptions = {
        https: {
            ca: fs.readFileSync(path.join(certDir, "rootCA.pem")),
            key: fs.readFileSync(path.join(certDir, "localhost-key.pem")),
            cert: fs.readFileSync(path.join(certDir, "localhost-cert.pem")),
        },
    };
} catch (e) {
    console.info(`No certificates found in ${certDir}, skipping HTTPS configuration`);
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const backendUrl = env.VITE_BACKEND_URL ?? "https://staging.dev-latest.stg11.panther.intgdc.com";

    return {
        plugins: [react()],
        optimizeDeps: {
            exclude: [
                "@codemirror/state",
                "@codemirror/view",
                ...packagesWithoutStyles,
                ...packagesWithStyles,
            ],
        },
        resolve: {
            alias: [
                // This is required to make fonts work
                {
                    find: "@gooddata/sdk-ui-kit/src/@ui",
                    replacement: path.resolve(__dirname, "./../../libs/sdk-ui-kit/src/@ui"),
                },
                ...packagesWithoutStyles.map(makePackageSourceAlias),
                ...packagesWithStyles.flatMap((pkg) => [
                    makePackageStylesAlias(pkg),
                    makePackageSourceAlias(pkg),
                ]),
            ],
            dedupe: ["@codemirror/state", "@codemirror/view"],
        },
        server: {
            ...serverOptions,
            port: 8999,
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
                        // origin: null,
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
    };
});
