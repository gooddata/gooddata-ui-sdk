// (C) 2021-2025 GoodData Corporation

import * as path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

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
    "@gooddata/sdk-ui-geo",
    "@gooddata/sdk-ui-pivot",
    "@gooddata/sdk-ui-kit",
    "@gooddata/sdk-ui-vis-commons",
];

function makePackageEsmAlias(packageName: string) {
    // In scss file there are links to esm files, this fix icon loading
    // for these icon imports
    // @example
    // background-image: url("@gooddata/sdk-ui-kit/esm/assets/loading.svg");
    return {
        find: `${packageName}/esm`,
        replacement: path.resolve(__dirname, `./../../${packageName.split("/")[1]}/esm`),
    };
}

function makePackageSourceAlias(packageName: string) {
    return {
        find: packageName,
        replacement: path.resolve(__dirname, `./../../${packageName.split("/")[1]}/src`),
    };
}

function makePackageStylesAlias(packageName: string) {
    return {
        find: `${packageName}/styles`,
        replacement: path.resolve(__dirname, `./../../${packageName.split("/")[1]}/styles`),
    };
}

function getDevelopmentAliases() {
    return [
        // This is required to make fonts work
        {
            find: "@gooddata/sdk-ui-kit/src/@ui",
            replacement: path.resolve(__dirname, "../../../libs/sdk-ui-kit/src/@ui"),
        },
        ...packagesWithoutStyles.map(makePackageSourceAlias),
        ...packagesWithStyles.flatMap((pkg) => [
            makePackageEsmAlias(pkg),
            makePackageStylesAlias(pkg),
            makePackageSourceAlias(pkg),
        ]),
    ];
}

function getProductionAliases() {
    return [
        // This is required to make fonts work
        {
            find: "@gooddata/sdk-ui-kit/src/@ui",
            replacement: path.resolve(__dirname, "../../../libs/sdk-ui-kit/src/@ui"),
        },
    ];
}

// https://vitejs.dev/config/
// eslint-disable-next-line no-restricted-exports
export default defineConfig(({ mode }) => {
    // Load env from parent directory where .env file is located
    const env = loadEnv(mode, path.resolve(__dirname, ".."), "");
    // Fallback to process.env if not found in .env file
    const backendUrl = env.HOST || process.env.HOST;
    const workspace = env.TEST_WORKSPACE_ID || process.env.TEST_WORKSPACE_ID;
    const basePath = env.basePath || process.env.basePath || "";
    const authToken = env.TIGER_API_TOKEN;

    if (!backendUrl) {
        process.stderr.write("HOST needs to be provided in .env\n");
        process.exit(1);
    }

    if (!workspace) {
        process.stderr.write("TEST_WORKSPACE_ID needs to be provided in .env\n");
        process.exit(1);
    }

    // eslint-disable-next-line no-console
    console.log("Backend URI:", backendUrl, ", ", "Workspace to use:", workspace);

    return {
        plugins: [react()],
        root: path.resolve(__dirname),
        publicDir: "public",
        base: mode === "production" ? "./" : "/",
        build: {
            outDir: "build",
            emptyOutDir: true,
            sourcemap: mode !== "production",
        },
        define: {
            BACKEND_URL: JSON.stringify(backendUrl),
            WORKSPACE_ID: JSON.stringify(workspace),
            // Tiger token is provided only for development mode to allow local development from .env file
            TIGER_API_TOKEN: mode === "development" ? JSON.stringify(authToken) : JSON.stringify(""),
            BASEPATH: JSON.stringify(basePath),
            BUILTIN_MAPBOX_TOKEN: JSON.stringify(env.EXAMPLE_MAPBOX_ACCESS_TOKEN || ""),
        },
        resolve: {
            alias: mode === "development" ? getDevelopmentAliases() : getProductionAliases(),
        },
        server: {
            port: 9500,
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
                        // This is essential for Tiger backends. To ensure 401 flies when not authenticated and using proxy
                        "X-Requested-With": "XMLHttpRequest",
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
            configure: (app) => {
                // Handle /gooddata-ui-sdk path by rewriting to root
                app.use("/gooddata-ui-sdk", (req, res, next) => {
                    req.url = req.url.replace(/^\/gooddata-ui-sdk/, "") || "/";
                    next();
                });
            },
        },
    };
});
