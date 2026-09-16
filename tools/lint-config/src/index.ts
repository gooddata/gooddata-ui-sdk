// (C) 2026 GoodData Corporation

export type { IPackage, GlobalValue, Rules, Settings } from "./types.js";

export { chaiFriendlyPlugin, chaiFriendlyRules } from "./configurations/chai-friendly.js";
export {
    eslintOverrides,
    eslintOverridesNativeSupported,
    eslintOverridesNativeNotSupported,
    eslintRules,
    eslintRulesNativeSupported,
    eslintRulesNativeNotSupported,
} from "./configurations/eslint.js";
export { headersPlugin, headersRules } from "./configurations/headers.js";
export { importEsmPlugin, importEsmRules } from "./configurations/import-esm.js";
export { importXRules } from "./configurations/import-x.js";
export {
    noBarrelFilesOverrides,
    noBarrelFilesPlugin,
    noBarrelFilesRules,
} from "./configurations/no-barrel-files.js";
export { noOnlyTestsPlugin, noOnlyTestsRules } from "./configurations/no-only-tests.js";
export { playwrightConflicts, playwrightPlugin, playwrightRules } from "./configurations/playwright.js";
export {
    reactRules,
    reactRulesNativeNotSupported,
    reactRulesNativeSupported,
} from "./configurations/react.js";
export { reactHooksRules } from "./configurations/react-hooks.js";
export { sonarjsOverrides, sonarjsPlugin, sonarjsRules } from "./configurations/sonarjs.js";
export { storybookOverrides, storybookPackages, storybookPlugin } from "./configurations/storybook.js";
export {
    testingLibraryPlugin,
    testingLibraryDomRules,
    testingLibraryReactRules,
    testingLibraryVueRules,
} from "./configurations/testing-library.js";
export {
    typescriptConflicts,
    typescriptConflictsNativeSupported,
    typescriptOverrideFiles,
    typescriptRules,
    typescriptRulesNativeNotSupported,
    typescriptRulesNativeSupported,
} from "./configurations/typescript.js";
export { vitestRules } from "./configurations/vitest.js";

export { scopeRules } from "./utils/scopeRules.js";
