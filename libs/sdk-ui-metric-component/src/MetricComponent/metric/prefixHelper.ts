// (C) 2023-2026 GoodData Corporation

import { type IMeasureDef } from "./metricHelpers.js";

export function hasDefinedPrefix(prefix: string | undefined, id: string): boolean {
    return Boolean(prefix && id.match(new RegExp(`^(${escPrefix(prefix)})`)));
}

export function removePrefixFromId(prefix: string | undefined, id: string): string {
    if (prefix) {
        return replacePrefixInId(prefix, id, "");
    }
    return id;
}

export function replacePrefixInId(prefix: string, id: string, replace: string): string {
    return id.replace(new RegExp(`^(${escPrefix(prefix)})`), replace);
}

export function addPrefixToId(prefix: string | undefined, id: string): string {
    if (prefix) {
        return prefix + id;
    }
    return id;
}

export function addPrefixToMeasure(measure: IMeasureDef, prefix: string | undefined): IMeasureDef {
    //no prefix defined, behave as normal
    if (!prefix) {
        return { ...measure };
    }
    //measure has defined prefix (not new one)
    if (measure.id) {
        //id contains defined prefix, remove it and save into object
        if (hasDefinedPrefix(prefix, measure.id)) {
            return {
                ...measure,
                id: removePrefixFromId(prefix, measure.id),
                prefix,
            };
        }
        //id not contain defined prefix, already created measure, do not use prefix
        return { ...measure };
    }
    //new measure without id
    return { ...measure, prefix };
}

function escPrefix(prefix: string) {
    return prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
