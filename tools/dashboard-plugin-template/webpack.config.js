// (C) 2007-2021 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin, ProvidePlugin } = require("webpack");
const path = require("path");
const deps = require("./package.json").dependencies;
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const BACKEND_URL = "https://live-examples-proxy.herokuapp.com";
const PORT = 3001;
const SCOPE_NAME = "plugin";
const WORKSPACE = "xms7ga4tf3g3nzucd8380o2bev8oeknp";

const proxy = {
    "/gdc": {
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
        secure: false,
        target: BACKEND_URL,
        headers: {
            host: BACKEND_URL,
            origin: null,
        },
        onProxyReq(proxyReq) {
            proxyReq.setHeader("accept-encoding", "identity");
        },
    },
};

// add all the gooddata packages that absolutely need to be shared and singletons because of contexts
const gooddataSharePackagesEntries = Object.keys(deps)
    .filter((pkg) => pkg.startsWith("@gooddata"))
    .reduce((acc, curr) => {
        acc[curr] = { singleton: true };
        return acc;
    }, {});

module.exports = (_env, argv) => {
    const isProduction = argv.mode === "production";

    const commonConfig = {
        mode: isProduction ? "production" : "development",
        // support IE11 only in production, in dev it is not necessary and it also would prevent hot reload
        target: isProduction ? ["web", "es5"] : "web",
        devtool: isProduction ? false : "eval-cheap-module-source-map",
        output: {
            publicPath: "auto",
        },
        resolve: {
            // Allow to omit extensions when requiring these files
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],

            alias: {
                // fixes tilde imports in CSS from sdk-ui-* packages
                "@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
                "@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),
            },

            // Prefer ESM versions of packages to enable tree shaking
            mainFields: ["module", "browser", "main"],

            // polyfill "process" and "util" for lru-cache, webpack 5 no longer does that automatically
            // remove this after IE11 support is dropped and lru-cache can be finally upgraded
            fallback: {
                process: require.resolve("process/browser"),
                util: require.resolve("util/"),
            },
        },
        module: {
            rules: [
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
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(eot|woff|ttf|svg)/,
                    type: "asset/resource",
                },
                // {
                //     // never tree shake sdk-ui-dashboard so that the version here is also used in the plugins
                //     test: (modulePath) => /sdk-ui-dashboard/.test(modulePath),
                //     sideEffects: true,
                // },
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
            new ModuleFederationPlugin({
                name: SCOPE_NAME,
                filename: "plugin.js",
                exposes: {
                    "./plugin": "./src/plugin",
                },

                // adds react as shared module
                // version is inferred from package.json
                // there is no version check for the required version
                // so it will always use the higher version found
                shared: {
                    react: {
                        import: "react", // the "react" package will be used a provided and fallback module
                        shareKey: "react", // under this name the shared module will be placed in the share scope
                        shareScope: "default", // share scope with this name will be used
                        singleton: true, // only a single version of the shared module is allowed
                    },
                    "react-dom": {
                        singleton: true, // only a single version of the shared module is allowed
                    },
                    // add all the packages that absolutely need to be shared and singletons because of contexts
                    "react-intl": {
                        singleton: true,
                    },
                    ...gooddataSharePackagesEntries,
                },
            }),
            new ProvidePlugin({
                process: "process/browser",
            }),
            new DefinePlugin({
                BACKEND_URL: JSON.stringify(BACKEND_URL),
                PORT: JSON.stringify(PORT),
                SCOPE_NAME: JSON.stringify(SCOPE_NAME),
                WORKSPACE: JSON.stringify(WORKSPACE),
            }),
            // process.env.BUNDLE_ANALYZER === "true" && new BundleAnalyzerPlugin(),
        ].filter(Boolean),
    };

    return [
        {
            ...commonConfig,
            entry: "./src/index",
            name: "harness",
            devServer: {
                contentBase: path.join(__dirname, "dist"),
                port: PORT,
                proxy,
            },
            plugins: [
                ...commonConfig.plugins,
                new HtmlWebpackPlugin({
                    template: "./src/harness/public/index.html",
                }),
            ],
        },
        {
            ...commonConfig,
            entry: "./src/plugin/index",
            name: "dashboardPlugin",
            output: { ...commonConfig.output, path: path.join(__dirname, "dist", "dashboardPlugin") },
        },
        {
            ...commonConfig,
            entry: "./src/engine/index",
            name: "dashboardEngine",
            output: { ...commonConfig.output, path: path.join(__dirname, "dist", "dashboardEngine") },
        },
    ];
};
