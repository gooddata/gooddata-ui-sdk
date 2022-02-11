// (C) 2007-2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const deps = require("./package.json").dependencies;
const {
    container: { ModuleFederationPlugin },
} = webpack;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// add all the gooddata packages that absolutely need to be shared and singletons because of contexts
// do not share @gooddata/sdk-ui-dashboard though, the plugins will load their own
const gooddataSharePackagesEntries = Object.keys(deps)
    .filter((pkg) => pkg.startsWith("@gooddata") && pkg !== "@gooddata/sdk-ui-dashboard")
    .reduce((acc, curr) => {
        acc[curr] = { singleton: true };
        return acc;
    }, {});

module.exports = async (env, argv) => {
    const backendParam = (env && env.backend) || "recorded";
    // eslint-disable-next-line no-mixed-operators
    const basePath = (env && env.basePath) || "";
    const isProduction = argv.mode === "production";

    const backendUrl = "https://secure.gooddata.com";
    const workspace =
        backendParam === "recorded" ? "reference-workspace" : "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf";

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
        new HtmlWebpackPlugin({
            title: "Dashboard Plugins Tests",
        }),
        new CircularDependencyPlugin({
            exclude: /node_modules|dist/,
            failOnError: true,
        }),
        new webpack.DefinePlugin({
            WORKSPACE: JSON.stringify(workspace),
            BACKEND_TYPE: JSON.stringify(backendParam),
        }),
        new ForkTsCheckerWebpackPlugin({
            issue: {
                include: [{ file: "src/**/*.{ts,tsx}" }],
            },
        }),
        // makes KD ready to accept plugins using the federation system
        new ModuleFederationPlugin({
            // adds react as shared module
            // version is inferred from package.json
            // there is no version check for the required version
            // so it will always use the higher version found
            shared: {
                react: {
                    import: "react", // the "react" package will be used a provided and fallback module
                    shareKey: "react", // under this name the shared module will be placed in the share scope
                    singleton: true, // only a single version of the shared module is allowed
                },
                "react-dom": {
                    singleton: true, // only a single version of the shared module is allowed
                },
                // add all the packages that absolutely need to be shared and singletons because of contexts
                ...gooddataSharePackagesEntries,
            },
        }),
    ];

    if (isProduction) {
        plugins.push(new CompressionPlugin());
        plugins.push(new CleanWebpackPlugin());
    } else {
        plugins.push(
            new Dotenv({
                silent: false,
                systemvars: true,
            }),
        );
    }

    // flip the `disable` flag to false if you want to diagnose webpack perf
    const smp = new SpeedMeasurePlugin({ disable: true });

    return smp.wrap({
        entry: ["./src/app/index.tsx"],
        target: "web",
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
            contentBase: path.join(__dirname, "dist"),
            historyApiFallback: true,
            compress: true,
            port: 8446,
            stats: "errors-only",
            liveReload: true,
            proxy,
        },
        stats: "errors-only",
    });
};
