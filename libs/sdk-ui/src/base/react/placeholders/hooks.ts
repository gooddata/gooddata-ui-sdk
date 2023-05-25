// (C) 2019-2022 GoodData Corporation
import { useCallback, useMemo, useRef } from "react";
import stableStringify from "json-stable-stringify";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IPlaceholder,
    IComposedPlaceholder,
    PlaceholderValue,
    PlaceholdersValues,
    PlaceholderResolvedValue,
    PlaceholdersResolvedValues,
    isPlaceholder,
} from "./base.js";
import { usePlaceholdersContext, PlaceholdersState } from "./context.js";
import { invariant } from "ts-invariant";
import {
    setPlaceholder,
    resolvePlaceholderValue,
    resolveComposedPlaceholderValue,
    resolveValueWithPlaceholders,
} from "./resolve.js";

/**
 * React hook to obtain/set placeholder value.
 *
 * @remarks
 * See {@link IPlaceholder}.
 *
 * Note: When placeholder is not provided, setting its value will result in the error.
 *
 * @public
 */
export function usePlaceholder<T extends IPlaceholder<any>>(
    placeholder?: T,
): [
    PlaceholderValue<T> | undefined,
    (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => void,
] {
    const { state, updateState } = usePlaceholdersContext();
    const resolvedPlaceholderValue = isPlaceholder(placeholder)
        ? resolvePlaceholderValue(placeholder, state)
        : undefined;

    const setPlaceholderValue = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => {
            updateState((s): PlaceholdersState => {
                invariant(
                    isPlaceholder(placeholder),
                    "usePlaceholder: Cannot set value of the placeholder - placeholder was not provided.",
                );

                const resoledPlaceholderValue = resolvePlaceholderValue(
                    placeholder,
                    s,
                ) as PlaceholderValue<T>;

                const updatedValue =
                    valueOrUpdateCallback instanceof Function
                        ? valueOrUpdateCallback(resoledPlaceholderValue)
                        : valueOrUpdateCallback;

                return setPlaceholder(placeholder, updatedValue, s);
            });
        },
        [],
    );

    return [resolvedPlaceholderValue, setPlaceholderValue];
}

/**
 * React hook to obtain/set multiple placeholder values at once.
 *
 * @remarks
 * This is useful to perform placeholders atomic change.
 * See {@link IPlaceholder}.
 * @public
 */
export function usePlaceholders<T extends IPlaceholder<any>[]>(
    placeholders: [...T],
): [PlaceholdersValues<T>, (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersValues<T>>) => void] {
    const { state, updateState } = usePlaceholdersContext();

    const resolvedPlaceholderValues = placeholders.map((placeholder) =>
        resolvePlaceholderValue(placeholder, state),
    ) as PlaceholdersValues<T>;

    const memoizedResolvedValues = useMultiValueMemoStringify(resolvedPlaceholderValues);

    const setPlaceholderValues = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersValues<T>>) => {
            updateState((s) => {
                const resolvedValues = placeholders.map((placeholder) =>
                    resolvePlaceholderValue(placeholder, s),
                ) as PlaceholdersValues<T>;

                const updatedValues =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(resolvedValues)
                        : valueOrUpdateCallback;

                return placeholders.reduce((acc, placeholder, i): PlaceholdersState => {
                    return setPlaceholder(placeholder, updatedValues[i], acc);
                }, s);
            });
        },
        [],
    );

    return [memoizedResolvedValues, setPlaceholderValues];
}

/**
 * React hook to obtain composed placeholder value.
 *
 * @remarks
 * You can provide custom context for the composed placeholders resolution.
 * See {@link IComposedPlaceholder}.
 *
 * @public
 */
export function useComposedPlaceholder<
    TContext,
    TPlaceholder extends IComposedPlaceholder<any, any, TContext>,
>(placeholder: TPlaceholder, resolutionContext?: TContext): PlaceholderResolvedValue<TPlaceholder> {
    const { state } = usePlaceholdersContext();
    const resolvedValue = resolveComposedPlaceholderValue(
        placeholder,
        state,
        resolutionContext,
    ) as PlaceholderResolvedValue<TPlaceholder>;
    return useMemoStringify(resolvedValue);
}

/**
 * React hook that resolves any value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @remarks
 * You can provide custom context for the composed placeholders resolution.
 *
 * @public
 */
export function useResolveValueWithPlaceholders<T, C>(
    value: T,
    resolutionContext?: C,
): PlaceholderResolvedValue<T> {
    const { state } = usePlaceholdersContext();
    const resolvedValue = resolveValueWithPlaceholders(value, state, resolutionContext);
    return useMemoStringify(resolvedValue);
}

/**
 * React hook that resolves multiple value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @remarks
 * You can provide custom context for the composed placeholders resolution.
 *
 * @public
 */
export function useResolveValuesWithPlaceholders<T extends any[], C>(
    values: [...T],
    resolutionContext?: C,
): PlaceholdersResolvedValues<T> {
    const { state } = usePlaceholdersContext();
    const resolvedValues = values?.map((value) =>
        resolveValueWithPlaceholders(value, state, resolutionContext),
    ) as PlaceholdersResolvedValues<T>;
    return useMultiValueMemoStringify(resolvedValues);
}

/**
 * Memoize value by its stringified value, to avoid new reference on each render.
 *
 * @param value - value to memoize
 * @returns - memoized value
 * @internal
 */
export function useMemoStringify<T>(value: T): T {
    return useMemo(() => {
        return value;
    }, [stableStringify(value)]);
}

/**
 * Memoize multiple values by their stringified value, to avoid new reference on each render.
 *
 * @param values - values to memoize
 * @returns - memoized values
 * @internal
 */
export function useMultiValueMemoStringify<T extends any[]>(values: T): T {
    const prevValues = useRef(
        values?.map((v) => ({
            hash: stableStringify(v),
            value: v,
        })) ?? [],
    );

    return useMemo(() => {
        return values?.map((val, idx) => {
            const hash = stableStringify(val);
            if (hash === prevValues.current[idx].hash) {
                return prevValues.current[idx].value;
            }

            prevValues.current[idx] = {
                hash,
                value: val,
            };

            return val;
        }) as T;
    }, [stableStringify(values)]);
}
