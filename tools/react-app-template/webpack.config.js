// (C) 2007-2022 GoodData Corporation
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { EnvironmentPlugin, ProvidePlugin } = require("webpack");
const path = require("path");
const { URL } = require("url");
require("dotenv").config();

const BACKEND_URL = "https://public-examples.gooddata.com";

module.exports = (_env, argv) => {
    const isProduction = argv.mode === "production";
    const protocol = new URL(BACKEND_URL).protocol;
    const proxy = [
        {
            context: ["/api", "/gdc"],
            changeOrigin: true,
            cookieDomainRewrite: "localhost",
            secure: false,
            target: BACKEND_URL,
            headers: {
                host: BACKEND_URL,
                origin: null,
            },
            onProxyReq(proxyReq) {
                // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                proxyReq.removeHeader("origin");
                proxyReq.setHeader("accept-encoding", "identity");
            },
        },
    ];

    return [
        {
            entry: "./src/index",
            mode: isProduction ? "production" : "development",
            target: "web",
            devtool: isProduction ? false : "eval-cheap-module-source-map",
            output: {
                publicPath: "auto",
            },
            resolve: {
                // Allow to omit extensions when requiring these files
                extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],

                alias: {
                    // fixes tilde imports in CSS from sdk-ui-* packages
                    "@gooddata/sdk-ui-filters": path.resolve("./node_modules/@gooddata/sdk-ui-filters"),
                    "@gooddata/sdk-ui-charts": path.resolve("./node_modules/@gooddata/sdk-ui-charts"),
                    "@gooddata/sdk-ui-pivot": path.resolve("./node_modules/@gooddata/sdk-ui-pivot"),
                    "@gooddata/sdk-ui-kit": path.resolve("./node_modules/@gooddata/sdk-ui-kit"),
                    "@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),
                    "@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
                },

                // Prefer ESM versions of packages to enable tree shaking
                mainFields: ["module", "browser", "main"],
            },
            module: {
                rules: [
                    // TS source files in case TS is used
                    {
                        test: /\.tsx?$/,
                        use: [
                            {
                                loader: "babel-loader",
                            },
                            {
                                loader: "ts-loader",
                                options: {
                                    transpileOnly: true,
                                },
                            },
                        ],
                    },
                    // JS source files in case JS is used
                    {
                        test: /\.jsx?$/,
                        use: [
                            {
                                loader: "babel-loader",
                                options: {
                                    compact: isProduction,
                                    presets: ["@babel/preset-react"],
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
                // Provide bogus process.env keys that lru-cache, pseudomap and util packages use unsafely for no reason...
                new EnvironmentPlugin({
                    npm_package_name: "",
                    npm_lifecycle_script: "",
                    _nodeLRUCacheForceNoSymbol: "",
                    TEST_PSEUDOMAP: "",
                    NODE_DEBUG: "",
                }),
                new HtmlWebpackPlugin({
                    template: "./src/public/index.html",
                    favicon: "./src/public/favicon.ico",
                }),
            ],
            // Some dependencies have invalid source maps, we do not care that much
            ignoreWarnings: [/Failed to parse source map/],
            devServer: {
                static: {
                    directory: path.join(__dirname, "dist"),
                },
                host: "127.0.0.1",
                proxy,
                server: protocol === "https:" ? "https" : "http",
                open: true,
            },
        },
    ];
};
