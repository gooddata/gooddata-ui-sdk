// (C) 2007-2026 GoodData Corporation

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin, EnvironmentPlugin } = require("webpack");
const path = require("path");
const { URL } = require("url");
const deps = require("./package.json").dependencies;
const peerDeps = require("./package.json").peerDependencies;
const Dotenv = require("dotenv-webpack");
const { EsbuildPlugin } = require("esbuild-loader");
require("dotenv").config();

const { MODULE_FEDERATION_NAME } = require("./src/metadata.json");

const PORT = 3001;
const DEFAULT_BACKEND_URL = "https://live-examples-proxy.herokuapp.com";
const GEO_STYLE_ENDPOINT = "/api/v1/location/style";
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

function generateGooddataSharePackagesEntries() {
    // add all the gooddata packages that absolutely need to be shared and singletons because of contexts
    // allow sharing @gooddata/sdk-ui-dashboard here so that multiple plugins can share it among themselves
    // this makes redux related contexts work for example
    return [...Object.entries(deps), ...Object.entries(peerDeps)]
        .filter(([pkgName]) => pkgName.startsWith("@gooddata"))
        .reduce((acc, [pkgName, _version]) => {
            acc[pkgName] = {
                singleton: true,
                requiredVersion: false,
            };
            return acc;
        }, {});
}

function applyProxyRequestHeaders(proxyReq) {
    proxyReq.removeHeader("origin");
    proxyReq.setHeader("accept-encoding", "identity");
}

function rewriteLocationStyleResponse(buffer, origin) {
    const payload = JSON.parse(buffer.toString("utf8"));

    if (typeof payload.glyphs === "string") {
        payload.glyphs = replaceUrlOrigin(payload.glyphs, origin);
    }

    if (payload.sources && typeof payload.sources === "object") {
        Object.values(payload.sources).forEach((source) => {
            if (isVectorSourceWithTiles(source) && Array.isArray(source.tiles)) {
                source.tiles = source.tiles.map((tileUrl) => replaceUrlOrigin(tileUrl, origin));
            }
        });
    }

    return JSON.stringify(payload);
}

function replaceUrlOrigin(value, origin) {
    if (!ABSOLUTE_URL_PATTERN.test(value)) {
        return value;
    }

    const originMatch = value.match(/^[a-z]+:\/\/[^/]+/i);
    if (!originMatch) {
        return `${origin}${value}`;
    }

    const suffix = value.slice(originMatch[0].length);
    return `${origin}${suffix}`;
}

function isVectorSourceWithTiles(source) {
    return Boolean(source && typeof source === "object" && source.type === "vector");
}

function createGeoStyleProxy({ backend, origin, cookieDomain, hostHeader }) {
    return {
        context: GEO_STYLE_ENDPOINT,
        changeOrigin: true,
        cookieDomainRewrite: cookieDomain,
        secure: false,
        target: backend,
        headers: {
            host: hostHeader,
            "X-Requested-With": "XMLHttpRequest",
        },
        selfHandleResponse: true,
        onProxyReq: applyProxyRequestHeaders,
        onProxyRes(proxyRes, req, res) {
            const chunks = [];
            proxyRes.on("data", (chunk) => chunks.push(chunk));
            proxyRes.on("end", () => {
                const buffer = Buffer.concat(chunks);

                if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    res.end(buffer);
                    return;
                }

                try {
                    const rewrittenBody = rewriteLocationStyleResponse(buffer, origin);
                    res.setHeader("content-type", "application/json");
                    res.end(rewrittenBody);
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error("[devServer] Failed to rewrite geo style response", err);
                    res.writeHead(500, { "content-type": "application/json" });
                    res.end(JSON.stringify({ error: "Failed to rewrite geo style response." }));
                }
            });
        },
    };
}

