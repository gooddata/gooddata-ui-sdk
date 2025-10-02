// (C) 2025 GoodData Corporation

import { resolve } from "path";
import { mergeConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const packagesWithoutStyles = [
    "@gooddata/sdk-model",
    "@gooddata/sdk-backend-base",
    "@gooddata/sdk-backend-spi",
    "@gooddata/sdk-backend-mockingbird",
    "@gooddata/sdk-ui-loaders",
    "@gooddata/sdk-ui-theme-provider",
    "@gooddata/sdk-embedding",
];

const packagesWithStyles = [
    "@gooddata/sdk-ui-dashboard",
    "@gooddata/sdk-ui-ext",
    "@gooddata/sdk-ui",
    "@gooddata/sdk-ui-charts",
    "@gooddata/sdk-ui-filters",
    "@gooddata/sdk-ui-gen-ai",
    "@gooddata/sdk-ui-geo",
    "@gooddata/sdk-ui-pivot",
    "@gooddata/sdk-ui-semantic-search",
    "@gooddata/sdk-ui-kit",
    "@gooddata/sdk-ui-vis-commons",
    "@gooddata/sdk-ui-web-components",
];

function makePackageEsmAlias(packageName) {
    // In scss file there are links to esm files, this fix icon loading
    // for these icon imports
    // @example
    // background-image: url("@gooddata/sdk-ui-kit/esm/assets/loading.svg");
    return {
        find: `${packageName}/esm`,
        replacement: resolve(__dirname, `./../../${packageName.split("/")[1]}/esm`),
    };
}

function makePackageSourceAlias(packageName) {
    return {
        find: packageName,
        replacement: resolve(__dirname, `./../../${packageName.split("/")[1]}/src`),
    };
}

function makePackageStylesAlias(packageName) {
    return {
        find: `${packageName}/styles`,
        replacement: resolve(__dirname, `./../../${packageName.split("/")[1]}/styles`),
    };
}

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
                alias: [
                    // This is required to make fonts work
                    {
                        find: "@gooddata/sdk-ui-kit/src/@ui",
                        replacement: resolve(__dirname, "./../../sdk-ui-kit/src/@ui"),
                    },
                    // fixes internal exports from sdk-ui-ext
                    {
                        find: "@gooddata/sdk-ui-ext/internal",
                        replacement: resolve(__dirname, "./../../sdk-ui-ext/src/internal"),
                    },
                    ...packagesWithoutStyles.map(makePackageSourceAlias),
                    ...packagesWithStyles.flatMap((pkg) => [
                        makePackageEsmAlias(pkg),
                        makePackageStylesAlias(pkg),
                        makePackageSourceAlias(pkg),
                    ]),
                ],
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
                exclude: ["module", ...packagesWithoutStyles, ...packagesWithStyles],
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
