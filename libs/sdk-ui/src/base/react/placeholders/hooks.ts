// (C) 2019-2021 GoodData Corporation
import { useCallback } from "react";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IPlaceholder,
    PlaceholderValue,
    PlaceholderResolvedValue,
    PlaceholdersResolvedValues,
    AnyValueWithPlaceholdersResolvedValue,
    AnyValuesWithPlaceholdersResolvedValues,
    PlaceholdersValues,
} from "./base";
import { usePlaceholdersContext, PlaceholdersState } from "./context";
import {
    resolveFullPlaceholderValue,
    resolvePlaceholderValue,
    resolveValueWithPlaceholders,
    setPlaceholder,
} from "./resolve";

/**
 * React hook to obtain/set placeholder value.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function usePlaceholder<T extends IPlaceholder>(
    placeholder: T,
): [
    returnValue: PlaceholderResolvedValue<T>,
    setPlaceholderValue: (
        valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>,
    ) => void,
] {
    const { state, updateState } = usePlaceholdersContext();
    const resolvedPlaceholderValue = resolveFullPlaceholderValue(
        placeholder,
        state,
    ) as PlaceholderResolvedValue<T>;

    const setPlaceholderValue = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderValue<T> | undefined>) => {
            updateState(
                (s): PlaceholdersState => {
                    const resoledPlaceholderValue = resolvePlaceholderValue(
                        placeholder,
                        s,
                    ) as PlaceholderValue<T>;

                    const updatedValue =
                        valueOrUpdateCallback instanceof Function
                            ? valueOrUpdateCallback(resoledPlaceholderValue)
                            : valueOrUpdateCallback;

                    return setPlaceholder(placeholder, updatedValue, s);
                },
            );
        },
        [],
    );

    return [resolvedPlaceholderValue, setPlaceholderValue];
}

/**
 * React hook to obtain/set multiple placeholder values at once - for atomic changes.
 * See {@link IPlaceholder} to read more details about placeholders.
 *
 * @public
 */
export function usePlaceholders<T extends IPlaceholder[]>(
    placeholders: [...T],
): [
    returnValues: PlaceholdersResolvedValues<T>,
    setPlaceholderValues: (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersValues<T>>) => void,
] {
    const { state, updateState } = usePlaceholdersContext();

    const resolvedPlaceholderValues = placeholders.map((placeholder) =>
        resolveFullPlaceholderValue(placeholder, state),
    ) as PlaceholdersResolvedValues<T>;

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
 * React hook that resolves any value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @public
 */
export function useResolveValueWithPlaceholders<T>(value: T): AnyValueWithPlaceholdersResolvedValue<T> {
    const { state } = usePlaceholdersContext();
    const resolvedValue = resolveValueWithPlaceholders<T>(value, state);
    return resolvedValue as AnyValueWithPlaceholdersResolvedValue<T>;
}

/**
 * React hook that resolves multiple value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @public
 */
export function useResolveValuesWithPlaceholders<T extends any[]>(
    values: [...T],
): AnyValuesWithPlaceholdersResolvedValues<T> {
    const { state } = usePlaceholdersContext();
    const resolvedValues = values?.map((value) => resolveValueWithPlaceholders(value, state));
    return resolvedValues as AnyValuesWithPlaceholdersResolvedValues<T>;
}
