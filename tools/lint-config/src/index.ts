// (C) 2026 GoodData Corporation

export type { IPackage, GlobalValue } from "./types.js";

export { chaiFriendlyPlugin, chaiFriendlyRules } from "./configurations/chai-friendly.js";
export { cypressPlugin, cypressRules } from "./configurations/cypress.js";
export {
    eslintOverrides,
    eslintRules,
    eslintRulesNativeSupported,
    eslintRulesNativeNotSupported,
} from "./configurations/eslint.js";
export { headersPlugin, headersRules } from "./configurations/headers.js";
export { importEsmPlugin, importEsmRules } from "./configurations/import-esm.js";
export {
    importXRules,
    importXRulesNativeSupported,
    importXRulesNativeNotSupported,
} from "./configurations/import-x.js";
export {
    noBarrelFilesOverrides,
    noBarrelFilesPlugin,
    noBarrelFilesRules,
} from "./configurations/no-barrel-files.js";
export { noOnlyTestsPlugin, noOnlyTestsRules } from "./configurations/no-only-tests.js";
export { securityRules } from "./configurations/security.js";
export { sonarjsOverrides, sonarjsPlugin, sonarjsRules } from "./configurations/sonarjs.js";
export {
    typescriptConflicts,
    typescriptOverrideFiles,
    typescriptRules,
    typescriptRulesNativeNotSupported,
    typescriptRulesNativeSupported,
} from "./configurations/typescript.js";

export { scopeRules } from "./utils/scopeRules.js";
