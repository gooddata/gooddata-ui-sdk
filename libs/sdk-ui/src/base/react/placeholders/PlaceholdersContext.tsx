// (C) 2019 GoodData Corporation
import { v4 as uuidv4 } from "uuid";
import React, { createContext, useCallback, useContext, useState } from "react";
import noop from "lodash/noop";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import {
    IAttributeGroupPlaceholder,
    IAttributePlaceholder,
    IComputedPlaceholder,
    IFilterGroupPlaceholder,
    IFilterPlaceholder,
    IMeasureGroupPlaceholder,
    IPlaceholderWithHook,
    isPlaceholder,
    PlaceholdersReturnTypes,
    UndefinedPlaceholderHandling,
    IMeasurePlaceholder,
    IPlaceholder,
    PlaceholderReturnType,
    ValueWithPlaceholdersReturnType,
    ValueWithPlaceholders,
    isGroupPlaceholder,
    ValuesWithPlaceholdersReturnTypes,
    PlaceholderComputation,
} from "./interfaces";
import isArray from "lodash/isArray";
import { IAttribute, IAttributeOrMeasure, IFilter } from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap";
import { UnexpectedSdkError } from "../../errors/GoodDataSdkError";

export type PlaceholdersState = Record<string, IPlaceholder>;

/**
 * @internal
 */
interface IPlaceholdersContextState {
    placeholders: PlaceholdersState;
    updatePlaceholders: (callback: (state: PlaceholdersState) => PlaceholdersState) => void;
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling;
}

/**
 * @internal
 */
const PlaceholdersContext = createContext<IPlaceholdersContextState>({
    undefinedPlaceholderHandling: "none",
    placeholders: {},
    updatePlaceholders: noop,
});
PlaceholdersContext.displayName = "PlaceholdersContext";

/**
 * @public
 */
export interface IPlaceholdersProviderProps {
    children: React.ReactNode;
    undefinedPlaceholderHandling?: UndefinedPlaceholderHandling;
    debug?: boolean;
}

/**
 *
 * @public
 */
export function PlaceholdersProvider(props: IPlaceholdersProviderProps) {
    const { undefinedPlaceholderHandling = "none", debug, children } = props;
    const [placeholders, updatePlaceholders] = useState<PlaceholdersState>({});
    if (debug) {
        console.debug("[DEBUG]: Current placeholders state:", placeholders);
    }

    return (
        <PlaceholdersContext.Provider
            value={{
                placeholders,
                updatePlaceholders,
                undefinedPlaceholderHandling,
            }}
        >
            {children}
        </PlaceholdersContext.Provider>
    );
}

/**
 * @internal
 */
function handleUndefinedPlaceholder(
    placeholderId: string,
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling,
) {
    if (undefinedPlaceholderHandling !== "none") {
        const message = `Trying to obtain undefined placeholder: ${placeholderId}`;
        if (undefinedPlaceholderHandling === "error") {
            throw new UnexpectedSdkError(message);
        } else if (undefinedPlaceholderHandling === "warning") {
            console.warn(message);
        }
    }
}

/**
 * Resolve placeholder value.
 * By default, it also resolves placeholder values that are part of a placeholder group.
 * It's possible to turn off this behavior by setting resolveGroupPlaceholders param to false.
 * (e.g. for updating placeholder group value, we want to keep nested placeholders unresolved)
 *
 * @param placeholder - placeholder to resolve
 * @param placeholdersState - current placeholders state
 * @param undefinedPlaceholderHandling - handling of the undefined placeholder value (warning | error | none)
 * @param resolveGroupPlaceholders - if the group contains a placeholder, either resolve it to a value or leave it as is
 *
 * @returns resolved placeholder value
 * @internal
 */
function resolvePlaceholderValue<TPlaceholder extends IPlaceholder>(
    placeholder: TPlaceholder,
    placeholdersState: PlaceholdersState,
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling,
    resolveGroupPlaceholders: boolean = true,
): PlaceholderReturnType<TPlaceholder> {
    const placeholderValue = placeholdersState[placeholder.id]?.value ?? placeholder.defaultValue;

    if (!placeholderValue) {
        handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
    }

    if (isGroupPlaceholder(placeholder) && isArray(placeholderValue) && resolveGroupPlaceholders) {
        const resolvedGroup = [...placeholderValue].map((groupValue) => {
            if (isPlaceholder(groupValue)) {
                return resolvePlaceholderValue(groupValue, placeholdersState, undefinedPlaceholderHandling);
            }
            return groupValue;
        });
        return resolvedGroup as PlaceholderReturnType<TPlaceholder>;
    }

    return placeholderValue as PlaceholderReturnType<TPlaceholder>;
}

