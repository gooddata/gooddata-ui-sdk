// (C) 2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type IdentifierRef, isIdentifierRef } from "../objRef/index.js";

/**
 * Dashboard parameter mode — mirrors filter mode triple.
 *
 * @alpha
 */
export type DashboardParameterMode = "active" | "readonly" | "hidden";

/**
 * Represent the values of {@link DashboardParameterMode}.
 *
 * @internal
 */
export const DashboardParameterModeValues: Record<
    Uppercase<DashboardParameterMode>,
    DashboardParameterMode
> = {
    ACTIVE: "active",
    READONLY: "readonly",
    HIDDEN: "hidden",
};

/**
 * Dashboard-level parameter override entry.
 *
 * @remarks
 * `value`, `label`, and `mode` are smart-persisted: each is omitted when equal to its default
 * (workspace default for `value`, parameter title for `label`, `"active"` for `mode`).
 *
 * @alpha
 */
export interface IDashboardParameter {
    /**
     * Reference to the workspace parameter metadata object.
     */
    readonly ref: IdentifierRef;

    /**
     * Visibility/interactivity mode. Absent value defaults to `"active"`.
     */
    readonly mode: DashboardParameterMode;

    /**
     * Type tag; only `"NUMBER"` is supported in this slice.
     */
    readonly parameterType: "NUMBER";

    /**
     * Dashboard's pinned override; absent when equal to the workspace default.
     */
    readonly value?: number;

    /**
     * Author-renamed label; absent when equal to the parameter's title.
     */
    readonly label?: string;
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardParameter}.
 *
 * @param obj - object to test
 * @alpha
 */
export function isDashboardParameter(obj: unknown): obj is IDashboardParameter {
    if (isEmpty(obj) || typeof obj !== "object") {
        return false;
    }
    const candidate = obj as IDashboardParameter;
    return candidate.parameterType === "NUMBER" && isIdentifierRef(candidate.ref);
}
