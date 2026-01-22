// (C) 2024-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IAttributeOrMeasure, type ICatalogDateDataset } from "@gooddata/sdk-model";

import {
    type IQueryAvailableDatasetsForItems,
    queryAvailableDatasetsForItems,
} from "../../../../../../model/queries/availableDatasetsForItems.js";
import { useDashboardSelector } from "../../../../../../model/react/DashboardStoreProvider.js";
import { useDashboardQueryProcessing } from "../../../../../../model/react/useDashboardQueryProcessing.js";
import { selectBackendCapabilities } from "../../../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectEnableKDAttributeFilterDatesValidation } from "../../../../../../model/store/config/configSelectors.js";

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
        IQueryAvailableDatasetsForItems,
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
