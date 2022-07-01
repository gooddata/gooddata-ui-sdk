// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import { ICatalogDateDataset, idRef, isInsightWidget, IWidget, ObjRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import noop from "lodash/noop";

import { DateFilterCheckbox } from "./DateFilterCheckbox";
import {
    disableKpiWidgetDateFilter,
    enableKpiWidgetDateFilter,
    useDashboardDispatch,
    useDashboardSelector,
    selectAllCatalogDateDatasetsMap,
    enableInsightWidgetDateFilter,
} from "../../../../model";
import { DateDatasetPicker } from "./DateDatasetPicker";
import { getUnrelatedDateDataset } from "./utils";

const CONFIG_PANEL_DATE_FILTER_WIDTH = 159;

interface IDateDatasetFilterProps {
    widget: IWidget;
    relatedDateDatasets: ICatalogDateDataset[] | undefined;
    isDropdownLoading: boolean;
    isFilterLoading: boolean;

    dateFromVisualization?: ICatalogDateDataset;
    dateFilterCheckboxDisabled: boolean;
}

export const DateDatasetFilter: React.FC<IDateDatasetFilterProps> = (props) => {
    const {
        relatedDateDatasets,
        widget,
        dateFilterCheckboxDisabled,
        dateFromVisualization,
        isDropdownLoading,
        isFilterLoading,
    } = props;

    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);
    const selectedDateDatasetHidden = false; // TODO how to get this...

    const isDateFilterEnabled = true; // TODO how to get this...

    const dispatch = useDashboardDispatch();

    const handleDateDatasetFilterEnabled = useCallback(
        (enabled: boolean, dateDatasetRef: ObjRef | undefined) => {
            if (enabled) {
                invariant(dateDatasetRef, "Date filtering enabled without a date dataset.");
                dispatch(enableKpiWidgetDateFilter(widget.ref, dateDatasetRef));
            } else {
                dispatch(disableKpiWidgetDateFilter(widget.ref));
            }
        },
        [dispatch, widget.ref],
    );

    const handleDateDatasetChanged = useCallback(
        (id: string) => {
            if (isInsightWidget(widget)) {
                dispatch(enableInsightWidgetDateFilter(widget.ref, idRef(id, "dataSet")));
            } else {
                dispatch(enableKpiWidgetDateFilter(widget.ref, idRef(id, "dataSet")));
            }
        },
        [dispatch, widget],
    );

    const shouldRenderDateDataSetsDropdown =
        !dateFilterCheckboxDisabled &&
        !(!isDateFilterEnabled || isFilterLoading) &&
        (relatedDateDatasets?.length || isDropdownLoading || selectedDateDatasetHidden);

    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(relatedDateDatasets, selectedDateDataset, selectedDateDatasetHidden);

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
                selectedDateDatasetHidden={selectedDateDatasetHidden}
                onDateDatasetFilterEnabled={handleDateDatasetFilterEnabled}
            />
            {!!shouldRenderDateDataSetsDropdown && (
                <DateDatasetPicker
                    relatedDateDatasets={relatedDateDatasets}
                    dateFromVisualization={dateFromVisualization}
                    widget={widget}
                    width={CONFIG_PANEL_DATE_FILTER_WIDTH}
                    selectedDateDataset={selectedDateDataset}
                    selectedDateDatasetHidden={selectedDateDatasetHidden}
                    unrelatedDateDataset={unrelatedDateDataset}
                    onDateDatasetChange={handleDateDatasetChanged}
                    autoOpenChanged={noop} // TODO
                    autoOpen={false} // TODO
                />
            )}
        </div>
    );
};
