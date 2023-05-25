// (C) 2022-2023 GoodData Corporation
import React, { useCallback, useState } from "react";
import { ICatalogDateDataset, IWidget } from "@gooddata/sdk-model";

import { DateFilterCheckbox } from "./DateFilterCheckbox.js";
import { useDashboardSelector, selectAllCatalogDateDatasetsMap } from "../../../../model/index.js";
import { DateDatasetPicker } from "./DateDatasetPicker.js";
import { getUnrelatedDateDataset } from "./utils.js";
import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling.js";
import { useIsSelectedDatasetHidden } from "./useIsSelectedDatasetHidden.js";

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

    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);

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
        (relatedDateDatasets?.length || isDropdownLoading || selectedDateDatasetHiddenByObjectAvailability);

    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(
            relatedDateDatasets,
            selectedDateDataset,
            selectedDateDatasetHiddenByObjectAvailability,
        );

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
                />
            )}
        </div>
    );
};
