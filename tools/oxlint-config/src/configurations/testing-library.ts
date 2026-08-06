// (C) 2026 GoodData Corporation

import {
    testingLibraryDomRules,
    testingLibraryPlugin,
    testingLibraryReactRules,
    testingLibraryVueRules,
} from "@gooddata/lint-config";

import type { IConfiguration } from "../types.js";

export const testingLibraryDom: IConfiguration<"testing-library"> = {
    packages: [testingLibraryPlugin],
    jsPlugins: [{ name: "testing-library", specifier: testingLibraryPlugin.name }],
    rules: testingLibraryDomRules,
};

export const testingLibraryReact: IConfiguration<"testing-library"> = {
    packages: [testingLibraryPlugin],
    jsPlugins: [{ name: "testing-library", specifier: testingLibraryPlugin.name }],
    rules: testingLibraryReactRules,
};

export const testingLibraryVue: IConfiguration<"testing-library"> = {
    packages: [testingLibraryPlugin],
    jsPlugins: [{ name: "testing-library", specifier: testingLibraryPlugin.name }],
    rules: testingLibraryVueRules,
};