/**
 * Hook to obtain/set placeholder value.
 * @public
 */
export function usePlaceholder<TPlaceholder extends IPlaceholder>(
    placeholder: TPlaceholder,
): [
    returnValue: PlaceholderReturnType<TPlaceholder> | undefined,
    setPlaceholderValue: (
        valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderReturnType<TPlaceholder> | undefined>,
    ) => void,
] {
    const { placeholders, undefinedPlaceholderHandling, updatePlaceholders } = useContext(
        PlaceholdersContext,
    );
    const resolvedPlaceholderValue = resolvePlaceholderValue(
        placeholder,
        placeholders,
        undefinedPlaceholderHandling,
    );
    const setPlaceholderValue = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholderReturnType<TPlaceholder> | undefined>) => {
            updatePlaceholders((state) => {
                const resoledPlaceholderValue = resolvePlaceholderValue(
                    placeholder,
                    state,
                    undefinedPlaceholderHandling,
                    false,
                );
                const updatedValue =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(resoledPlaceholderValue)
                        : valueOrUpdateCallback;

                if (!updatedValue && !placeholder.defaultValue) {
                    handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
                }

                const updatedPlaceholder: IPlaceholder = {
                    ...placeholder,
                    value: updatedValue,
                };

                return {
                    ...state,
                    [placeholder.id]: updatedPlaceholder,
                };
            });
        },
        [undefinedPlaceholderHandling],
    );

    return [resolvedPlaceholderValue, setPlaceholderValue];
}

/**
 * Hook to obtain/set multiple placeholder values at once - for atomic changes.
 * @public
 */
export function usePlaceholders<TPlaceholder extends IPlaceholder, TPlaceholders extends TPlaceholder[]>(
    placeholders: [...TPlaceholders],
): [
    returnValues: PlaceholdersReturnTypes<TPlaceholders>,
    setPlaceholderValues: (
        valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersReturnTypes<TPlaceholders>>,
    ) => void,
] {
    const { placeholders: placeholdersState, undefinedPlaceholderHandling, updatePlaceholders } = useContext(
        PlaceholdersContext,
    );
    const resolvedPlaceholderValues = placeholders.map((placeholder) =>
        resolvePlaceholderValue(placeholder, placeholdersState, undefinedPlaceholderHandling),
    ) as PlaceholdersReturnTypes<TPlaceholders>;

    const setPlaceholderValues = useCallback(
        (valueOrUpdateCallback: ValueOrUpdateCallback<PlaceholdersReturnTypes<TPlaceholders>>) => {
            updatePlaceholders((state) => {
                const resolvedPlaceholderValues = placeholders.map((placeholder) =>
                    resolvePlaceholderValue(placeholder, state, undefinedPlaceholderHandling, false),
                ) as PlaceholdersReturnTypes<TPlaceholders>;

                const updatedPlaceholderValues =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(resolvedPlaceholderValues)
                        : valueOrUpdateCallback;

                updatedPlaceholderValues.forEach((value, i) => {
                    const placeholder = placeholders[i];
                    if (!value && !placeholder.defaultValue) {
                        handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
                    }
                });

                return placeholders.reduce(
                    (placeholdersState, placeholder, i) => {
                        placeholdersState[placeholder.id] = {
                            ...placeholder,
                            value: updatedPlaceholderValues[i],
                        };

                        return placeholdersState;
                    },
                    { ...state },
                );
            });
        },
        [],
    );

    return [resolvedPlaceholderValues, setPlaceholderValues];
}

/**
 * Resolve value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @param values - any value(s) that can possibly contain placeholder(s)
 * @param placeholdersState - current placeholders state
 * @param undefinedPlaceholderHandling - handling of the undefined placeholder value (warning | error | none)
 * @returns value with all placeholders resolved
 */
