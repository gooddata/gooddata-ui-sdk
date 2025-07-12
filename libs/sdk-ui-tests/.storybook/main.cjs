const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    addons: ["@storybook/addon-actions", "@storybook/preset-scss"],
    stories: ["../stories/**/*.stories.@(ts|tsx)"],
    features: {
        // suppress the warning with deprecated implicit PostCSS loader, we do not need it anyway
        // this makes the eventual upgrade to Storybook 7 easier since we opt-out of the deprecated feature explicitly
        postcss: false,
    },
    core: {
        builder: "webpack5",
    },
    framework: {
        name: "@storybook/react-webpack5",
        options: { fastRefresh: true },
    },
    webpackFinal: async (config) => ({
        ...config,
        externals: { module: "module" },
        resolve: {
            ...config.resolve,
            extensionAlias: {
                ".js": [".ts", ".tsx", ".js", ".jsx"],
            },
            alias: {
                ...config.resolve.alias,
                // fixes internal exports from sdk-ui-ext
                "@gooddata/sdk-ui-ext/internal": path.resolve(
                    "./node_modules/@gooddata/sdk-ui-ext/esm/internal",
                ),
            },
        },
        plugins: [
            ...config.plugins,
            new CopyPlugin({
                patterns: [
                    {
                        from: "./node_modules/@gooddata/sdk-ui-web-components/esm",
                        to: "./static/web-components/",
                    },
                ],
            }),
        ],
        module: {
            ...config.module,
            rules: [
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
                ...config.module.rules
            ]
        },
    }),
};
