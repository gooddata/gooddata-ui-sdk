// (C) 2022 GoodData Corporation
import { useCallback, useState } from "react";
import { ICatalogDateDataset, idRef, isInsightWidget, IWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import first from "lodash/first";

import {
    disableInsightWidgetDateFilter,
    disableKpiWidgetDateFilter,
    enableInsightWidgetDateFilter,
    enableKpiWidgetDateFilter,
    useDashboardCommandProcessing,
} from "../../../../model";
import { getRecommendedDateDataset } from "@gooddata/sdk-ui-kit";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef";

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

export function useDateFilterConfigurationHandling(
    widget: IWidget,
    relatedDateDatasets: ICatalogDateDataset[] | undefined,
    onAppliedChanged: (applied: boolean) => void,
) {
    const [status, setStatus] = useState<"ok" | "error" | "loading">("ok");

    const ref = widgetRef(widget);

    const { run: disableKpiDateFilter } = useDashboardCommandProcessing({
        commandCreator: disableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: enableKpiDateFilter } = useDashboardCommandProcessing({
        commandCreator: enableKpiWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(true);
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
            onAppliedChanged(false);
        },
    });

    const { run: enableInsightDateFilter } = useDashboardCommandProcessing({
        commandCreator: enableInsightWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: (_command) => {
            setStatus("ok");
        },
    });

    const handleDateFilterEnabled = useCallback(
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

            const enable = isInsightWidget(widget) ? enableInsightDateFilter : enableKpiDateFilter;
            const disable = isInsightWidget(widget) ? disableInsightDateFilter : disableKpiDateFilter;

            if (enabled) {
                if (dateDatasetRef) {
                    enable(ref, dateDatasetRef);
                } else {
                    const preselectedDateDataSetRef = getPreselectedDateDataset();
                    enable(ref, preselectedDateDataSetRef);
                }
            } else {
                disable(ref);
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
        [isInsightWidget(widget), safeSerializeObjRef(ref)],
    );

    return {
        status,
        handleDateDatasetChanged,
        handleDateFilterEnabled,
    };
}
