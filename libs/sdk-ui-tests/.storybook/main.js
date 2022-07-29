const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    addons: ["@storybook/addon-actions", "@storybook/preset-scss"],
    stories: ["../stories/**/*.@(ts|tsx)"],
    features: {
        // suppress the warning with deprecated implicit PostCSS loader, we do not need it anyway
        // this makes the eventual upgrade to Storybook 7 easier since we opt-out of the deprecated feature explicitly
        postcss: false,
    },
    core: {
        builder: "webpack5",
    },
    webpackFinal: async (config) => ({
        ...config,
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
    }),
};
