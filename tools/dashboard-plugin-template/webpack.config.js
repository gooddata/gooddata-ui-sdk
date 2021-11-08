// (C) 2007-2021 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin, ProvidePlugin } = require("webpack");
const path = require("path");
const deps = require("./package.json").dependencies;
const Dotenv = require("dotenv-webpack");
require("dotenv").config();

const { MODULE_FEDERATION_NAME } = require("./src/metadata.json");

const PORT = 3001;
const DEFAULT_BACKEND_URL = "https://live-examples-proxy.herokuapp.com";
const SHARE_SCOPE = "default"; // any other share scope name fail with multiple versions of react for some reason

// add all the gooddata packages that absolutely need to be shared and singletons because of contexts
const gooddataSharePackagesEntries = Object.keys(deps)
    .filter((pkg) => pkg.startsWith("@gooddata"))
    .reduce((acc, curr) => {
        acc[curr] = {
            singleton: true,
            shareScope: SHARE_SCOPE,
        };
        return acc;
    }, {});

module.exports = (_env, argv) => {
    const isProduction = argv.mode === "production";

    const effectiveBackendUrl = process.env.BACKEND_URL || DEFAULT_BACKEND_URL;

    const proxy = {
        "/gdc": {
            changeOrigin: true,
            cookieDomainRewrite: "localhost",
            secure: false,
            target: effectiveBackendUrl,
            headers: {
                host: effectiveBackendUrl,
                origin: null,
            },
            onProxyReq(proxyReq) {
                proxyReq.setHeader("accept-encoding", "identity");
            },
        },
    };

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
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
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
                    test: /\.(eot|woff|ttf|svg)/,
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
        plugins: [new CaseSensitivePathsPlugin()],
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
                new ProvidePlugin({
                    process: "process/browser",
                }),
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
                }),
            ],
        },
        {
            ...commonConfig,
            entry: `./src/${MODULE_FEDERATION_NAME}/index`,
            name: "dashboardPlugin",
            output: { ...commonConfig.output, path: path.join(__dirname, "dist", "dashboardPlugin") },
            plugins: [
                ...commonConfig.plugins,
                new ModuleFederationPlugin({
                    name: MODULE_FEDERATION_NAME, // this is used to put the plugin on the target window scope by default
                    exposes: {
                        /**
                         * this is the main entry point providing info about the engine and plugin
                         * this allows us to only load the plugin and/or engine when needed
                         */
                        [`./${MODULE_FEDERATION_NAME}_ENTRY`]: `./src/${MODULE_FEDERATION_NAME}_entry`,
                        /**
                         * this is the entry to the plugin itself
                         */
                        [`./${MODULE_FEDERATION_NAME}_PLUGIN`]: `./src/${MODULE_FEDERATION_NAME}`,
                        /**
                         * this is the entry to the engine
                         */
                        [`./${MODULE_FEDERATION_NAME}_ENGINE`]: `./src/${MODULE_FEDERATION_NAME}_engine`,
                    },

                    // adds react as shared module
                    // version is inferred from package.json
                    // there is no version check for the required version
                    // so it will always use the higher version found
                    shared: {
                        react: {
                            import: "react", // the "react" package will be used a provided and fallback module
                            shareKey: "react", // under this name the shared module will be placed in the share scope
                            shareScope: SHARE_SCOPE, // share scope with this name will be used
                            singleton: true, // only a single version of the shared module is allowed
                            requiredVersion: deps.react,
                        },
                        "react-dom": {
                            singleton: true,
                            shareScope: SHARE_SCOPE,
                            requiredVersion: deps["react-dom"],
                        },
                        // add all the packages that absolutely need to be shared and singletons because of contexts
                        "react-intl": {
                            singleton: true,
                            shareScope: SHARE_SCOPE,
                        },
                        ...gooddataSharePackagesEntries,
                    },
                }),
            ],
        },
    ];
};
