// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type GoodDataSdkError } from "@gooddata/sdk-ui";

export type FilterErrors = Record<string, GoodDataSdkError | null>;

/**
 * Type for the setFilterError function.
 * It updates the error status for given filter. If status is not provided, it keeps the previous value in state.
 * providing null will clear the error status for the filter.
 */
export type SetFilterError = (filterIdentifier: string | undefined, status?: GoodDataSdkError | null) => void;

export interface IUseFilterGroupStatus {
    setFilterError: SetFilterError;
    isAnyFilterError: boolean;
}

export const useFilterGroupStatus = (availableFilterIdentifiers: string[]): IUseFilterGroupStatus => {
    const [filterErrors, setFiltersError] = useState<FilterErrors>({});

    const availableErrorsEntries = useMemo(
        () =>
            availableFilterIdentifiers.map(
                (localIdentifier) => [localIdentifier, filterErrors[localIdentifier] ?? null] as const,
            ),
        [availableFilterIdentifiers, filterErrors],
    );

    const setFilterError = useCallback(
        (filterIdentifier: string | undefined, error?: GoodDataSdkError | null) => {
            setFiltersError((prev: FilterErrors): FilterErrors => {
                if (!filterIdentifier) {
                    return prev;
                }
                const prevError = prev[filterIdentifier];
                const newError = error === undefined ? prevError : error;
                if (prevError === newError) {
                    return prev; // breaks potential infinite loop
                }
                return {
                    ...prev,
                    [filterIdentifier]: newError,
                };
            });
        },
        [],
    );

    const isAnyFilterError = availableErrorsEntries.some(([_, error]) => !!error);

    return {
        setFilterError,
        isAnyFilterError,
    };
};
