// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useState } from "react";

import { ICatalogDateDataset, IWidget } from "@gooddata/sdk-model";

import { DateDatasetDuplicityWarning } from "./DateDatasetDuplicityWarning.js";
import { DateDatasetPicker } from "./DateDatasetPicker.js";
import { DateFilterCheckbox } from "./DateFilterCheckbox.js";
import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling.js";
import { useIsSelectedDatasetHidden } from "./useIsSelectedDatasetHidden.js";
import { getUnrelatedDateDataset, getUnrelatedDateDatasets } from "./utils.js";
import {
    selectAllCatalogDateDatasetsMap,
    selectCatalogDateDatasets,
    selectEnableUnavailableItemsVisibility,
    selectFilterContextDateFilterByDataSet,
    useDashboardSelector,
} from "../../../../model/index.js";

interface IDateDatasetFilterProps {
    widget: IWidget;
    relatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
    isDatasetsLoading: boolean;

    dateFromVisualization?: ICatalogDateDataset;
    dateFilterCheckboxDisabled: boolean;
    shouldPickDateDataset?: boolean;
    shouldOpenDateDatasetPicker?: boolean;
    isLoadingAdditionalData?: boolean;
    onDateDatasetChanged?: (id: string) => void;
}

export const DateDatasetFilter: React.FC<IDateDatasetFilterProps> = (props) => {
    const {
        relatedDateDatasets,
        widget,
        dateFilterCheckboxDisabled,
        dateFromVisualization,
        isDatasetsLoading,
        shouldPickDateDataset,
        shouldOpenDateDatasetPicker,
        onDateDatasetChanged,
        isLoadingAdditionalData,
    } = props;

    const enableUnrelatedItemsVisibility = useDashboardSelector(selectEnableUnavailableItemsVisibility);
    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);
    const dateDatasets = useDashboardSelector(selectCatalogDateDatasets);

    const duplicatedDateDatasetFilter = useDashboardSelector(
        selectFilterContextDateFilterByDataSet(widget.dateDataSet!),
    );

    const { selectedDateDatasetHiddenByObjectAvailability, status: visibleDateDatasetsStatus } =
        useIsSelectedDatasetHidden(selectedDateDataset?.dataSet.ref);

    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(
        !!widget.dateDataSet || shouldPickDateDataset || isLoadingAdditionalData,
    );

    const {
        handleDateDatasetChanged: handleDateDatasetChangedCore,
        handleDateFilterEnabled,
        status,
    } = useDateFilterConfigurationHandling(widget, relatedDateDatasets, setIsDateFilterEnabled);

    const handleDateDatasetChanged = useCallback(
        (id: string) => {
            onDateDatasetChanged?.(id);
            handleDateDatasetChangedCore(id);
        },
        [handleDateDatasetChangedCore, onDateDatasetChanged],
    );

    const isFilterLoading = status === "loading";
    const isDropdownLoading = isDatasetsLoading || visibleDateDatasetsStatus === "loading";

    const shouldRenderDateDataSetsDropdown =
        !dateFilterCheckboxDisabled &&
        !(!isDateFilterEnabled || isFilterLoading) &&
        (relatedDateDatasets?.length ||
            isDropdownLoading ||
            selectedDateDatasetHiddenByObjectAvailability ||
            (dateDatasets.length && enableUnrelatedItemsVisibility));

    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(
            relatedDateDatasets,
            selectedDateDataset,
            selectedDateDatasetHiddenByObjectAvailability,
        );
    const unrelatedDateDatasets = getUnrelatedDateDatasets(dateDatasets, relatedDateDatasets);

    return (
        <div>
            <DateFilterCheckbox
                relatedDateDatasets={relatedDateDatasets}
                widget={widget}
                dateFilterCheckboxDisabled={dateFilterCheckboxDisabled}
                dateFilterEnabled={isDateFilterEnabled}
                isDropdownLoading={isDropdownLoading}
                isFilterLoading={isFilterLoading}
                selectedDateDataset={selectedDateDataset}
                selectedDateDatasetHidden={selectedDateDatasetHiddenByObjectAvailability}
                onDateDatasetFilterEnabled={handleDateFilterEnabled}
                enableUnrelatedItemsVisibility={enableUnrelatedItemsVisibility}
            />
            {!!shouldRenderDateDataSetsDropdown && (
                <DateDatasetPicker
                    relatedDateDatasets={relatedDateDatasets}
                    dateFromVisualization={dateFromVisualization}
                    widget={widget}
                    selectedDateDataset={selectedDateDataset}
                    selectedDateDatasetHidden={selectedDateDatasetHiddenByObjectAvailability}
                    unrelatedDateDataset={unrelatedDateDataset}
                    onDateDatasetChange={handleDateDatasetChanged}
                    autoOpen={shouldOpenDateDatasetPicker}
                    isLoading={isDropdownLoading}
                    enableUnrelatedItemsVisibility={enableUnrelatedItemsVisibility}
                    unrelatedDateDatasets={unrelatedDateDatasets}
                />
            )}
            {!isDropdownLoading && !!duplicatedDateDatasetFilter && <DateDatasetDuplicityWarning />}
        </div>
    );
};
