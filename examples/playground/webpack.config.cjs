// (C) 2007-2019 GoodData Corporation
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const playgroundDefinitions = {
    sec: ["https://secure.gooddata.com", "k26dtejorcqlqf11crn6imbeevp2q4kg", "bear"],
    secure: ["https://secure.gooddata.com", "k26dtejorcqlqf11crn6imbeevp2q4kg", "bear"],
    stg: ["https://staging.intgdc.com", "na1q8a0q4efb7cajbgre9mmm776dr1yv", "bear"],
    stg2: ["https://staging2.intgdc.com", "ws7pxsamkx8o0t1s7kfvkj5o41uwcmqg", "bear"],
    stg3: ["https://staging3.intgdc.com", "mbuumy476p78ybcceiru61hcyr8i8lo8", "bear"],
    developer: ["https://developer.na.gooddata.com", "xms7ga4tf3g3nzucd8380o2bev8oeknp", "bear"],
    public: ["https://live-examples-proxy.herokuapp.com", "xms7ga4tf3g3nzucd8380o2bev8oeknp", "bear"],
    reference: ["https://secure.gooddata.com", "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf", "bear"],
    "tiger-stg": ["https://staging.anywhere.gooddata.com", "4dc4e033e611421791adea58d34d958c", "tiger"],
};

module.exports = async (env, argv) => {
    const backendParam = env?.backend || "public";
    const [backendUrl, workspace, backendType] =
        playgroundDefinitions[backendParam] || playgroundDefinitions.public;

    // eslint-disable-next-line no-mixed-operators
    const basePath = env?.basePath || "";

    // eslint-disable-next-line no-console
    console.log("Backend URI:", backendUrl, "Workspace to use:", workspace);

    const isProduction = argv.mode === "production";

    // see also production proxy at /examples/server/src/endpoints/proxy.js
    const proxy =
        backendType === "bear"
            ? {
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
            title: "GoodData.UI Developer Playground",
        }),
        new webpack.DefinePlugin({
            BACKEND_URL: JSON.stringify(backendUrl),
            BACKEND_TYPE: JSON.stringify(backendType),
            WORKSPACE: JSON.stringify(workspace),
            BASEPATH: JSON.stringify(basePath),
            BUILTIN_MAPBOX_TOKEN: JSON.stringify(process.env.EXAMPLE_MAPBOX_ACCESS_TOKEN || ""),
            BUILD_TYPE: JSON.stringify(backendParam),
            WDYR: env.WDYR,
        }),
        new ForkTsCheckerWebpackPlugin({
            issue: {
                include: [{ file: "src/**/*.{ts,tsx}" }],
            },
        }),
    ];

    // flip the `disable` flag to false if you want to diagnose webpack perf
    const smp = new SpeedMeasurePlugin({ disable: true });

    return smp.wrap({
        entry: ["./src/index.tsx"],
        target: "web",
        mode: isProduction ? "production" : "development",
        experiments: {
            outputModule: true,
        },
        plugins,
        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve("./esm"),
            publicPath: `${basePath}/`,
            library: {
                type: "module",
            },
        },
        devtool: isProduction ? false : "cheap-module-source-map",
        node: {
            __filename: true,
        },
        resolve: {
            // Alias for ESM imports with .js suffix because
            // `import { abc } from "../abc.js"` may be in fact importing from `abc.tsx` file
            extensionAlias: {
                    ".js": [".ts", ".tsx", ".js", ".jsx"],
            },

            alias: {
                react: path.resolve("./node_modules/react"),
                // fixes tilde imports in CSS
                "@gooddata/sdk-ui-charts": path.resolve("./node_modules/@gooddata/sdk-ui-charts"),
                "@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
                "@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),

                "@gooddata/sdk-ui-filters": path.resolve("./node_modules/@gooddata/sdk-ui-filters"),
                "@gooddata/sdk-ui-kit": path.resolve("./node_modules/@gooddata/sdk-ui-kit"),
                "@gooddata/sdk-ui-pivot": path.resolve("./node_modules/@gooddata/sdk-ui-pivot"),
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
            liveReload: true,
            proxy,
        },
        stats: "errors-only",
    });
};
