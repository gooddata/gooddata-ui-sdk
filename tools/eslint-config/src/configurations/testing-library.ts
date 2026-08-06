// (C) 2026 GoodData Corporation

import {
    testingLibraryDomRules,
    testingLibraryPlugin,
    testingLibraryReactRules,
    testingLibraryVueRules,
} from "@gooddata/lint-config";

import type { IDualConfiguration } from "../types.js";

const packages = [testingLibraryPlugin];

export const testingLibraryDom: IDualConfiguration<"testing-library"> = {
    v8: {
        packages,
        plugins: ["testing-library"],
        rules: testingLibraryDomRules,
    },
    v9: {
        packages,
        plugins: { "testing-library": testingLibraryPlugin },
        rules: testingLibraryDomRules,
    },
    ox: {},
};

export const testingLibraryReact: IDualConfiguration<"testing-library"> = {
    v8: {
        packages,
        plugins: ["testing-library"],
        rules: testingLibraryReactRules,
    },
    v9: {
        packages,
        plugins: { "testing-library": testingLibraryPlugin },
        rules: testingLibraryReactRules,
    },
    ox: {},
};

export const testingLibraryVue: IDualConfiguration<"testing-library"> = {
    v8: {
        packages,
        plugins: ["testing-library"],
        rules: testingLibraryVueRules,
    },
    v9: {
        packages,
        plugins: { "testing-library": testingLibraryPlugin },
        rules: testingLibraryVueRules,
    },
    ox: {},
};