module.exports = (_env, argv) => {
    const isProduction = argv.mode === "production";

    const effectiveBackendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;
    const protocol = new URL(effectiveBackendUrl).protocol;
    const devServerOrigin = `${protocol === "https:" ? "https" : "http"}://127.0.0.1:${PORT}`;
    const backendHostHeader = effectiveBackendUrl.replace(/^https?:\/\//, "");

    const proxy = [
        createGeoStyleProxy({
            backend: effectiveBackendUrl,
            origin: devServerOrigin,
            cookieDomain: "127.0.0.1",
            hostHeader: backendHostHeader,
        }),
        {
            context: ["/api"],
            changeOrigin: true,
            cookieDomainRewrite: "127.0.0.1",
            secure: false,
            target: effectiveBackendUrl,
            headers: {
                host: backendHostHeader,
                // This is essential for Tiger backends. To ensure 401 flies when not authenticated and using proxy
                "X-Requested-With": "XMLHttpRequest",
            },
            onProxyReq(proxyReq) {
                // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                applyProxyRequestHeaders(proxyReq);
            },
        },
    ];

    const commonConfig = {
        mode: isProduction ? "production" : "development",
        target: "web",
        devtool: isProduction ? false : "eval-cheap-module-source-map",
        experiments: {
            outputModule: isProduction,
        },
        output: {
            path: path.resolve("./esm"),
            filename: "[name].mjs",
            ...(isProduction && {
                library: {
                    type: "module",
                },
            }),
        },
        resolve: {
            // Alias for ESM imports with .js suffix because
            // `import { abc } from "../abc.js"` may be in fact importing from `abc.tsx` file
            extensionAlias: {
                ".js": [".ts", ".tsx", ".js", ".jsx"],
            },

            // Prefer ESM versions of packages to enable tree shaking
            mainFields: ["module", "browser", "main"],

            fallback: {
                // semver package depends on node `util`,
                // but node API is no longer supported with webpack >= 5
                util: false,
            },
        },
        module: {
            rules: [
                // TS source files in case TS is used
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                loader: "tsx",
                                jsx: "automatic",
                            },
                        },
                    ],
                },
                // JS source files in case JS is used
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                loader: "tsx",
                                jsx: "automatic",
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(eot|woff|ttf|svg|jpg|jpeg|gif)/,
                    type: "asset/resource",
                },
                !isProduction && {
                    test: /\.js$/,
                    enforce: "pre",
                    include: path.resolve(__dirname, "src"),
                    use: ["source-map-loader"],
                },
            ].filter(Boolean),
        },
        plugins: [
            new CaseSensitivePathsPlugin(),
            // provide bogus process.env keys that lru-cache, pseudomap and util packages use unsafely for no reason...
            new EnvironmentPlugin({
                npm_package_name: "",
                npm_lifecycle_script: "",
                _nodeLRUCacheForceNoSymbol: "",
                TEST_PSEUDOMAP: "",
                NODE_DEBUG: "",
            }),
        ],
        optimization: {
            minimizer: [new EsbuildPlugin()],
        },
    };

    return [
        {
            ...commonConfig,
            entry: "./src/index.js",
            experiments: { ...commonConfig.experiments, topLevelAwait: true },
            name: "harness",
            ignoreWarnings: [/Failed to parse source map/], // some of the dependencies have invalid source maps, we do not care that much
            devServer: {
                static: {
                    directory: path.join(__dirname, "esm"),
                },
                port: PORT,
                host: "127.0.0.1",
                proxy,
                server: protocol === "https:" ? "https" : "http",
                // webpack-dev-server v5 compatible options
                compress: true,
                historyApiFallback: true,
                hot: true,
                liveReload: true,
            },
            plugins: [
                ...commonConfig.plugins,
                new DefinePlugin({
                    PORT: JSON.stringify(PORT),
                }),
                new Dotenv({
                    silent: true,
                    systemvars: true,
                }),
                new Dotenv({
                    path: ".env.secrets",
                    silent: true,
                    systemvars: true,
                }),
                new HtmlWebpackPlugin({
                    template: "./src/harness/public/index.html",
                    scriptLoading: "module",
                }),
            ],
        },
        {
            ...commonConfig,
            entry: `./src/${MODULE_FEDERATION_NAME}/index.js`,
            name: "dashboardPlugin",
            output: { ...commonConfig.output, path: path.join(__dirname, "esm", "dashboardPlugin") },
            plugins: [
                ...commonConfig.plugins,
                new ModuleFederationPlugin({
                    library: { type: "window", name: MODULE_FEDERATION_NAME },
                    name: MODULE_FEDERATION_NAME, // this is used to put the plugin on the target window scope by default
                    exposes: {
                        /**
                         * this is the main entry point providing info about the engine and plugin
                         * this allows us to only load the plugin and/or engine when needed
                         */
                        [`./${MODULE_FEDERATION_NAME}_ENTRY`]: `./src/${MODULE_FEDERATION_NAME}_entry/index.js`,
                        /**
                         * this is the entry to the plugin itself
                         */
                        [`./${MODULE_FEDERATION_NAME}_PLUGIN`]: `./src/${MODULE_FEDERATION_NAME}/index.js`,
                        /**
                         * this is the entry to the engine
                         */
                        [`./${MODULE_FEDERATION_NAME}_ENGINE`]: `./src/${MODULE_FEDERATION_NAME}_engine/index.js`,
                    },

                    // adds react as shared module
                    // version is inferred from package.json
                    // there is no version check for the required version
                    // so it will always use the higher version found
                    shared: {
                        react: {
                            import: "react", // the "react" package will be used a provided and fallback module
                            shareKey: "react", // under this name the shared module will be placed in the share scope
                            singleton: true, // only a single version of the shared module is allowed
                            requiredVersion: false,
                        },
                        "react-dom": {
                            singleton: true,
                            requiredVersion: false,
                        },
                        "react/jsx-runtime": {
                            singleton: true,
                            import: false,
                            strictVersion: false,
                            requiredVersion: false,
                        },
                        // add all the packages that absolutely need to be shared and singletons because of contexts
                        ...generateGooddataSharePackagesEntries(),
                    },
                }),
            ],
        },
    ];
};