function resolveValueWithPlaceholders<TValue extends ValueWithPlaceholders>(
    values: undefined | TValue,
    placeholdersState: PlaceholdersState,
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling,
): undefined | ValueWithPlaceholdersReturnType<TValue> {
    if (!values) {
        return values;
    } else if (isPlaceholder(values)) {
        return resolvePlaceholderValue(
            values,
            placeholdersState,
            undefinedPlaceholderHandling,
        ) as ValueWithPlaceholdersReturnType<TValue>;
    } else if (isArray(values)) {
        const resolved = flatMap(values, (val) => {
            if (isPlaceholder(val)) {
                return resolvePlaceholderValue(val, placeholdersState, undefinedPlaceholderHandling) ?? [];
            }

            return [val];
        });

        return resolved as ValueWithPlaceholdersReturnType<TValue>;
    }

    return values as ValueWithPlaceholdersReturnType<TValue>;
}

/**
 * Resolve value(s) that can possibly contain also placeholder(s) to actual value(s).
 * @public
 */
export function useResolveValueWithPlaceholders<TValue extends ValueWithPlaceholders>(
    value: TValue | undefined,
): undefined | ValueWithPlaceholdersReturnType<TValue> {
    const { placeholders, undefinedPlaceholderHandling } = useContext(PlaceholdersContext);
    const resolvedValues = resolveValueWithPlaceholders(value, placeholders, undefinedPlaceholderHandling);
    return resolvedValues;
}

/**
 * Resolve multiple value(s) that can possibly contain also placeholder(s) to actual value(s).
 *
 * @public
 */
export function useResolveValuesWithPlaceholders<
    TValue extends ValueWithPlaceholders,
    TValues extends TValue[]
>(values: [...TValues] | undefined): undefined | ValuesWithPlaceholdersReturnTypes<TValues> {
    const { placeholders, undefinedPlaceholderHandling } = useContext(PlaceholdersContext);
    const resolvedValues = values?.map((value) =>
        resolveValueWithPlaceholders(value, placeholders, undefinedPlaceholderHandling),
    );
    return resolvedValues as ValuesWithPlaceholdersReturnTypes<TValues>;
}

/**
 * @internal
 */
function appendHook<TPlaceholder extends IPlaceholder>(
    placeholder: TPlaceholder,
): IPlaceholderWithHook<TPlaceholder> {
    return {
        ...placeholder,
        use: () => usePlaceholder(placeholder),
    };
}

/**
 * @public
 */
export function newMeasureGroupPlaceholder(
    defaultMeasures: Array<IAttributeOrMeasure | IMeasurePlaceholder> = [],
    id?: string,
): IPlaceholderWithHook<IMeasureGroupPlaceholder> {
    const placeholder: IMeasureGroupPlaceholder = {
        type: "IMeasureGroupPlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultMeasures,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newMeasurePlaceholder(
    defaultMeasure?: IAttributeOrMeasure,
    id?: string,
): IPlaceholderWithHook<IMeasurePlaceholder> {
    const placeholder: IMeasurePlaceholder = {
        type: "IMeasurePlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultMeasure,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newAttributePlaceholder(
    defaultAttribute?: IAttribute,
    id?: string,
): IPlaceholderWithHook<IAttributePlaceholder> {
    const placeholder: IAttributePlaceholder = {
        type: "IAttributePlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultAttribute,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newAttributeGroupPlaceholder(
    defaultAttributes: Array<IAttribute | IAttributePlaceholder> = [],
    id?: string,
): IPlaceholderWithHook<IAttributeGroupPlaceholder> {
    const placeholder: IAttributeGroupPlaceholder = {
        type: "IAttributeGroupPlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultAttributes,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newFilterPlaceholder(
    defaultFilter?: IFilter,
    id?: string,
): IPlaceholderWithHook<IFilterPlaceholder> {
    const placeholder: IFilterPlaceholder = {
        type: "IFilterPlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultFilter,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newFilterGroupPlaceholder(
    defaultFilters: IFilter[] = [],
    id?: string,
): IPlaceholderWithHook<IFilterGroupPlaceholder> {
    const placeholder: IFilterGroupPlaceholder = {
        type: "IFilterGroupPlaceholder",
        id: id ?? uuidv4(),
        defaultValue: defaultFilters,
    };

    return appendHook(placeholder);
}

/**
 * @public
 */
export function newComputedPlaceholder<
    TPlaceholders extends IPlaceholder[],
    TReturn extends IPlaceholder,
    TComputation extends PlaceholderComputation<TPlaceholders, TReturn>
>(
    placeholders: [...placeholders: TPlaceholders],
    computedPlaceholder: TComputation,
): IComputedPlaceholder<TPlaceholders, TReturn, TComputation> {
    return {
        type: "IComputedPlaceholder",
        placeholders,
        computedPlaceholder,
    };
}
