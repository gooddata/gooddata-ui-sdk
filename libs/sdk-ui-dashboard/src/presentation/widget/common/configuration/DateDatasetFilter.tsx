// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import {
    areObjRefsEqual,
    ICatalogDateDataset,
    idRef,
    isInsightWidget,
    IWidget,
    ObjRef,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import first from "lodash/first";
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
import { getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";

const CONFIG_PANEL_DATE_FILTER_WIDTH = 159;

function getRecommendedCatalogDateDataset(
    dateDatasets: ICatalogDateDataset[],
): ICatalogDateDataset | undefined {
    const recommendedDateDataSetId = getRecommendedDateDataset(
        dateDatasets.map((ds) => {
            return {
                id: ds.dataSet.id,
                title: ds.dataSet.title,
            };
        }),
    )?.id;

    return recommendedDateDataSetId
        ? dateDatasets.find((ds) => ds.dataSet.id === recommendedDateDataSetId)
        : undefined;
}

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
    const selectedDateDatasetHidden = !relatedDateDatasets?.some((ds) =>
        areObjRefsEqual(ds.dataSet.ref, selectedDateDataset?.dataSet.ref),
    );

    const isDateFilterEnabled = !!widget.dateDataSet;

    const dispatch = useDashboardDispatch();

    const handleDateDatasetFilterEnabled = useCallback(
        (enabled: boolean, dateDatasetRef: ObjRef | undefined) => {
            if (enabled) {
                if (dateDatasetRef) {
                    dispatch(enableKpiWidgetDateFilter(widget.ref, dateDatasetRef));
                } else {
                    invariant(
                        relatedDateDatasets?.length,
                        "Date filtering enabled without a date dataset available.",
                    );

                    // preselect the recommended if any, or the first one
                    const recommendedDateDataSet = getRecommendedCatalogDateDataset(relatedDateDatasets);
                    const firstDataSet = first(relatedDateDatasets);

                    const preselectedDateDataSetRef = recommendedDateDataSet
                        ? recommendedDateDataSet.dataSet.ref
                        : firstDataSet!.dataSet.ref;

                    dispatch(enableKpiWidgetDateFilter(widget.ref, preselectedDateDataSetRef));
                }
            } else {
                dispatch(disableKpiWidgetDateFilter(widget.ref));
            }
        },
        [dispatch, relatedDateDatasets, widget.ref],
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
                    isLoading={isDropdownLoading}
                />
            )}
        </div>
    );
};
