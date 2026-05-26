// (C) 2024-2026 GoodData Corporation

import { type ObjRef, objRefToString } from "@gooddata/sdk-model";

export const generateFilterLocalIdentifier = (ref: ObjRef, index: number): string => {
    return `${objRefToString(ref)}_${index}_attributeFilter`;
};

/**
 * Generates a stable local identifier for a dashboard measure value filter from the target
 * metric's `ObjRef` and a positional index. Used both by the add-MVF reducer (as a fallback
 * when callers omit `localIdentifier`) and by the postMessage embedding handler so the caller
 * can pre-compute the id and chain follow-up commands in the same dispatch batch.
 *
 * @alpha
 */
export const generateMeasureValueFilterLocalIdentifier = (ref: ObjRef, index: number): string => {
    return `${objRefToString(ref)}_${index}_measureValueFilter`;
};
