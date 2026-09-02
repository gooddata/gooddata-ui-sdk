// (C) 2026 GoodData Corporation

export interface IPackage {
    name: string;
    version: string;
}

/**
 * Global variable configuration value.
 * - "readonly" or false: variable is read-only
 * - "writable" or true: variable can be written to
 */
export type GlobalValue = "readonly" | "writable" | false | true;

export type RuleKey<Prefix extends string = ""> = [Prefix] extends [""] ? string : `${Prefix}/${string}`;

export type RuleValue = string | number | object | object[];

export type Rules<Prefix extends string = ""> = {
    [key in RuleKey<Prefix>]: RuleValue;
};
