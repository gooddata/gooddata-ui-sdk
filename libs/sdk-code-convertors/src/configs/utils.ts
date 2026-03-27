// (C) 2023-2026 GoodData Corporation

import { Pair, YAMLMap } from "yaml";

import { entryWithSpace } from "../utils/yamlUtils.js";

/** @public */
export type VisualisationConfig<T> = {
    controls?: T;
};

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

export function loadConfig<T>(
    props: VisualisationConfig<T>,
    loader: <K extends keyof T>(key: K, value: T[K]) => [string, any][],
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
                    addInPath(config, newKey.split("."), newValue);
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

function addInPath(base: YAMLMap, path: string[], newValue: any) {
    let current = base;
    path.forEach((key, index) => {
        if (index === path.length - 1) {
            current.add(new Pair(key, newValue));
        } else if (current.has(key)) {
            current = current.get(key) as YAMLMap;
        } else {
            const map = new YAMLMap();
            current.add(new Pair(key, map));
            current = map;
        }
    });
}
