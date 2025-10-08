// (C) 2025 GoodData Corporation

export type Rules<Prefix extends string = ""> = {
    [key in `${Prefix}${string}`]: string | number | object | object[];
};

interface IPackage {
    name: string;
    version: string;
}

interface IConfigurationBase {
    /**
     * Packages which are needed for this configuration
     */
    packages?: IPackage[];
}

interface IConfigurationShared<RulePrefix extends string> {
    /**
     * Parser to be set when this configuration is active
     */
    parser?: string;
    /**
     * Plugin to add for this configuration to work
     */
    plugin?: string;
    /**
     * Configurations to extend as port of this configuration
     */
    extends?: string[];
    /**
     * Parser options to be set when this configuration is active
     */
    parserOptions?: Record<string, number | string>;
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
}

export interface IConfiguration<RulePrefix extends string = "">
    extends IConfigurationBase,
        IConfigurationShared<RulePrefix> {
    override?: IOverride<RulePrefix>;
}
