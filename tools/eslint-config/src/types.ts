// (C) 2025-2026 GoodData Corporation

export type Rules<Prefix extends string = ""> = {
    [key in `${Prefix}${string}`]: string | number | object | object[];
};

export interface IPackage {
    name: string;
    version: string;
}

interface IConfigurationBase {
    /**
     * Packages which are needed for this configuration
     */
    packages?: IPackage[];
}

interface IConfigurationSharedV8<RulePrefix extends string> {
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
    settings?: Record<string, object>;
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

/**
 * Global variable configuration value.
 * - "readonly" or false: variable is read-only
 * - "writable" or true: variable can be written to
 */
export type GlobalValue = "readonly" | "writable" | false | true;

interface ILanguageOptionsV9 {
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

interface IConfigurationSharedV9<RulePrefix extends string> {
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
     * This has been removed for v9 since extended configs cause various issues, using the rules directly is much more stable
     */
    // extends?: unknown;
    /**
     * Language options for v9 flat config (replaces env, parserOptions)
     */
    languageOptions?: ILanguageOptionsV9;
    /**
     * Rules for this configuration
     */
    rules?: Rules<RulePrefix>;
    /**
     * Settings to be added when this configuration is active
     */
    settings?: Record<string, object>;
    /**
     * Ignore patterns to be added when this configuration is active
     */
    ignorePatterns?: string[];
}

interface IOverrideV8<RulePrefix extends string> extends IConfigurationSharedV8<RulePrefix> {
    files: string[];
    excludedFiles?: string[];
}

interface IOverrideV9<RulePrefix extends string> extends IConfigurationSharedV9<RulePrefix> {
    files: string[];
    excludedFiles?: string[];
}

export interface IConfigurationV8<RulePrefix extends string = "">
    extends IConfigurationBase, IConfigurationSharedV8<RulePrefix> {
    overrides?: IOverrideV8<RulePrefix>[];
}

export interface IConfigurationV9<RulePrefix extends string = "">
    extends IConfigurationBase, IConfigurationSharedV9<RulePrefix> {
    overrides?: IOverrideV9<RulePrefix>[];
}

export interface IDualConfiguration<
    RulePrefixV8 extends string = "",
    RulePrefixV9 extends string = RulePrefixV8,
> {
    v8: IConfigurationV8<RulePrefixV8>;
    v9: IConfigurationV9<RulePrefixV9>;
    ox: IConfigurationV9<RulePrefixV9>;
}
