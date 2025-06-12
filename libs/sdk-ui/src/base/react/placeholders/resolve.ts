// (C) 2019-2022 GoodData Corporation
import isArray from "lodash/isArray.js";
import {
    IPlaceholder,
    PlaceholderValue,
    isPlaceholder,
    isAnyPlaceholder,
    PlaceholderResolvedValue,
    IComposedPlaceholder,
    PlaceholdersResolvedValues,
    isComposedPlaceholder,
} from "./base.js";
import { PlaceholdersState } from "./context.js";

/**
 * Set placeholder value to the context.
 * @internal
 */
export function setPlaceholder<T extends IPlaceholder<any>>(
    placeholder: T,
    value: PlaceholderValue<T> | undefined,
    state: PlaceholdersState,
): PlaceholdersState {
    if (placeholder.validate) {
        placeholder.validate(value);
    }
    if (isPlaceholder(placeholder)) {
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

    return state;
}

/**
 * Resolve placeholder value from the context, or fallback to default value.
 * @internal
 */
export function resolvePlaceholderValue<T extends IPlaceholder<any>>(
    placeholder: T,
    state: PlaceholdersState,
): PlaceholderValue<T> | undefined {
    const placeholderValue = state.placeholders[placeholder.id]?.value ?? placeholder.defaultValue;
    if (placeholder.validate) {
        placeholder.validate(placeholderValue);
    }
    return placeholderValue;
}

/**
 * Resolve composed placeholder value with provided resolution context.
 * @internal
 */
export function resolveComposedPlaceholderValue<TReturn, TValue extends any[], TContext>(
    placeholder: IComposedPlaceholder<TReturn, TValue, TContext>,
    state: PlaceholdersState,
    resolutionContext?: TContext,
): TReturn | undefined {
    const values = placeholder.placeholders.map((p) =>
        resolveValueWithPlaceholders(p, state, resolutionContext),
    ) as PlaceholdersResolvedValues<TValue>;
    return placeholder.computeValue(values, resolutionContext!);
}

/**
 * Resolve value(s) that can possibly contain also placeholder(s) to actual value(s).
 * Arrays with nested placeholders that are holding arrays are flattened.
 * You can specify custom resolution context for the composed placeholders.
 *
 * This is method you want to use to replace placeholders in any value with actual placeholder values.
 * It does not support object traversing as most of the visualizations interfaces
 * are consuming only arrays or single values.
 *
 * @internal
 */
export function resolveValueWithPlaceholders<T, C>(
    value: T,
    state: PlaceholdersState,
    resolutionContext?: C,
): PlaceholderResolvedValue<T> {
    if (isPlaceholder(value)) {
        return resolvePlaceholderValue(value, state) as PlaceholderResolvedValue<T>;
    } else if (isComposedPlaceholder(value)) {
        return resolveComposedPlaceholderValue(
            value,
            state,
            resolutionContext,
        ) as PlaceholderResolvedValue<T>;
    } else if (isArray(value)) {
        return value.reduce((acc, v) => {
            const resolvedValue = resolveValueWithPlaceholders(v, state, resolutionContext);
            if (isAnyPlaceholder(v)) {
                // Omit placeholder values that are not set
                if (!resolvedValue) {
                    return acc;
                } else if (isArray(resolvedValue)) {
                    acc.push(...resolvedValue.filter((v) => typeof v !== "undefined"));
                    return acc;
                }
            }

            acc.push(resolvedValue);
            return acc;
        }, []);
    }

    return value as PlaceholderResolvedValue<T>;
}
