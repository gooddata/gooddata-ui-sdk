// (C) 2020-2021 GoodData Corporation
import qs from "qs";

/**
 * Stringifies an object to query string. Makes sure arrays are serialized as comma separated, otherwise bear backend does not understand it.
 * @param obj - object to stringify
 * @param options - additional qs.stringify options
 */
export const stringify = (obj: object, options?: qs.IStringifyOptions): string =>
    qs.stringify(obj, { ...options, arrayFormat: "comma" });
