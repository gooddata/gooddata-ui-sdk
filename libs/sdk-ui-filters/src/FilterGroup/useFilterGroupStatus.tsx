// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type IAttributeMetadataObject } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

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
export type SetFilterStatus = (filterIdentifier: string | undefined, status: IFilterStatus) => void;

export interface IUseFilterGroupStatus {
    setFilterStatus: SetFilterStatus;
    getFilterStatus: (filterIdentifier: string) => IFilterStatus | undefined;
    isAnyFilterLoading: boolean;
    isAnyFilterError: boolean;
}

export const useFilterGroupStatus = (availableFilterIdentifiers: string[]): IUseFilterGroupStatus => {
    const [filtersStatus, setFiltersStatus] = useState<FiltersStatus>({});

    const availableStatusesEntries = useMemo(
        () =>
            availableFilterIdentifiers.map(
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
        [availableFilterIdentifiers, filtersStatus],
    );

    const availableStatuses = useMemo(
        () => Object.fromEntries(availableStatusesEntries),
        [availableStatusesEntries],
    );

    const setFilterStatus = useCallback((filterIdentifier: string | undefined, status: IFilterStatus) => {
        setFiltersStatus((prev: FiltersStatus) => {
            if (!filterIdentifier) {
                return prev;
            }
            const prevStatus = prev[filterIdentifier];
            const newStatus = {
                loading: status.loading === undefined ? prevStatus?.loading : status.loading,
                error: status.error === undefined ? prevStatus?.error : status.error,
                attribute: status.attribute === undefined ? prevStatus?.attribute : status.attribute,
            };
            if (
                prevStatus?.loading === newStatus.loading &&
                prevStatus?.error === newStatus.error &&
                prevStatus?.attribute === newStatus.attribute
            ) {
                return prev; // breaks potential infinite loop
            }
            return {
                ...prev,
                [filterIdentifier]: newStatus,
            };
        });
    }, []);

    const isAnyFilterLoading = availableStatusesEntries.some(([_, status]) => !!status.loading);

    const isAnyFilterError = availableStatusesEntries.some(([_, status]) => !!status.error);

    const getFilterStatus = useCallback(
        (filterIdentifier: string): IFilterStatus | undefined => {
            if (!filterIdentifier) {
                return undefined;
            }
            return availableStatuses[filterIdentifier] ?? undefined;
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
