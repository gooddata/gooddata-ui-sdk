// (C) 2025 GoodData Corporation

import React from "react";

/**
 * Deep object diff with pluggable equality function.
 * Recursively compares nested objects and arrays to detect changes at any level.
 *
 * @internal
 */
export function getObjectDiff(
    prevObj: Record<string, any> | null,
    currObj: Record<string, any>,
    equalityFn: (A: any, B: any) => boolean = (A, B) => A === B,
) {
    const currKeys = Object.keys(currObj);
    const prevKeys = prevObj ? Object.keys(prevObj) : [];

    const newKeys = currKeys.filter((key) => !prevKeys.includes(key));
    const removedKeys = prevKeys.filter((key) => !currKeys.includes(key));
    const changedKeys: string[] = [];
    const deepChanges: Record<string, any> = {};

    // Check for changed values and deep changes
    currKeys.forEach((key) => {
        if (prevKeys.includes(key)) {
            const prevValue = prevObj?.[key];
            const currValue = currObj[key];

            if (!equalityFn(prevValue, currValue)) {
                // Check if both values are objects for deep comparison
                if (isObject(prevValue) && isObject(currValue)) {
                    const deepDiff = getObjectDiff(prevValue, currValue, equalityFn);
                    if (deepDiff.hasChanged) {
                        deepChanges[key] = deepDiff;
                        changedKeys.push(key);
                    }
                } else {
                    changedKeys.push(key);
                }
            }
        }
    });

    const ret = {
        ...(newKeys.length > 0 && { NEW: newKeys }),
        ...(removedKeys.length > 0 && { REMOVED: removedKeys }),
        ...(changedKeys.length > 0 && { CHANGED: changedKeys }),
        ...(Object.keys(deepChanges).length > 0 && { DEEP_CHANGES: deepChanges }),
    };

    const hasChanged = Object.keys(ret).length > 0;

    return {
        ...ret,
        hasChanged,
    };
}

/**
 * Helper function to check if a value is a plain object (not array, null, or primitive)
 */
function isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Useful utility to find out which dependencies in a hook have changed.
 *
 * @internal
 */
export function useObjectDiff(obj: Record<string, any>, equalityFn?: (A: any, B: any) => boolean) {
    const prevObjRef = React.useRef<Record<string, any> | null>(null);

    // Calculate diff between previous and current object
    const diff = getObjectDiff(prevObjRef.current, obj, equalityFn);

    // Update the ref for next render
    React.useEffect(() => {
        prevObjRef.current = obj;
    });

    return diff;
}
