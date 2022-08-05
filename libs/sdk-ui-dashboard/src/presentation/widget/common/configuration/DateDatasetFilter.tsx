// (C) 2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { ICatalogDateDataset, IWidget } from "@gooddata/sdk-model";

import { DateFilterCheckbox } from "./DateFilterCheckbox";
import { useDashboardSelector, selectAllCatalogDateDatasetsMap } from "../../../../model";
import { DateDatasetPicker } from "./DateDatasetPicker";
import { getUnrelatedDateDataset } from "./utils";
import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling";
import { useIsSelectedDatasetHidden } from "./useIsSelectedDatasetHidden";

const CONFIG_PANEL_DATE_FILTER_WIDTH = 159;

interface IDateDatasetFilterProps {
    widget: IWidget;
    relatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
    isDatasetsLoading: boolean;

    dateFromVisualization?: ICatalogDateDataset;
    dateFilterCheckboxDisabled: boolean;
    shouldPickDateDataset?: boolean;
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
        onDateDatasetChanged,
    } = props;

    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);

    const { selectedDateDatasetHiddenByObjectAvailability, status: visibleDateDatasetsStatus } =
        useIsSelectedDatasetHidden(selectedDateDataset?.dataSet.ref);

    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(
        !!widget.dateDataSet || shouldPickDateDataset,
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
                    width={CONFIG_PANEL_DATE_FILTER_WIDTH}
                    selectedDateDataset={selectedDateDataset}
                    selectedDateDatasetHidden={selectedDateDatasetHiddenByObjectAvailability}
                    unrelatedDateDataset={unrelatedDateDataset}
                    onDateDatasetChange={handleDateDatasetChanged}
                    autoOpen={shouldPickDateDataset}
                    isLoading={isDropdownLoading}
                />
            )}
        </div>
    );
};
