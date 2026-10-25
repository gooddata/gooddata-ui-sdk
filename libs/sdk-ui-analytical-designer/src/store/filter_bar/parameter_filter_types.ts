// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IParameterDefinition, type ObjRef, type ParameterValue } from "@gooddata/sdk-model";

/**
 * Parameter filter state. Represents a per-insight override of a workspace parameter's value.
 * When the value equals the definition's default, the override MUST NOT be persisted so that
 * the insight stays in sync with future default changes.
 */
export interface IParameterFilter {
    readonly type: "parameter";
    readonly localIdentifier: string;
    readonly parameterRef: ObjRef;
    readonly name: string;
    readonly value: ParameterValue;
    readonly definition: IParameterDefinition;
}

export function isParameterFilter(item: unknown): item is IParameterFilter {
    return !isEmpty(item) && (item as { type?: unknown }).type === "parameter";
}

/**
 * Returns true when a parameter filter's current value differs from its workspace default.
 * Shared predicate for smart persistence and "are any overrides applied" UI checks.
 */
export function isParameterOverridden(filter: IParameterFilter): boolean {
    return filter.value !== filter.definition.defaultValue;
}
