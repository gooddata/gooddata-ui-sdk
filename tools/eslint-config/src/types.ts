// (C) 2025-2026 GoodData Corporation

import type { GlobalValue, IPackage, Rules, Settings } from "@gooddata/lint-config";

interface IConfigurationBase {
    /**
     * Packages which are needed for this configuration
     */
    packages?: IPackage[];
}

interface IConfigurationSharedLegacy<RulePrefix extends string> {
    /**
     * Parser to be set when this configuration is active
     */
    parser?: string;
    /**
     * Plugins to add for this configuration to work
     */
    plugins?: string[];
    /**
     * Parser options to be set when this configuration is active
     */
    parserOptions?: Record<string, unknown>;
    /**
     * Rules for this configuration
     */
    rules?: Rules<RulePrefix>;
    /**
     * Settings to be added when this configuration is active
     */
    settings?: Settings;
    /**
     * Env values to be set when this configuration is active
     */
    env?: Record<string, boolean>;
    /**
     * Ignore patterns to be added when this configuration is active
     */
    ignorePatterns?: string[];
}

/**
 * Globals presets from the `globals` npm package.
 * @see https://www.npmjs.com/package/globals
 */
export type GlobalsPreset =
    | "browser"
    | "node"
    | "commonjs"
    | "es5"
    | "es2015"
    | "es2016"
    | "es2017"
    | "es2018"
    | "es2019"
    | "es2020"
    | "es2021"
    | "es2022"
    | "es2023"
    | "es2024"
    | "es2025"
    | "worker"
    | "serviceworker"
    | "webextensions"
    | "greasemonkey"
    | "devtools"
    | "nashorn"
    | "mocha"
    | "jasmine"
    | "jest"
    | "qunit"
    | "phantomjs"
    | "shelljs"
    | "meteor"
    | "mongo"
    | "prototypejs"
    | "embertest"
    | "protractor"
    | "jquery"
    | "shared-node-browser";

/**
 * Source type for ECMAScript modules.
 */
export type SourceType = "module" | "script" | "commonjs";

interface ILanguageOptionsFlat {
    /**
     * Globals presets to include (build script spreads from `globals` package).
     */
    globalsPresets?: GlobalsPreset[];
    /**
     * Custom global variables to define.
     * Use this for globals not covered by standard presets (e.g., Cypress globals).
     */
    globals?: Record<string, GlobalValue>;
    /**
     * ECMAScript version to use.
     */
    ecmaVersion?: number | "latest";
    /**
     * Source type for the code.
     */
    sourceType?: SourceType;
    /**
     * Parser options to be set when this configuration is active
     */
    parserOptions?: Record<string, unknown>;
}

interface IConfigurationSharedFlat<RulePrefix extends string> {
    /**
     * Parser to be set when this configuration is active
     */
    parser?: string;
    /**
     * Plugins to add for this configuration to work
     */
    plugins?: Record<string, IPackage>;
    /**
     * Configurations to extend as port of this configuration
     * This has been removed for flat config since extended configs cause various issues, using the rules directly is much more stable
     */
    // extends?: unknown;
    /**
     * Language options for flat config (replaces env, parserOptions)
     */
    languageOptions?: ILanguageOptionsFlat;
    /**
     * Rules for this configuration
     */
    rules?: Rules<RulePrefix>;
    /**
     * Settings to be added when this configuration is active
     */
    settings?: Settings;
    /**
     * Ignore patterns to be added when this configuration is active
     */
    ignorePatterns?: string[];
}

interface IOverrideLegacy<RulePrefix extends string> extends IConfigurationSharedLegacy<RulePrefix> {
    files: string[];
    excludedFiles?: string[];
}

interface IOverrideFlat<RulePrefix extends string> extends IConfigurationSharedFlat<RulePrefix> {
    files: string[];
    excludedFiles?: string[];
}

export interface IConfigurationLegacy<RulePrefix extends string = "">
    extends IConfigurationBase, IConfigurationSharedLegacy<RulePrefix> {
    overrides?: IOverrideLegacy<RulePrefix>[];
}

export interface IConfigurationFlat<RulePrefix extends string = "">
    extends IConfigurationBase, IConfigurationSharedFlat<RulePrefix> {
    overrides?: IOverrideFlat<RulePrefix>[];
}

/**
 * Flat configurations per ESLint major, each with a plain variant and an OxLint partial migration variant.
 */
export interface IConfigurationFlatVariants<RulePrefix extends string = ""> {
    /**
     * ESLint 9
     */
    v9: IConfigurationFlat<RulePrefix>;
    /**
     * ESLint 9, rules already covered by OxLint left out
     */
    v9ox: IConfigurationFlat<RulePrefix>;
    /**
     * ESLint 10
     */
    v10: IConfigurationFlat<RulePrefix>;
    /**
     * ESLint 10, rules already covered by OxLint left out
     */
    v10ox: IConfigurationFlat<RulePrefix>;
}

export interface IConfiguration<
    RulePrefixLegacy extends string = "",
    RulePrefixFlat extends string = RulePrefixLegacy,
> {
    legacy: IConfigurationLegacy<RulePrefixLegacy>;
    flat: IConfigurationFlatVariants<RulePrefixFlat>;
}
