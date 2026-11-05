// (C) 2026 GoodData Corporation

import {
    testingLibraryDomRules,
    testingLibraryPlugin,
    testingLibraryReactRules,
    testingLibraryVueRules,
} from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

const packages = [testingLibraryPlugin];

const legacyCommonConfiguration = {
    packages,
    plugins: ["testing-library"],
};

const flatCommonConfiguration = {
    packages,
    plugins: { "testing-library": testingLibraryPlugin },
};

const domFlat = {
    ...flatCommonConfiguration,
    rules: testingLibraryDomRules,
};

const reactFlat = {
    ...flatCommonConfiguration,
    rules: testingLibraryReactRules,
};

const vueFlat = {
    ...flatCommonConfiguration,
    rules: testingLibraryVueRules,
};

export const testingLibraryDom: IConfiguration<"testing-library"> = {
    legacy: {
        ...legacyCommonConfiguration,
        rules: testingLibraryDomRules,
    },
    flat: { v9: domFlat, v9ox: {}, v10: domFlat, v10ox: {} },
};

export const testingLibraryReact: IConfiguration<"testing-library"> = {
    legacy: {
        ...legacyCommonConfiguration,
        rules: testingLibraryReactRules,
    },
    flat: { v9: reactFlat, v9ox: {}, v10: reactFlat, v10ox: {} },
};

export const testingLibraryVue: IConfiguration<"testing-library"> = {
    legacy: {
        ...legacyCommonConfiguration,
        rules: testingLibraryVueRules,
    },
    flat: { v9: vueFlat, v9ox: {}, v10: vueFlat, v10ox: {} },
};
