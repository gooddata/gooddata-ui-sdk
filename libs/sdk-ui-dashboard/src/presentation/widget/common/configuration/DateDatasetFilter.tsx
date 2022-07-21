// (C) 2022 GoodData Corporation
import React, { useCallback, useState } from "react";
import { ICatalogDateDataset, idRef, isInsightWidget, IWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
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
    disableInsightWidgetDateFilter,
    useDashboardCommandProcessing,
} from "../../../../model";
import { DateDatasetPicker } from "./DateDatasetPicker";
import { getUnrelatedDateDataset } from "./utils";
import { getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef";

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
    } = props;

    const catalogDatasetsMap = useDashboardSelector(selectAllCatalogDateDatasetsMap);
    const selectedDateDataset = widget.dateDataSet && catalogDatasetsMap.get(widget.dateDataSet);
    const selectedDateDatasetHiddenByObjectAvailability = false; // TODO we need to resolve tags here, but ICatalogDateDataset has no tags...

    const [isDateFilterEnabled, setIsDateFilterEnabled] = useState(!!widget.dateDataSet);
    const [status, setStatus] = useState<"ok" | "error" | "loading">("ok");

    const ref = widgetRef(widget);

    const { run: disableKpiDateFilter } = useDashboardCommandProcessing({
        commandCreator: disableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsDateFilterEnabled(false);
        },
    });

    const { run: enableKpiDateFilter } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsDateFilterEnabled(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: (_command) => {
            setStatus("ok");
        },
    });

    const { run: disableInsightDateFilter } = useDashboardCommandProcessing({
        commandCreator: disableInsightWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsDateFilterEnabled(false);
        },
    });

    const { run: enableInsightDateFilter } = useDashboardCommandProcessing({
        commandCreator: enableInsightWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            setIsDateFilterEnabled(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: (_command) => {
            setStatus("ok");
        },
    });

    const isFilterLoading = status === "loading";

    const dispatch = useDashboardDispatch();

    const handleDateDatasetFilterEnabled = useCallback(
        (enabled: boolean, dateDatasetRef: ObjRef | undefined) => {
            const getPreselectedDateDataset = () => {
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
                return preselectedDateDataSetRef;
            };

            if (isInsightWidget(widget)) {
                if (enabled) {
                    if (dateDatasetRef) {
                        enableInsightDateFilter(ref, dateDatasetRef);
                    } else {
                        const preselectedDateDataSetRef = getPreselectedDateDataset();
                        enableInsightDateFilter(ref, preselectedDateDataSetRef);
                    }
                } else {
                    disableInsightDateFilter(ref);
                }
            } else {
                if (enabled) {
                    if (dateDatasetRef) {
                        enableKpiDateFilter(ref, dateDatasetRef);
                    } else {
                        const preselectedDateDataSetRef = getPreselectedDateDataset();
                        enableKpiDateFilter(ref, preselectedDateDataSetRef);
                    }
                } else {
                    disableKpiDateFilter(ref);
                }
            }
        },
        [
            isInsightWidget(widget),
            safeSerializeObjRef(ref),
            enableInsightDateFilter,
            disableInsightDateFilter,
            enableKpiDateFilter,
            disableKpiDateFilter,
            relatedDateDatasets,
        ],
    );

    const handleDateDatasetChanged = useCallback(
        (id: string) => {
            if (isInsightWidget(widget)) {
                enableInsightDateFilter(ref, idRef(id, "dataSet"));
            } else {
                enableKpiDateFilter(ref, idRef(id, "dataSet"));
            }
        },
        [dispatch, isInsightWidget(widget), safeSerializeObjRef(ref)],
    );

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
                onDateDatasetFilterEnabled={handleDateDatasetFilterEnabled}
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
