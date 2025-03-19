// (C) 2024 GoodData Corporation
import { useEffect, useMemo } from "react";
import { IAttributeOrMeasure, ICatalogDateDataset } from "@gooddata/sdk-model";
import {
    queryAvailableDatasetsForItems,
    QueryAvailableDatasetsForItems,
    selectBackendCapabilities,
    selectEnableKDAttributeFilterDatesValidation,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../../../../model/index.js";

/**
 * @internal
 */
export function useAvailableDatasetsForItems(items: IAttributeOrMeasure[]) {
    const enableKDAttributeFilterDatesValidation = useDashboardSelector(
        selectEnableKDAttributeFilterDatesValidation,
    );
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const shouldLoadAvailableDatasetsForItems =
        enableKDAttributeFilterDatesValidation &&
        capabilities.supportsAttributeFilterElementsLimitingByDependentDateFilters;

    const {
        run: getAvilableDatasetForItems,
        result: availableDatasetForItems,
        status: availableDatasetForItemsLoadingStatus,
        error: availableDatasetForItemsError,
    } = useDashboardQueryProcessing<
        QueryAvailableDatasetsForItems,
        ICatalogDateDataset[],
        Parameters<typeof queryAvailableDatasetsForItems>
    >({
        queryCreator: queryAvailableDatasetsForItems,
    });

    useEffect(() => {
        if (shouldLoadAvailableDatasetsForItems) {
            getAvilableDatasetForItems(items);
        }
    }, [items, shouldLoadAvailableDatasetsForItems, getAvilableDatasetForItems]);

    const availableDatasetsForItemsLoading = useMemo(() => {
        return (
            availableDatasetForItemsLoadingStatus === "pending" ||
            availableDatasetForItemsLoadingStatus === "running"
        );
    }, [availableDatasetForItemsLoadingStatus]);

    if (!shouldLoadAvailableDatasetsForItems) {
        return {
            availableDatasetForItems: [],
            availableDatasetForItemsError: undefined,
            availableDatasetLoading: false,
        };
    }

    return {
        availableDatasetForItems,
        availableDatasetsForItemsLoading,
        availableDatasetForItemsError,
    };
}
