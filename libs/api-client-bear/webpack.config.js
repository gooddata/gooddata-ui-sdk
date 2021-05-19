// (C) 2007-2020 GoodData Corporation
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/gooddata-browser.ts",
    output: {
        filename: "gooddata.js",
        // export itself to a global var as well as a UMD module
        libraryTarget: "umd",
        // name of the global var
        library: "gooddata",
        path: path.join(__dirname, "umd"),
    },
    target: ["web", "es5"], // support IE11
    externals: {
        "fetch-cookie": {
            root: "fetch-cookie",
            commonjs2: "fetch-cookie",
            commonjs: "fetch-cookie",
            amd: "fetch-cookie",
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true,
                    },
                },
                include: [path.join(__dirname, "src")],
                exclude: /(node_modules)/,
            },
        ],
    },
    resolve: {
        // Allow to omit extensions when requiring these files
        extensions: [".js", ".ts", ".jsx", ".tsx", ".styl", ".scss", ".json"],
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /\/iconv-loader$/ }),
        new LodashModuleReplacementPlugin({ currying: true, flattening: true, placeholders: true }),
        //new webpack.BannerPlugin({ banner: '<%= license %>', raw: true })
    ],
};
