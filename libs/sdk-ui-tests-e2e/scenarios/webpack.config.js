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
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = async (env, argv) => {
    const backendParam = "stg3";
    const [backendUrl, workspace] = ["https://staging3.intgdc.com", "frho3i7qc6epdek7mcgergm9vtm6o5ty"];

    // eslint-disable-next-line no-mixed-operators
    const basePath = (env && env.basePath) || "";

    const isProduction = argv.mode === "production";

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
            WORKSPACE: JSON.stringify(workspace),
            BASEPATH: JSON.stringify(basePath),
            BUILTIN_MAPBOX_TOKEN: JSON.stringify(process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN || ""),
            BUILD_TYPE: JSON.stringify(backendParam),
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
        devServer: {
            contentBase: path.join(__dirname, "scenarios/build"),
            historyApiFallback: true,
            compress: true,
            port: 8999,
            stats: "errors-only",
            liveReload: true,
            proxy,
        },
        stats: "errors-only",
    });
};
