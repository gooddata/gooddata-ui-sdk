// (C) 2019-2021 GoodData Corporation
import isArray from "lodash/isArray";
import flatMap from "lodash/flatMap";
import {
    IPlaceholder,
    ISinglePlaceholder,
    IComputedPlaceholder,
    IGroupPlaceholder,
    PlaceholderResolvedValue,
    PlaceholdersResolvedValues,
    PlaceholderValue,
    isSinglePlaceholder,
    isGroupPlaceholder,
    isComputedPlaceholder,
    isPlaceholder,
} from "./base";
import { PlaceholdersState } from "./context";
import invariant from "ts-invariant";

/**
 * @internal
 */
export function setPlaceholder<T extends IPlaceholder>(
    placeholder: T,
    value: PlaceholderValue<T> | undefined,
    state: PlaceholdersState,
): PlaceholdersState {
    if (isGroupPlaceholder(placeholder)) {
        return {
            ...state,
            groupPlaceholders: {
                ...state.groupPlaceholders,
                [placeholder.id]: {
                    ...placeholder,
                    value,
                },
            },
        };
    } else if (isSinglePlaceholder(placeholder)) {
        return {
            ...state,
            placeholders: {
                ...state.placeholders,
                [placeholder.id]: {
                    ...placeholder,
                    value,
                },
            },
        };
    }

    invariant(
        !isComputedPlaceholder(placeholder),
        "Cannot set value of the computed placeholder - computed placeholders are read-only.",
    );

    return state;
}

/**
 * @internal
 */
export function resolveSinglePlaceholderValue<T extends ISinglePlaceholder<any>>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderValue<T> | undefined {
    const placeholderValue = state.placeholders[placeholder.id]?.value ?? placeholder.defaultValue;
    return placeholderValue;
}

/**
 * @internal
 */
export function resolveGroupPlaceholderValue<T extends IGroupPlaceholder<any>>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderValue<T> | undefined {
    const placeholderValue = state.groupPlaceholders[placeholder.id]?.value ?? placeholder.defaultValue;
    return placeholderValue;
}

/**
 * @internal
 */
export function resolveFullGroupPlaceholderValue<T extends IGroupPlaceholder<any>>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderResolvedValue<T> | undefined {
    const placeholderValue = state.groupPlaceholders[placeholder.id]?.value ?? placeholder.defaultValue;
    if (!placeholderValue) {
        return placeholderValue;
    }

    return flatMap(placeholderValue, (v) =>
        isPlaceholder(v) ? resolveFullPlaceholderValue(v, state) : [v],
    ) as PlaceholderResolvedValue<T>;
}

/**
 *
 * @internal
 */
export function resolveComputedPlaceholderValue<TReturn, TPlaceholders extends IPlaceholder[]>(
    placeholder: IComputedPlaceholder<TReturn, TPlaceholders>,
    state: PlaceholdersState,
): TReturn | undefined {
    const values = placeholder.placeholders.map((p) =>
        resolveFullPlaceholderValue(p, state),
    ) as PlaceholdersResolvedValues<TPlaceholders>;
    const result = placeholder.computeValue(values);
    return result;
}

/**
 *
 * @internal
 */
export function resolvePlaceholderValue<T extends IPlaceholder>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderValue<T> | undefined {
    if (isSinglePlaceholder(placeholder)) {
        return resolveSinglePlaceholderValue(placeholder, state);
    } else if (isGroupPlaceholder(placeholder)) {
        return resolveGroupPlaceholderValue(placeholder, state);
    } else if (isComputedPlaceholder(placeholder)) {
        return resolveComputedPlaceholderValue<any, any>(placeholder, state);
    }
}

/**
 *
 * @internal
 */
export function resolveFullPlaceholderValue<T extends IPlaceholder>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderResolvedValue<T> | undefined {
    if (isSinglePlaceholder(placeholder)) {
        return resolveSinglePlaceholderValue(placeholder, state);
    } else if (isGroupPlaceholder(placeholder)) {
        return resolveFullGroupPlaceholderValue(placeholder, state);
    } else if (isComputedPlaceholder(placeholder)) {
        return resolveComputedPlaceholderValue<any, any>(placeholder, state);
    }
}

/**
 * Resolve value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @param values - any value(s) that can possibly contain placeholder(s)
 * @param state - current placeholders state
 * @returns value with all placeholders resolved
 * @internal
 */
export function resolveValueWithPlaceholders<T>(
    value: T,
    state: PlaceholdersState,
): T | PlaceholderResolvedValue<T> | PlaceholderResolvedValue<T>[] | undefined {
    if (isPlaceholder(value)) {
        return resolveFullPlaceholderValue(value, state);
    } else if (isArray(value)) {
        return value.reduce((acc, v) => {
            const resolvedValue = resolveValueWithPlaceholders(v, state);
            if (isGroupPlaceholder(v)) {
                return [...acc, ...resolvedValue];
            }

            return [...acc, resolvedValue];
        }, []);
    }

    return value;
}
