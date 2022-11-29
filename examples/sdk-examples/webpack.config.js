// (C) 2007-2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const backendShortcuts = {
    public: "https://live-examples-proxy.herokuapp.com",
};

module.exports = async (env, argv) => {
    const backendParam = env?.backend || "public";

    const basePath = env?.basePath || ""; // eslint-disable-line no-mixed-operators
    const backendUrl = backendShortcuts[backendParam] || backendParam;
    console.log("Backend URI: ", backendUrl); // eslint-disable-line no-console

    const isProduction = argv.mode === "production";

    // see also production proxy at /examples/server/src/endpoints/proxy.js
    const proxy = {
        "/gdc": {
            changeOrigin: true,
            cookieDomainRewrite: "localhost",
            secure: false,
            target: backendUrl,
            headers: {
                host: backendUrl,
                origin: null,
            },
            onProxyReq(proxyReq) {
                proxyReq.setHeader("accept-encoding", "identity");
            },
        },
        "/api": {
            target: "http://localhost:3009",
            secure: false,
            onProxyReq: (req) => {
                console.log("proxy", "/gdc", req.path); // eslint-disable-line no-console
                if (req.method === "DELETE" && !req.getHeader("content-length")) {
                    // Only set content-length to zero if not already specified
                    req.setHeader("content-length", "0");
                }
                // eslint-disable-next-line no-console
                console.log(`Proxy ${req.path} to http://localhost:3009 (use: yarn examples-server)`);
            },
        },
    };

    const plugins = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "GoodData.UI Examples Gallery",
            meta: [
                {
                    property: "og:image",
                    content: "https://www.gooddata.com/learn-assets/img/og-examples.png",
                },
                {
                    name: "twitter:image",
                    content: "https://www.gooddata.com/learn-assets/img/og-examples.png",
                },
            ],
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules|dist/,
            failOnError: true,
        }),
        new webpack.DefinePlugin({
            BACKEND_URL: JSON.stringify(backendUrl),
            BASEPATH: JSON.stringify(basePath),
            BUILTIN_MAPBOX_TOKEN: JSON.stringify(process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN || ""),
            BUILD_TYPE: JSON.stringify(backendParam),
        }),
        new Dotenv({
            silent: true,
            systemvars: true,
        }),
        new ForkTsCheckerWebpackPlugin({
            issue: {
                include: [{ file: "src/**/*.{ts,tsx}" }],
            },
        }),
    ];

    if (isProduction) {
        plugins.push(new CompressionPlugin());
    }

    // flip the `disable` flag to false if you want to diagnose webpack perf
    const smp = new SpeedMeasurePlugin({ disable: true });

    return smp.wrap({
        entry: ["./src/index.tsx"],
        target: ["web", "es5"], // support IE11
        mode: isProduction ? "production" : "development",
        plugins,
        output: {
            filename: "[name].[contenthash].js",
            path: path.join(__dirname, "dist"),
            publicPath: `${basePath}/`,
        },
        devtool: isProduction ? false : "cheap-module-source-map",
        node: {
            __filename: true,
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            alias: {
                react: path.resolve("./node_modules/react"),
                // fixes tilde imports in CSS from sdk-ui-ext
                "@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),
                "@gooddata/sdk-ui-kit": path.resolve("./node_modules/@gooddata/sdk-ui-kit"),
                "@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
            },
            // Prefer ESM versions of packages to enable tree shaking and easier dev experience
            mainFields: ["module", "browser", "main"],
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/,
                    use: ["style-loader", "css-loader", "sass-loader"],
                },
                {
                    test: /\.[jt]sx?$/,
                    include: path.resolve(__dirname, "src"),
                    oneOf: [
                        // rule for JS code samples
                        {
                            resourceQuery: /rawJS/,
                            type: "asset/source",
                            use: [
                                {
                                    loader: "prettier-loader",
                                    options: {
                                        trailingComma: "all",
                                        tabWidth: 4,
                                        skipRewritingSource: true,
                                        ignoreInitial: false,
                                        parser: "typescript",
                                    },
                                },
                                {
                                    loader: "babel-loader",
                                    options: {
                                        babelrc: false,
                                        plugins: [
                                            [
                                                "@babel/plugin-transform-typescript",
                                                {
                                                    isTSX: true,
                                                    allExtensions: true,
                                                },
                                            ],
                                        ],
                                        retainLines: true,
                                    },
                                },
                            ],
                        },
                        // rule for TS code samples
                        {
                            resourceQuery: /raw/,
                            type: "asset/source",
                        },
                        // rule for actual code
                        {
                            use: ["babel-loader"],
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    include: (rawModulePath) => {
                        // Some npm modules no longer transpiled to ES5, which
                        // causes errors such in IE11.
                        const inclusionReg =
                            /node_modules\/.*((lru-cache)|(react-intl)|(intl-messageformat)|(yup)|highlight.js)/;
                        // On Windows, mPath use backslashes for folder separators. We need
                        // to convert these to forward slashes because our
                        // test regex, inclusionReg, contains one.
                        const modulePath = rawModulePath.replace(/\\/g, "/");
                        return inclusionReg.test(modulePath);
                    },
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                },
                {
                    test: /\.(jpe?g|gif|png|svg|ico|eot|woff2?|ttf|wav|mp3)$/,
                    type: "asset/resource",
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
            ],
        },
        ignoreWarnings: [/Failed to parse source map/], // some of the dependencies have invalid source maps, we do not care that much
        devServer: {
            static: {
                directory: path.join(__dirname, "dist"),
            },
            devMiddleware: {
                stats: "errors-only",
            },
            historyApiFallback: true,
            port: 8999,
            proxy,
        },
        stats: "errors-only",
    });
};
