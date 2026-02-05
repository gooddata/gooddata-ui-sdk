// (C) 2025-2026 GoodData Corporation

export type Rules<Prefix extends string = ""> = {
    [key in `${Prefix}${string}`]: string | number | object | object[];
};

export type Category =
    | "correctness"
    | "nursery"
    | "pedantic"
    | "perf"
    | "restriction"
    | "style"
    | "suspicious";

export type Level = "off" | "warn" | "error";

export interface IPackage {
    name: string;
    version: string;
}

export interface IJsPlugin {
    name: string;
    specifier: string;
}

interface IConfigurationBase {
    /**
     * Packages which are needed for this configuration
     */
    packages?: IPackage[];
}

interface IConfigurationShared<RulePrefix extends string> {
    /**
     * Enable groups of rules with similar intent.
     */
    categories?: Partial<Record<Category, Level>>;
    /**
     * Plugins to add for this configuration to work
     */
    plugins?: string[];
    /**
     * Plugins to add for this configuration to work
     */
    jsPlugins?: IJsPlugin[];
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

interface IOverride<RulePrefix extends string> extends IConfigurationShared<RulePrefix> {
    files: string[];
    excludedFiles?: string[];
}

export interface IConfiguration<RulePrefix extends string = "">
    extends IConfigurationBase, IConfigurationShared<RulePrefix> {
    overrides?: IOverride<RulePrefix>[];
}
