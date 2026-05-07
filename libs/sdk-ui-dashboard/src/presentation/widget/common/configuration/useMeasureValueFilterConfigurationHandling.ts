// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IWidget, type ObjRef, isInsightWidget, isRichTextWidget, widgetRef } from "@gooddata/sdk-model";

import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";
import {
    ignoreMeasureValueFilterOnInsightWidget,
    unignoreMeasureValueFilterOnInsightWidget,
} from "../../../../model/commands/insight.js";
import {
    ignoreMeasureValueFilterOnRichTextWidget,
    unignoreMeasureValueFilterOnRichTextWidget,
} from "../../../../model/commands/richText.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";

export function useMeasureValueFilterConfigurationHandling(
    widget: IWidget,
    measureRef: ObjRef,
    onAppliedChanged: (applied: boolean) => void,
) {
    const [status, setStatus] = useState<"ok" | "error" | "loading">("ok");

    const ref = widgetRef(widget);

    const { run: ignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: ignoreMeasureValueFilterOnInsightWidget,
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreInsightFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreMeasureValueFilterOnInsightWidget,
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
        commandCreator: ignoreMeasureValueFilterOnRichTextWidget,
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        onBeforeRun: () => {
            onAppliedChanged(false);
        },
    });

    const { run: unignoreRichTextFilter } = useDashboardCommandProcessing({
        commandCreator: unignoreMeasureValueFilterOnRichTextWidget,
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
        (applied: boolean) => {
            let ignore: (ref: ObjRef, displayFormRef: ObjRef) => void;
            let unignore: (ref: ObjRef, displayFormRef: ObjRef) => void;

            if (isInsightWidget(widget)) {
                ignore = ignoreInsightFilter;
                unignore = unignoreInsightFilter;
            } else {
                ignore = ignoreRichTextFilter;
                unignore = unignoreRichTextFilter;
            }

            if (applied) {
                unignore(ref, measureRef);
            } else {
                ignore(ref, measureRef);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isInsightWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            isRichTextWidget(widget),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            safeSerializeObjRef(measureRef),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            safeSerializeObjRef(ref),
            ignoreInsightFilter,
            ignoreRichTextFilter,
            unignoreInsightFilter,
            unignoreRichTextFilter,
        ],
    );

    return {
        status,
        handleIgnoreChanged,
    };
}
