// (C) 2022-2025 GoodData Corporation

import { useCallback, useState } from "react";

import {
    ICatalogDateDataset,
    IWidget,
    ObjRef,
    idRef,
    isInsightWidget,
    isRichTextWidget,
    widgetRef,
} from "@gooddata/sdk-model";

import { getRecommendedCatalogDateDataset } from "../../../../_staging/dateDatasets/getRecommendedCatalogDateDataset.js";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";
import {
    disableInsightWidgetDateFilter,
    disableKpiWidgetDateFilter,
    disableRichTextWidgetDateFilter,
    enableInsightWidgetDateFilter,
    enableKpiWidgetDateFilter,
    enableRichTextWidgetDateFilter,
    ignoreDateFilterOnInsightWidget,
    ignoreDateFilterOnRichTextWidget,
    unignoreDateFilterOnInsightWidget,
    unignoreDateFilterOnRichTextWidget,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";

export function useDateFilterConfigurationHandling(
    widget: IWidget,
    relatedDateDatasets: readonly ICatalogDateDataset[] | undefined,
    onAppliedChanged: (applied: boolean) => void,
    dataSetRef?: ObjRef,
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

    const { run: disableRichTextDateFilter } = useDashboardCommandProcessing({
        commandCreator: disableRichTextWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: enableRichTextDateFilter } = useDashboardCommandProcessing({
        commandCreator: enableRichTextWidgetDateFilter,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
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
                if (!relatedDateDatasets?.length) {
                    return null;
                }

                // preselect the recommended if any, or the first one
                const recommendedDateDataSet = getRecommendedCatalogDateDataset(relatedDateDatasets);
                const firstDataSet = relatedDateDatasets.at(0);

                return recommendedDateDataSet
                    ? recommendedDateDataSet.dataSet.ref
                    : firstDataSet!.dataSet.ref;
            };

            const enable = isInsightWidget(widget)
                ? enableInsightDateFilter
                : isRichTextWidget(widget)
                  ? enableRichTextDateFilter
                  : enableKpiDateFilter;
            const disable = isInsightWidget(widget)
                ? disableInsightDateFilter
                : isRichTextWidget(widget)
                  ? disableRichTextDateFilter
                  : disableKpiDateFilter;

            if (enabled) {
                if (dateDatasetRef) {
                    enable(ref, dateDatasetRef);
                } else {
                    const preselectedDateDataSetRef = getPreselectedDateDataset();
                    enable(ref, preselectedDateDataSetRef ?? "default");
                }
            } else {
                disable(ref);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isInsightWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isRichTextWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            safeSerializeObjRef(ref),
            enableInsightDateFilter,
            disableInsightDateFilter,
            enableKpiDateFilter,
            disableKpiDateFilter,
            enableRichTextDateFilter,
            disableRichTextDateFilter,
            relatedDateDatasets,
        ],
    );

    const { run: ignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreDateFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreDateFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: () => {
            setStatus("ok");
        },
    });

    const { run: ignoreRichTextDateFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreDateFilterOnRichTextWidget,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreRichTextDateFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreDateFilterOnRichTextWidget,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(true);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: () => {
            setStatus("ok");
        },
    });

    const handleIgnoreChanged = useCallback(
        (ignored: boolean) => {
            if (!dataSetRef) {
                return;
            }

            if (isInsightWidget(widget)) {
                if (ignored) {
                    unignoreInsightFilter(ref, dataSetRef);
                } else {
                    ignoreInsightFilter(ref, dataSetRef);
                }
            } else if (isRichTextWidget(widget)) {
                if (ignored) {
                    unignoreRichTextDateFilter(ref, dataSetRef);
                } else {
                    ignoreRichTextDateFilter(ref, dataSetRef);
                }
            }
        },
        [
            dataSetRef,
            ignoreInsightFilter,
            ignoreRichTextDateFilter,
            ref,
            unignoreInsightFilter,
            unignoreRichTextDateFilter,
            widget,
        ],
    );

    const handleDateDatasetChanged = useCallback(
        (id: string) => {
            if (isInsightWidget(widget)) {
                enableInsightDateFilter(ref, idRef(id, "dataSet"));
            } else if (isRichTextWidget(widget)) {
                enableRichTextDateFilter(ref, idRef(id, "dataSet"));
            } else {
                enableKpiDateFilter(ref, idRef(id, "dataSet"));
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isInsightWidget(widget), isRichTextWidget(widget), safeSerializeObjRef(ref)],
    );

    return {
        status,
        handleDateDatasetChanged,
        handleDateFilterEnabled,
        handleIgnoreChanged,
    };
}
