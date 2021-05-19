// (C) 2019-2021 GoodData Corporation
import { useCallback } from "react";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IPlaceholder,
    IComposedPlaceholder,
    PlaceholderValue,
    PlaceholdersValues,
    PlaceholderResolvedValue,
    PlaceholdersResolvedValues,
} from "./base";
import { usePlaceholdersContext, PlaceholdersState } from "./context";
import {
    setPlaceholder,
    resolvePlaceholderValue,
    resolveComposedPlaceholderValue,
    resolveValueWithPlaceholders,
} from "./resolve";

/**
 * React hook to obtain/set placeholder value.
 * See {@link IPlaceholder}.
 * @public
 */
export function usePlaceholder<T extends IPlaceholder<any>>(
    placeholder: T,
): [
    returnValue: PlaceholderValue<T> | undefined,
    setPlaceholderValue: (
        valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>,
    ) => void,
] {
    const { state, updateState } = usePlaceholdersContext();
    const resolvedPlaceholderValue = resolvePlaceholderValue(placeholder, state);

    const setPlaceholderValue = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => {
            updateState((s): PlaceholdersState => {
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
 * This is useful to perform placeholders atomic change.
 * See {@link IPlaceholder}.
 * @public
 */
export function usePlaceholders<T extends IPlaceholder<any>[]>(
    placeholders: [...T],
): [
    returnValues: PlaceholdersValues<T>,
    setPlaceholderValues: (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersValues<T>>) => void,
] {
    const { state, updateState } = usePlaceholdersContext();

    const resolvedPlaceholderValues = placeholders.map((placeholder) =>
        resolvePlaceholderValue(placeholder, state),
    ) as PlaceholdersValues<T>;

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

                const updatedState = placeholders.reduce((acc, placeholder, i): PlaceholdersState => {
                    return setPlaceholder(placeholder, updatedValues[i], acc);
                }, s);

                return updatedState;
            });
        },
        [],
    );

    return [resolvedPlaceholderValues, setPlaceholderValues];
}

/**
 * React hook to obtain composed placeholder value.
 * Optionally provide custom context for the composed placeholders resolution.
 * See {@link IComposedPlaceholder}.
 *
 * @public
 */
export function useComposedPlaceholder<
    TContext,
    TPlaceholder extends IComposedPlaceholder<any, any, TContext>,
>(placeholder: TPlaceholder, resolutionContext?: TContext): PlaceholderResolvedValue<TPlaceholder> {
    const { state } = usePlaceholdersContext();
    const resolvedPlaceholderValue = resolveComposedPlaceholderValue(
        placeholder,
        state,
        resolutionContext,
    ) as PlaceholderResolvedValue<TPlaceholder>;

    return resolvedPlaceholderValue;
}

/**
 * React hook that resolves any value(s) that can possibly contain also placeholder(s) to actual value(s).
 * Optionally provide custom context for the composed placeholders resolution.
 *
 * @public
 */
export function useResolveValueWithPlaceholders<T, C>(
    value: T,
    resolutionContext?: C,
): PlaceholderResolvedValue<T> {
    const { state } = usePlaceholdersContext();
    const resolvedValue = resolveValueWithPlaceholders(value, state, resolutionContext);
    return resolvedValue;
}

/**
 * React hook that resolves multiple value(s) that can possibly contain also placeholder(s) to actual value(s).
 * Optionally provide custom context for the composed placeholders resolution.
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
    );
    return resolvedValues as PlaceholdersResolvedValues<T>;
}
