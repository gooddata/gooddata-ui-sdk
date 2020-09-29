const path = require("path");
const webpack = require("webpack");

const commitHash = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();

/*
 * Our extension of config adds support for typescript. support for CSS loading and SVG & fonts is built into
 * storybook's webpack by default (having file-loader for svg et al here lead to build-time warnings about duplicate
 * svgs, removing it from here gets rid of warnings and everything still renders OK)
 */
module.exports = ({ config, mode }) => {
    config.resolve.extensions.push(".ts", ".tsx");
    config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        include: [
            path.join(__dirname, "../stories"),
            path.join(__dirname, "../scenarios"),
            path.join(__dirname, "../src"),
        ],
        loaders: [
            {
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    configFile: path.join(__dirname, "../tsconfig.json"),
                },
            },
        ],
    });

    // SCSS support
    config.module.rules.push({
        test: /\.scss$/,
        use: [
            {
                loader: "style-loader",
            },
            {
                loader: "css-loader",
            },
            {
                loader: "sass-loader",
            },
        ],
    });

    // DEBUG constant
    config.plugins.push(
        new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(commitHash),
        }),
    );

    return config;
};
