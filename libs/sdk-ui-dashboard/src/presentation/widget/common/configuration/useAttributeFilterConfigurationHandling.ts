// (C) 2022-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IWidget, type ObjRef, isInsightWidget, isRichTextWidget, widgetRef } from "@gooddata/sdk-model";

import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";
import {
    ignoreFilterOnInsightWidget,
    unignoreFilterOnInsightWidget,
} from "../../../../model/commands/insight.js";
import { ignoreFilterOnKpiWidget, unignoreFilterOnKpiWidget } from "../../../../model/commands/kpi.js";
import {
    ignoreFilterOnRichTextWidget,
    unignoreFilterOnRichTextWidget,
} from "../../../../model/commands/richText.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";

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

    const { run: ignoreRichTextFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreFilterOnRichTextWidget,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
            setStatus("loading");
        },
        onError: () => {
            setStatus("error");
        },
        onSuccess: () => {
            setStatus("ok");
        },
    });

    const { run: unignoreRichTextFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreFilterOnRichTextWidget,
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
            let ignore: (ref: ObjRef, displayFormRef: ObjRef) => void;
            let unignore: (ref: ObjRef, displayFormRef: ObjRef) => void;

            if (isInsightWidget(widget)) {
                ignore = ignoreInsightFilter;
                unignore = unignoreInsightFilter;
            } else if (isRichTextWidget(widget)) {
                ignore = ignoreRichTextFilter;
                unignore = unignoreRichTextFilter;
            } else {
                ignore = ignoreKpiFilter;
                unignore = unignoreKpiFilter;
            }

            if (ignored) {
                unignore(ref, displayFormRef);
            } else {
                ignore(ref, displayFormRef);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isInsightWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isRichTextWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            safeSerializeObjRef(displayFormRef),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            safeSerializeObjRef(ref),
            ignoreInsightFilter,
            ignoreKpiFilter,
            ignoreRichTextFilter,
            unignoreInsightFilter,
            unignoreKpiFilter,
            unignoreRichTextFilter,
        ],
    );

    return {
        status,
        handleIgnoreChanged,
    };
}
