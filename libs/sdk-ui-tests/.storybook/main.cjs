const path = require("path");
const { mergeConfig } = require("vite");
const { copy } = require("copy-vite-plugin");

module.exports = {
    stories: ["../stories/**/*.stories.@(ts|tsx)"],
    features: {
        addons: true,
    },
    core: {
        builder: "@storybook/builder-vite",
    },
    framework: {
        name: "@storybook/react-vite",
        options: { fastRefresh: true },
    },
    async viteFinal(config) {
        return mergeConfig(config, {
            resolve: {
                alias: {
                    // fixes internal exports from sdk-ui-ext
                    "@gooddata/sdk-ui-ext/internal": path.resolve(
                        "./node_modules/@gooddata/sdk-ui-ext/esm/internal",
                    ),
                },
            },
            server: {
                fs: {
                    allow: [
                        path.resolve(__dirname, "../../../"),
                    ],
                },
            },
            plugins: [
                copy({
                    targets: [
                        {
                            src: "./node_modules/@gooddata/sdk-ui-web-components/esm/**/*",
                            dest: "./static/web-components/",
                        },
                    ],
                    hook: "buildStart",
                }),
            ],
            optimizeDeps: {
                exclude: ["module"],
            },
            build: {
                sourcemap: true,
            },
        });
    },
};
