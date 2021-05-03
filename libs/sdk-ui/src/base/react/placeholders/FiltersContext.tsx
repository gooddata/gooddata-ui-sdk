// (C) 2019 GoodData Corporation
import React, { createContext, useCallback, useContext, useState } from "react";
import { IFilter } from "@gooddata/sdk-model";
import noop from "lodash/noop";
import flatMap from "lodash/flatMap";
import { UnexpectedSdkError } from "../../errors/GoodDataSdkError";
import isArray from "lodash/isArray";
import {
    UndefinedPlaceholderHandling,
    IFilterPlaceholder,
    IFilterGroupPlaceholder,
    isFilterPlaceholder,
    isFilterGroupPlaceholder,
} from "./interfaces";

/**
 * @internal
 */
export interface IFiltersContextState {
    undefinedPlaceholderHandling: UndefinedPlaceholderHandling;
    filterPlaceholders: Record<string, IFilterPlaceholder>;
    filterGroupPlaceholders: Record<string, IFilterGroupPlaceholder>;
    setFilterPlaceholders: React.Dispatch<React.SetStateAction<Record<string, IFilterPlaceholder>>>;
    setFilterGroupPlaceholders: React.Dispatch<React.SetStateAction<Record<string, IFilterGroupPlaceholder>>>;
}

/**
 * @internal
 */
const FiltersContext = createContext<IFiltersContextState>({
    undefinedPlaceholderHandling: "none",
    filterPlaceholders: {},
    filterGroupPlaceholders: {},
    setFilterPlaceholders: noop,
    setFilterGroupPlaceholders: noop,
});
FiltersContext.displayName = "FiltersContext";

/**
 * @public
 */
export interface IFiltersProviderProps {
    undefinedPlaceholderHandling?: UndefinedPlaceholderHandling;
}

/**
 * @internal
 */
function resolveFilterPlaceholderValue(
    placeholder: IFilterPlaceholder,
    currentPlaceholders: Record<string, IFilterPlaceholder>,
    undefinedMeasureHandling: UndefinedPlaceholderHandling,
): IFilter | undefined {
    const filter = currentPlaceholders[placeholder.id]?.filter ?? placeholder.filter;
    if (!filter) {
        handleUndefinedPlaceholder(placeholder.id, undefinedMeasureHandling);
    }

    return filter;
}

/**
 * @internal
 */
function resolveFilterGroupPlaceholderValue(
    placeholderGroup: IFilterGroupPlaceholder,
    currentGroupPlaceholders: Record<string, IFilterGroupPlaceholder>,
    currentPlaceholders: Record<string, IFilterPlaceholder>,
    undefinedMeasureHandling: UndefinedPlaceholderHandling,
): Array<IFilter> {
    const filters = currentGroupPlaceholders[placeholderGroup.id]?.filters ?? placeholderGroup.filters;
    return flatMap(filters, (f) => {
        if (isFilterPlaceholder(f)) {
            const filter = resolveFilterPlaceholderValue(f, currentPlaceholders, undefinedMeasureHandling);
            return filter ?? [];
        }

        return f;
    });
}

/**
 * @public
 */
export const FiltersProvider: React.FC<IFiltersProviderProps> = (props) => {
    const { undefinedPlaceholderHandling = "none", children } = props;
    const [{ filterPlaceholders, filterGroupPlaceholders }, setFiltersContext] = useState<
        Omit<
            IFiltersContextState,
            | "setFiltersContext"
            | "setFilterPlaceholders"
            | "setFilterGroupPlaceholders"
            | "undefinedPlaceholderHandling"
        >
    >({
        filterPlaceholders: {},
        filterGroupPlaceholders: {},
    });

    const setFilterPlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IFilterPlaceholder>
                | ((placeholders: Record<string, IFilterPlaceholder>) => Record<string, IFilterPlaceholder>),
        ) => {
            setFiltersContext((context) => {
                const updatedPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.filterPlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    filterPlaceholders: updatedPlaceholders,
                };
            });
        },
        [],
    );

    const setFilterGroupPlaceholders = useCallback(
        (
            valueOrUpdateCallback:
                | Record<string, IFilterGroupPlaceholder>
                | ((
                      placeholders: Record<string, IFilterGroupPlaceholder>,
                  ) => Record<string, IFilterGroupPlaceholder>),
        ) => {
            setFiltersContext((context) => {
                const updatedGroupPlaceholders =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(context.filterGroupPlaceholders)
                        : valueOrUpdateCallback;

                return {
                    ...context,
                    filterGroupPlaceholders: updatedGroupPlaceholders,
                };
            });
        },
        [],
    );

    return (
        <FiltersContext.Provider
            value={{
                filterPlaceholders,
                undefinedPlaceholderHandling,
                setFilterPlaceholders,
                filterGroupPlaceholders,
                setFilterGroupPlaceholders,
            }}
        >
            {children}
        </FiltersContext.Provider>
    );
};

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
 * @public
 */
export function useResolveFilterPlaceholders(values: undefined): undefined;
/**
 * @public
 */
export function useResolveFilterPlaceholders(values: IFilter): IFilter;
/**
 * @public
 */
export function useResolveFilterPlaceholders(values: IFilterPlaceholder): IFilter | undefined;
/**
 * @public
 */
export function useResolveFilterPlaceholders(values: IFilter | IFilterPlaceholder): IFilter | undefined;
/**
 * @public
 */
export function useResolveFilterPlaceholders(values: IFilterGroupPlaceholder): Array<IFilter>;
/**
 * @public
 */
