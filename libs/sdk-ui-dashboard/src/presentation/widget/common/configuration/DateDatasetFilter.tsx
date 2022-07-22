// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { ICatalogDateDataset, IWidget } from "@gooddata/sdk-model";
import noop from "lodash/noop";

import { DateFilterCheckbox } from "./DateFilterCheckbox";
import { useDashboardSelector, selectAllCatalogDateDatasetsMap } from "../../../../model";
import { DateDatasetPicker } from "./DateDatasetPicker";
import { getUnrelatedDateDataset } from "./utils";
import { useDateFilterConfigurationHandling } from "./useDateFilterConfigurationHandling";
import { useIsSelectedDatasetHidden } from "./useIsSelectedDatasetHidden";

const CONFIG_PANEL_DATE_FILTER_WIDTH = 159;

interface IDateDatasetFilterProps {
    widget: IWidget;
    relatedDateDatasets: ICatalogDateDataset[] | undefined;
    isDatasetsLoading: boolean;

    dateFromVisualization?: ICatalogDateDataset;
    dateFilterCheckboxDisabled: boolean;
}

export const DateDatasetFilter: React.FC<IDateDatasetFilterProps> = (props) => {
    const {
        relatedDateDatasets,
        widget,
        dateFilterCheckboxDisabled,
        dateFromVisualization,
        isDatasetsLoading,
    } = props;

    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);

    const { selectedDateDatasetHiddenByObjectAvailability, status: visibleDateDatasetsStatus } =
        useIsSelectedDatasetHidden(selectedDateDataset?.dataSet.ref);

    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(!!widget.dateDataSet);

    const { handleDateDatasetChanged, handleDateFilterEnabled, status } = useDateFilterConfigurationHandling(
        widget,
        relatedDateDatasets,
        setIsDateFilterEnabled,
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
                    autoOpenChanged={noop} // TODO
                    autoOpen={false} // TODO
                    isLoading={isDropdownLoading}
                />
            )}
        </div>
    );
};
