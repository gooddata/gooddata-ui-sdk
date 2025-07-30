// (C) 2025 GoodData Corporation

import { resolve } from "path";
import { mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default {
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
                    "@gooddata/sdk-ui-ext/internal": resolve(
                        "./node_modules/@gooddata/sdk-ui-ext/esm/internal",
                    ),
                },
            },
            server: {
                fs: {
                    allow: [resolve(__dirname, "../../../")],
                },
            },
            plugins: [
                viteStaticCopy({
                    targets: [
                        {
                            src: "./node_modules/@gooddata/sdk-ui-web-components/esm/**/*",
                            dest: "web-components",
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
            define: {
                "process.env": process.env,
                process: {},
            },
        });
    },
};