export function useResolveFilterPlaceholders(
    values: IFilterGroupPlaceholder | Array<IFilter | IFilterPlaceholder | IFilterGroupPlaceholder>,
): Array<IFilter>;
/**
 * @public
 */
export function useResolveFilterPlaceholders(
    values: Array<IFilter | IFilterPlaceholder | IFilterGroupPlaceholder>,
): Array<IFilter>;
/**
 * @public
 */
export function useResolveFilterPlaceholders(
    values:
        | Array<IFilter | IFilterPlaceholder | IFilterGroupPlaceholder>
        | IFilter
        | IFilterPlaceholder
        | IFilterGroupPlaceholder
        | undefined,
): Array<IFilter> | IFilter | undefined;
/**
 * @public
 */
export function useResolveFilterPlaceholders(
    values:
        | Array<IFilter | IFilterPlaceholder | IFilterGroupPlaceholder>
        | IFilter
        | IFilterPlaceholder
        | IFilterGroupPlaceholder
        | undefined,
): Array<IFilter> | IFilter | undefined {
    const { filterPlaceholders, filterGroupPlaceholders, undefinedPlaceholderHandling } = useContext(
        FiltersContext,
    );

    if (isArray(values)) {
        return flatMap(values, (v) => {
            if (isFilterPlaceholder(v)) {
                const filter = resolveFilterPlaceholderValue(
                    v,
                    filterPlaceholders,
                    undefinedPlaceholderHandling,
                );
                return filter ?? [];
            } else if (isFilterGroupPlaceholder(v)) {
                const filters = resolveFilterGroupPlaceholderValue(
                    v,
                    filterGroupPlaceholders,
                    filterPlaceholders,
                    undefinedPlaceholderHandling,
                );
                return filters;
            }
            return v ?? [];
        });
    } else if (isFilterPlaceholder(values)) {
        const filter = resolveFilterPlaceholderValue(
            values,
            filterPlaceholders,
            undefinedPlaceholderHandling,
        );
        return filter;
    } else if (isFilterGroupPlaceholder(values)) {
        const filters = resolveFilterGroupPlaceholderValue(
            values,
            filterGroupPlaceholders,
            filterPlaceholders,
            undefinedPlaceholderHandling,
        );
        return filters;
    }

    return values;
}

/**
 * @public
 */
export function useFilterPlaceholder(
    placeholder: IFilterPlaceholder,
): [
    filter: IFilter | undefined,
    setFilterPlaceholder: (
        valueOrUpdateCallback:
            | IFilter
            | ((attrOrMeasure: IFilter | undefined) => IFilter | undefined)
            | undefined,
    ) => void,
] {
    const { filterPlaceholders, setFilterPlaceholders, undefinedPlaceholderHandling } = useContext(
        FiltersContext,
    );
    const filter = resolveFilterPlaceholderValue(
        placeholder,
        filterPlaceholders,
        undefinedPlaceholderHandling,
    );

    const setFilterPlaceholder = useCallback(
        (
            valueOrUpdateCallback:
                | IFilter
                | ((attrOrMeasure: IFilter | undefined) => IFilter | undefined)
                | undefined,
        ) => {
            setFilterPlaceholders((mp) => {
                const filter = resolveFilterPlaceholderValue(placeholder, mp, undefinedPlaceholderHandling);
                const updatedFilter =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(filter)
                        : valueOrUpdateCallback;

                if (!updatedFilter) {
                    handleUndefinedPlaceholder(placeholder.id, undefinedPlaceholderHandling);
                }

                return {
                    ...mp,
                    [placeholder.id]: {
                        ...placeholder,
                        filter: updatedFilter,
                    },
                };
            });
        },
        [],
    );

    return [filter, setFilterPlaceholder];
}

/**
 * @public
 */
export function useFilterPlaceholderGroup(
    placeholderGroup: IFilterGroupPlaceholder,
): [
    filters: IFilter[],
    setFilterGroupPlaceholder: (
        valueOrUpdateCallback:
            | Array<IFilter | IFilterPlaceholder>
            | ((attrOrMeasure: Array<IFilter | IFilterPlaceholder>) => Array<IFilter | IFilterPlaceholder>),
    ) => void,
] {
    const {
        filterGroupPlaceholders,
        setFilterGroupPlaceholders,
        filterPlaceholders,
        undefinedPlaceholderHandling,
    } = useContext(FiltersContext);

    const filters = resolveFilterGroupPlaceholderValue(
        placeholderGroup,
        filterGroupPlaceholders,
        filterPlaceholders,
        undefinedPlaceholderHandling,
    );

    const setFilterGroupPlaceholder = useCallback(
        (
            valueOrUpdateCallback:
                | Array<IFilter | IFilterPlaceholder>
                | ((
                      attrOrMeasure: Array<IFilter | IFilterPlaceholder>,
                  ) => Array<IFilter | IFilterPlaceholder>),
        ) => {
            setFilterGroupPlaceholders((placeholderGroups) => {
                const filters = placeholderGroups[placeholderGroup.id]?.filters ?? placeholderGroup.filters;
                const updatedFilters =
                    typeof valueOrUpdateCallback === "function"
                        ? valueOrUpdateCallback(filters)
                        : valueOrUpdateCallback;

                return {
                    ...placeholderGroups,
                    [placeholderGroup.id]: {
                        ...placeholderGroup,
                        filters: updatedFilters,
                    },
                };
            });
        },
        [],
    );

    return [filters, setFilterGroupPlaceholder];
}
