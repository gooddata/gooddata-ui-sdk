// (C) 2023-2026 GoodData Corporation

import { Pair, YAMLMap } from "yaml";

import type { Visualisation } from "@gooddata/sdk-code-schemas/v1";

import { entryWithSpace } from "../utils/yamlUtils.js";

/** @public */
export type VisualisationConfig<T> = {
    controls?: T;
};

/** @internal */
export type ConfigDefaults<T> = {
    [key in keyof T]: T[key];
};

/** @public */
export type ValueType = "string" | "bool" | "number" | "bool_auto" | "array";

/** @public */
export function getValueOrDefault<T>(
    value: T,
    defaultValue: T,
    type: ValueType = "string",
    undefinedAsDefault: boolean = false,
): T | undefined {
    const val = value === undefined && undefinedAsDefault ? defaultValue : value;
    if (value !== defaultValue && val !== undefined) {
        switch (type) {
            case "bool":
                return !!val as T;
            case "bool_auto":
                if (val === "auto") {
                    return val as T;
                }
                return !!val as T;
            case "number": {
                const num = parseFloat(String(val));
                return (isNaN(num) ? undefined : num) as T;
            }
            case "array":
                return Array.isArray(val) ? val : ([val] as T);
            case "string":
            default:
                return String(val) as T;
        }
    }
    return undefined;
}

/**
 * The following utility drops the `[key: string]: unknown` that are present in the generated AAC `config.json` schema
 * It does so via `as string`. Another way to achieve this (without this type gymnastic) is to set an `additionalProperties: false`
 * in the JSON schema, so that `[key: string]: unknown` is not present there. This could be a breaking change for some users though.
 */
type KnownKeys<T> = {
    [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
type YamlConfig = KnownKeys<NonNullable<Visualisation["config"]>>;
type ConfigEntry = { [K in keyof YamlConfig]-?: [key: K, value: unknown] }[keyof YamlConfig];
type LoaderArgs<T> = { [K in keyof T]: [key: K, value: T[K]] }[keyof T];

export function loadConfig<T>(
    props: VisualisationConfig<T>,
    loader: (...args: LoaderArgs<T>) => ConfigEntry[],
) {
    const properties = props?.controls;
    const keys = Object.keys(properties ?? {}) as Array<keyof T>;

    if (!properties || keys.length === 0) {
        return null;
    }

    const config = keys.reduce((config, key) => {
        if (properties[key] !== undefined) {
            const data = loader(key, properties[key]);
            data.forEach(([newKey, newValue]) => {
                if (newValue !== undefined) {
                    config.add(new Pair(newKey, newValue));
                }
            });
        }
        return config;
    }, new YAMLMap());

    if (config.items.length === 0) {
        return null;
    }
    return entryWithSpace("config", config);
}

export function saveConfigObject<T extends object>(obj: T | undefined): T | undefined {
    if (!obj) {
        return undefined;
    }

    const validKeys = Object.keys(obj).filter((key) => (obj as Record<string, unknown>)[key] !== undefined);
    if (validKeys.length === 0) {
        return undefined;
    }
    return obj;
}
