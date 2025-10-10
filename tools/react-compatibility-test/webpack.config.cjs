// (C) 2007-2021 GoodData Corporation
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

const { MODULE_FEDERATION_NAME, PLUGIN_BUILD_DIRECTORY, PLUGIN_PARAMETERS_JSON_PATH, BACKEND_URL, REACT_VERSION } = process.env;

const PLUGIN_PARAMETERS = PLUGIN_PARAMETERS_JSON_PATH ? require(PLUGIN_PARAMETERS_JSON_PATH) : undefined;

const PORT = 8000;
const DEFAULT_BACKEND_URL = "https://live-examples-proxy.herokuapp.com";

function generateGooddataSharePackagesEntries() {
    // add all the gooddata packages that absolutely need to be shared and singletons because of contexts
    // allow sharing @gooddata/sdk-ui-dashboard here so that multiple plugins can share it among themselves
    // this makes redux related contexts work for example
    return [...Object.entries(deps), ...Object.entries(peerDeps)]
        .filter(([pkgName]) => pkgName.startsWith("@gooddata"))
        .reduce((acc, [pkgName, version]) => {
            acc[pkgName] = {
                singleton: true,
                requiredVersion: false,
            };
            return acc;
        }, {});
}

module.exports = (_env, argv) => {
    const isProduction = argv.mode === "production";
    const reactVersion = REACT_VERSION || "18";

    const effectiveBackendUrl = BACKEND_URL || DEFAULT_BACKEND_URL;
    const protocol = new URL(effectiveBackendUrl).protocol;

    const proxy = [
        {
            context: ["/api"],
            changeOrigin: true,
            cookieDomainRewrite: "127.0.0.1",
            secure: false,
            target: effectiveBackendUrl,
            headers: {
                host: effectiveBackendUrl.replace(/^https?:\/\//, ""),
                // This is essential for Tiger backends. To ensure 401 flies when not authenticated and using proxy
                "X-Requested-With": "XMLHttpRequest",
            },
            onProxyReq(proxyReq) {
                // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                proxyReq.removeHeader("origin");
                proxyReq.setHeader("accept-encoding", "identity");
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

            // React version resolution based on environment variable
            alias: reactVersion === "19" ? {
                "react": "react-19",
                "react-dom": "react-dom-19",
                "@types/react": "@types/react-19",
                "@types/react-dom": "@types/react-dom-19",
            } : {},

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
                static: [
                    {
                        directory: path.join(__dirname, "esm"),
                        publicPath: '/test',
                    },
                    {
                        directory: path.join(PLUGIN_BUILD_DIRECTORY),
                        publicPath: '/plugin',
                    },
                ],
                headers: {
                            "Access-Control-Allow-Origin": "*",
                },
                port: PORT,
                host: "localhost",
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
                new ModuleFederationPlugin({
                    name: "harness",
                    remotes: {
                        // Configure the plugin as a remote - URL will be resolved at runtime
                        [MODULE_FEDERATION_NAME]: `${MODULE_FEDERATION_NAME}@https://localhost:8000/plugin/${MODULE_FEDERATION_NAME}.mjs`,
                    },
                    shared: {
                        react: {
                            singleton: true,
                            shareKey: "react",
                            requiredVersion: false,
                        },
                        "react-dom": {
                            singleton: true,
                            requiredVersion: false,
                        },
                        'react/jsx-runtime': {
                            singleton: true,
                            requiredVersion: false,
                        },
                        // add all the packages that absolutely need to be shared and singletons because of contexts
                        ...generateGooddataSharePackagesEntries(),
                    },
                }),
                new DefinePlugin({
                    PORT: JSON.stringify(PORT),
                    PLUGIN_NAME: JSON.stringify(MODULE_FEDERATION_NAME),
                    REACT_VERSION: JSON.stringify(reactVersion),
                    PLUGIN_PARAMETERS: JSON.stringify(PLUGIN_PARAMETERS),
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
    ];
};
