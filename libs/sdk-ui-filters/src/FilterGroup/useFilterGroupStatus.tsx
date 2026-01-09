// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import {
    type IAttributeFilter,
    type IAttributeMetadataObject,
    filterLocalIdentifier,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type IAttributeFilterButtonProps } from "../AttributeFilter/AttributeFilterButton.js";

export interface IFilterStatus {
    loading?: boolean;
    error?: GoodDataSdkError | null;
    attribute?: IAttributeMetadataObject;
}

export type FiltersStatus = Record<string, IFilterStatus>;

/**
 * Type for the setFilterStatus function.
 * It updates the status for given filter. If filter is not provided, it keeps the previous value in state.
 *
 * Only defined properties of status are updated in state.
 * If some of the status properties are not provided, they kept their previous values in state.
 */
export type SetFilterStatus = (filter: IAttributeFilter | undefined, status: IFilterStatus) => void;

export interface IUseFilterGroupStatus {
    setFilterStatus: SetFilterStatus;
    getFilterStatus: (filter: IAttributeFilter) => IFilterStatus | undefined;
    isAnyFilterLoading: boolean;
    isAnyFilterError: boolean;
}

export const useFilterGroupStatus = (
    availableFilters: IAttributeFilterButtonProps[],
): IUseFilterGroupStatus => {
    const [filtersStatus, setFiltersStatus] = useState<FiltersStatus>({});

    const availableStatusesEntries = useMemo(
        () =>
            availableFilters
                .filter((filter) => !!filter.filter)
                .map((filter) => filter.filter)
                .filter((filter) => !!filter)
                .map(getFilterIdentifier)
                .filter((localIdentifier): localIdentifier is string => !!localIdentifier)
                .map(
                    (localIdentifier) =>
                        [
                            localIdentifier,
                            filtersStatus[localIdentifier] ?? {
                                loading: false,
                                error: null,
                                attribute: undefined,
                            },
                        ] as const,
                ),
        [availableFilters, filtersStatus],
    );

    const availableStatuses = useMemo(
        () => Object.fromEntries(availableStatusesEntries),
        [availableStatusesEntries],
    );

    const setFilterStatus = useCallback((filter: IAttributeFilter | undefined, status: IFilterStatus) => {
        setFiltersStatus((prev: FiltersStatus) => {
            if (!filter) {
                return prev;
            }
            const localIdentifier = getFilterIdentifier(filter);
            if (!localIdentifier) {
                return prev;
            }
            return {
                ...prev,
                [localIdentifier]: {
                    loading: status.loading === undefined ? prev[localIdentifier]?.loading : status.loading,
                    error: status.error === undefined ? prev[localIdentifier]?.error : status.error,
                    attribute:
                        status.attribute === undefined ? prev[localIdentifier]?.attribute : status.attribute,
                },
            };
        });
    }, []);

    const isAnyFilterLoading = availableStatusesEntries.some(([_, status]) => !!status.loading);

    const isAnyFilterError = availableStatusesEntries.some(([_, status]) => !!status.error);

    const getFilterStatus = useCallback(
        (filter: IAttributeFilter): IFilterStatus | undefined => {
            const localIdentifier = getFilterIdentifier(filter);
            if (!localIdentifier) {
                return undefined;
            }
            return availableStatuses[localIdentifier] ?? undefined;
        },
        [availableStatuses],
    );

    return {
        setFilterStatus,
        getFilterStatus,
        isAnyFilterLoading,
        isAnyFilterError,
    };
};

function getFilterIdentifier(filter: IAttributeFilter): string {
    const localIdentifier = filterLocalIdentifier(filter);
    if (localIdentifier) {
        return localIdentifier;
    }
    if (isPositiveAttributeFilter(filter)) {
        return objRefToString(filter.positiveAttributeFilter.displayForm);
    }
    if (isNegativeAttributeFilter(filter)) {
        return objRefToString(filter.negativeAttributeFilter.displayForm);
    }
    throw new Error("Faild getting filter identifier: Invalid attribute filter");
}
