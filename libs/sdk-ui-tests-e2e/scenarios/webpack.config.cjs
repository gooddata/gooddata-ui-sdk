// (C) 2021 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");
require("dotenv").config({ path: "./.env" });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = async (env, argv) => {
    const [backendUrl, workspace, backendType] = [
        process.env.HOST,
        process.env.TEST_WORKSPACE_ID,
        process.env.SDK_BACKEND,
    ];
    console.log(
        "Backend URI:",
        backendUrl,
        ", ",
        "Backend Type:",
        backendType,
        ", ",
        "Workspace to use:",
        workspace,
    );

    const basePath = env?.basePath || "";

    const isProduction = argv.mode === "production";

    const proxy =
        backendType === "BEAR"
            ? {
                  "/gdc": {
                      changeOrigin: true,
                      cookieDomainRewrite: "localhost",
                      secure: false,
                      target: backendUrl,
                      headers: {
                          host: backendUrl.replace(/^https:\/\//, ""),
                          // This is essential for Tiger backends. To ensure 401 flies when not authenticated and using proxy
                          "X-Requested-With": "XMLHttpRequest",
                      },
                      onProxyReq: function (proxyReq, _req, _res) {
                          // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                          proxyReq.removeHeader("origin");
                          proxyReq.setHeader("accept-encoding", "identity");
                      },
                  },
              }
            : {
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
                      onProxyReq(proxyReq) {
                          // changeOrigin: true does not work well for POST requests, so remove origin like this to be safe
                          proxyReq.removeHeader("origin");
                          proxyReq.setHeader("accept-encoding", "identity");
                      },
                  },
              };

    const plugins = [
        new CleanWebpackPlugin(),
        new Dotenv({
            silent: false,
            systemvars: true,
        }),
        new HtmlWebpackPlugin({
            title: "GoodData.UI Developer Scenarios",
            template: "./scenarios/public/index.html",
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules|dist/,
            failOnError: true,
        }),
        new webpack.DefinePlugin({
            BACKEND_URL: JSON.stringify(backendUrl),
            BACKEND_TYPE: JSON.stringify(backendType),
            WORKSPACE_ID: JSON.stringify(workspace),
            BASEPATH: JSON.stringify(basePath),
            BUILTIN_MAPBOX_TOKEN: JSON.stringify(process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN || ""),
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

    const commonConfig = {
        entry: ["./scenarios/src/index.tsx"],
        target: "web",
        mode: isProduction ? "production" : "development",
        plugins,
        output: {
            filename: "[name].[contenthash].js",
            path: path.join(__dirname, "build"),
            publicPath: `./`,
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
                "@gooddata/sdk-backend-spi": path.resolve("./node_modules/@gooddata/sdk-backend-spi"),
                "@gooddata/sdk-ui": path.resolve("./node_modules/@gooddata/sdk-ui"),
                "@gooddata/sdk-ui-charts": path.resolve("./node_modules/@gooddata/sdk-ui-charts"),
                "@gooddata/sdk-ui-filters": path.resolve("./node_modules/@gooddata/sdk-ui-filters"),
                "@gooddata/sdk-ui-geo": path.resolve("./node_modules/@gooddata/sdk-ui-geo"),
                "@gooddata/sdk-ui-pivot": path.resolve("./node_modules/@gooddata/sdk-ui-pivot"),
                "@gooddata/sdk-model": path.resolve("./node_modules/@gooddata/sdk-model"),
                "@gooddata/sdk-backend-bear": path.resolve("./node_modules/@gooddata/sdk-backend-bear"),
                "@gooddata/sdk-backend-tiger": path.resolve("./node_modules/@gooddata/sdk-backend-tiger"),
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
                    include: path.resolve(__dirname, "../reference_workspace/workspace_objects"),
                    use: {
                        loader: "babel-loader",
                        options: {
                            configFile: path.resolve(__dirname, ".babelrc"),
                        },
                    },
                },
                {
                    test: /\.[jt]sx?$/,
                    include: path.resolve(__dirname, "src"),
                    use: ["babel-loader"],
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
        stats: "errors-only",
    };

    return [
        {
            ...commonConfig,
            name: "default",
        },
        {
            ...commonConfig,
            name: "local-run",
            devServer: {
                static: {
                    directory: path.join(__dirname, "scenarios/build"),
                },
                devMiddleware: {
                    stats: "errors-only",
                },
                historyApiFallback: true,
                port: 9500,
                liveReload: true,
                proxy,
            },
            output: {
                path: path.join(__dirname, "gooddata-ui-sdk"),
                publicPath: "/gooddata-ui-sdk",
                filename: "[name].js",
            },
        },
    ];
};
