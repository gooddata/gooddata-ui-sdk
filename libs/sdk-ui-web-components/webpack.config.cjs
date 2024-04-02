// (C) 2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const { EnvironmentPlugin, ContextReplacementPlugin, DefinePlugin } = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");
const npmPackage = require("./package.json");
const { EsbuildPlugin } = require("esbuild-loader");

module.exports = (env, argv) => ({
    mode: argv.mode,
    target: "web",
    devtool: argv.mode === "production" ? "source-map" : "eval-cheap-module-source-map",
    experiments: {
        outputModule: true,
    },
    output: {
        assetModuleFilename: "assets/[hash][ext][query]",
        path: path.resolve("./esm"),
        // Force .js extension instead of .mjs
        filename: "[name].js",
        chunkFilename: "assets/[chunkhash].js",
        library: {
            type: "module",
        },
    },
    optimization: {
        minimizer: [new EsbuildPlugin()],
    },
    entry: {
        index: "./src/index",
        tigerBackend: "./src/tigerBackend",
    },
    name: "index",
    resolve: {
        // Allow omitting extensions when requiring these files
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],

        // Alias for ESM imports with .js suffix because
        // `import { abc } from "../abc.js"` may be in fact importing from `abc.tsx` file
        extensionAlias: {
            ".js": [".ts", ".tsx", ".js", ".jsx"],
        },

        // Prefer ESM versions of packages to enable tree shaking
        mainFields: ["module", "browser", "main"],
    },
    module: {
        rules: [
            { test: /\.m?js/, type: "javascript/auto" },
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            transpileOnly: argv.mode === "production" ? false : true,
                            configFile: path.resolve("./tsconfig.json"),
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    argv.mode === "production" ? MiniCssExtractPlugin.loader : "style-loader",
                    "css-loader",
                ],
            },
            {
                test: /\.(eot|woff|ttf|svg|jpg|jpeg|gif)/,
                type: "asset/resource",
            },
            {
                test: /\.js$/,
                enforce: "pre",
                include: path.resolve(__dirname, "src"),
                use: ["source-map-loader"],
            },
            {
                test: /\.json$/,
                loader: "json-loader",
            },
        ],
        parser: {
            javascript: {
                // We need to evaluate import.meta.url at the runtime
                importMeta: false,
            },
        },
    },
    plugins: [
        // EN is not needed, default value
        new ContextReplacementPlugin(/moment[/\\]locale$/, /(zh-CN|fr|de|es|ru|nl|pt-br|pt|ja)\.js/i),
        new EnvironmentPlugin({
            npm_package_name: "",
            npm_lifecycle_script: "",
            _nodeLRUCacheForceNoSymbol: "",
            TEST_PSEUDOMAP: "",
            NODE_DEBUG: "",
        }),
        new DefinePlugin({
            NPM_PACKAGE_NAME: JSON.stringify(npmPackage.name),
            // Use sdk-model for version, as current package version is not updated by rush
            // because it's not released to NPM.
            NPM_PACKAGE_VERSION: JSON.stringify(
                npmPackage.dependencies["@gooddata/sdk-model"].replace(/[\^~]/, ""),
            ),
        }),
        new ForkTsCheckerWebpackPlugin(),
        argv.mode === "production" && new MiniCssExtractPlugin(),
        env.analyze &&
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
            }),
    ].filter(Boolean),
});
