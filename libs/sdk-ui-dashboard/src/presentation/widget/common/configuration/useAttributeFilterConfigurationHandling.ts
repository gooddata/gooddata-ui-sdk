// (C) 2022 GoodData Corporation
import { useCallback, useState } from "react";
import { isInsightWidget, IWidget, ObjRef, widgetRef } from "@gooddata/sdk-model";

import {
    ignoreFilterOnInsightWidget,
    ignoreFilterOnKpiWidget,
    unignoreFilterOnInsightWidget,
    unignoreFilterOnKpiWidget,
    useDashboardCommandProcessing,
} from "../../../../model/index.js";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";

export function useAttributeFilterConfigurationHandling(
    widget: IWidget,
    displayFormRef: ObjRef,
    onAppliedChanged: (applied: boolean) => void,
) {
    const [status, setStatus] = useState<"ok" | "error" | "loading">("ok");

    const ref = widgetRef(widget);

    const { run: ignoreKpiFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreFilterOnKpiWidget,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreKpiFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreFilterOnKpiWidget,
        successEvent: "GDC.DASH/EVT.KPI_WIDGET.FILTER_SETTINGS_CHANGED",
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

    const { run: ignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreFilterOnInsightWidget,
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

    const handleIgnoreChanged = useCallback(
        (ignored: boolean) => {
            const ignore = isInsightWidget(widget) ? ignoreInsightFilter : ignoreKpiFilter;
            const unignore = isInsightWidget(widget) ? unignoreInsightFilter : unignoreKpiFilter;

            if (ignored) {
                unignore(ref, displayFormRef);
            } else {
                ignore(ref, displayFormRef);
            }
        },
        [
            isInsightWidget(widget),
            safeSerializeObjRef(displayFormRef),
            safeSerializeObjRef(ref),
            ignoreInsightFilter,
            ignoreKpiFilter,
            unignoreInsightFilter,
            unignoreKpiFilter,
        ],
    );

    return {
        status,
        handleIgnoreChanged,
    };
}
