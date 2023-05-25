const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    addons: ["@storybook/addon-actions", "@storybook/preset-scss"],
    stories: ["../stories/**/*.@(ts|tsx)"],
    features: {
        // suppress the warning with deprecated implicit PostCSS loader, we do not need it anyway
        // this makes the eventual upgrade to Storybook 7 easier since we opt-out of the deprecated feature explicitly
        postcss: false,
        // opt out of "Story Store V7" and continue using legacy "storiesof API"
        storyStoreV7: false,
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
                // fixes tilde imports in CSS from sdk-ui-ext
                "@gooddata/sdk-ui-ext/internal": path.resolve(
                    "./node_modules/@gooddata/sdk-ui-ext/esm/internal",
                ),
                "@gooddata/sdk-ui-ext": path.resolve("./node_modules/@gooddata/sdk-ui-ext"),
                "@gooddata/sdk-ui-kit": path.resolve("./node_modules/@gooddata/sdk-ui-kit"),
                "@gooddata/sdk-ui-dashboard": path.resolve("./node_modules/@gooddata/sdk-ui-dashboard"),
                "@gooddata/sdk-ui": path.resolve("./node_modules/@gooddata/sdk-ui"),
                "@gooddata/sdk-ui-charts": path.resolve("./node_modules/@gooddata/sdk-ui-charts"),
                "@gooddata/sdk-ui-filters": path.resolve("./node_modules/@gooddata/sdk-ui-filters"),
                "@gooddata/sdk-ui-geo": path.resolve("./node_modules/@gooddata/sdk-ui-geo"),
                "@gooddata/sdk-ui-pivot": path.resolve("./node_modules/@gooddata/sdk-ui-pivot"),
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
    }),
};
