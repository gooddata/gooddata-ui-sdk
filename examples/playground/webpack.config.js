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

const playgroundDefinitions = {
    sec: ["https://secure.gooddata.com", "k26dtejorcqlqf11crn6imbeevp2q4kg"],
    secure: ["https://secure.gooddata.com", "k26dtejorcqlqf11crn6imbeevp2q4kg"],
    stg: ["https://staging.intgdc.com", "na1q8a0q4efb7cajbgre9mmm776dr1yv"],
    stg2: ["https://staging2.intgdc.com", "ws7pxsamkx8o0t1s7kfvkj5o41uwcmqg"],
    stg3: ["https://staging3.intgdc.com", "mbuumy476p78ybcceiru61hcyr8i8lo8"],
    developer: ["https://developer.na.gooddata.com", "xms7ga4tf3g3nzucd8380o2bev8oeknp"],
    public: ["https://live-examples-proxy.herokuapp.com", "xms7ga4tf3g3nzucd8380o2bev8oeknp"],
    reference: ["https://secure.gooddata.com", "l32xdyl4bjuzgf9kkqr2avl55gtuyjwf"],
};

module.exports = async (env, argv) => {
    const backendParam = (env && env.backend) || "public";
    const [backendUrl, workspace] = playgroundDefinitions[backendParam] || playgroundDefinitions.public;

    // eslint-disable-next-line no-mixed-operators
    const basePath = (env && env.basePath) || "";

    // eslint-disable-next-line no-console
    console.log("Backend URI:", backendUrl, "Workspace to use:", workspace);

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
            WDYR: env.WDYR,
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
                    test: /\.js$/,
                    include: (rawModulePath) => {
                        // Some npm modules no longer transpiled to ES5, which
                        // causes errors such in IE11.
                        const inclusionReg =
                            /node_modules\/.*((lru-cache)|(react-intl)|(intl-messageformat))/;
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
        devServer: {
            contentBase: path.join(__dirname, "dist"),
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
