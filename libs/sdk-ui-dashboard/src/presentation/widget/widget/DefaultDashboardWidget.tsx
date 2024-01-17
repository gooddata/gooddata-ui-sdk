// (C) 2020-2024 GoodData Corporation
import React, { useMemo } from "react";
import { IDataView, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isWidget,
    isInsightWidget,
    isDashboardWidget,
    widgetRef,
    isKpiWidget,
    isRichTextWidget,
} from "@gooddata/sdk-model";
import { BackendProvider, convertError, useBackendStrict } from "@gooddata/sdk-ui";
import { withEventing } from "@gooddata/sdk-backend-base";

import { useDashboardEventDispatch } from "../../../model/index.js";
import {
    widgetExecutionFailed,
    widgetExecutionStarted,
    widgetExecutionSucceeded,
} from "../../../model/events/widget.js";
import { IDashboardWidgetProps } from "./types.js";
import { safeSerializeObjRef } from "../../../_staging/metadata/safeSerializeObjRef.js";
import { DefaultDashboardKpiWidget } from "./DefaultDashboardKpiWidget.js";
import { RenderModeAwareDashboardInsightWidget } from "./InsightWidget/index.js";
import { RenderModeAwareDashboardRichTextWidget } from "./RichTextWidget/index.js";

/**
 * @internal
 */
export const DefaultDashboardWidget = React.memo(function DefaultDashboardWidget(
    props: IDashboardWidgetProps,
): JSX.Element {
    const {
        onError,
        onFiltersChange,
        screen,
        widget,
        backend,
        // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
        index,
    } = props;

    if (!isDashboardWidget(widget)) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    const ref = widgetRef(widget);

    const dispatchEvent = useDashboardEventDispatch();
    const effectiveBackend = useBackendStrict(backend);

    const backendWithEventing = useMemo(() => {
        // use a flag to report only the first result of the execution as per the events documented API
        let hasReportedResult = false;
        const onSuccess = (dataView: IDataView, executionId: string) => {
            if (!hasReportedResult) {
                dispatchEvent(widgetExecutionSucceeded(ref, dataView, executionId));
                hasReportedResult = true;
            }
        };
        const onError = (error: any, executionId: string) => {
            if (!hasReportedResult) {
                dispatchEvent(widgetExecutionFailed(ref, convertError(error), executionId));
                hasReportedResult = true;
            }
        };
        return withEventing(effectiveBackend, {
            beforeExecute: (def, executionId) => {
                hasReportedResult = false;
                dispatchEvent(widgetExecutionStarted(ref, def, executionId));
            },
            successfulResultReadAll: onSuccess,
            successfulResultReadWindow: (_offset, _limit, dataView, executionId) => {
                onSuccess(dataView, executionId);
            },
            failedExecute: onError,
            failedResultReadAll: onError,
            failedResultReadWindow: (_offset, _limit, error, executionId) => {
                onError(error, executionId);
            },
        });
    }, [effectiveBackend, dispatchEvent, safeSerializeObjRef(ref)]);

    const dashboardItemClasses = `s-dash-item-${index}`;

    if (isWidget(widget)) {
        let renderWidget = null;
        if (isInsightWidget(widget)) {
            renderWidget = (
                <RenderModeAwareDashboardInsightWidget
                    widget={widget}
                    screen={screen}
                    dashboardItemClasses={dashboardItemClasses}
                />
            );
        } else if (isKpiWidget(widget)) {
            renderWidget = (
                <DefaultDashboardKpiWidget
                    kpiWidget={widget}
                    screen={screen}
                    dashboardItemClasses={dashboardItemClasses}
                    onFiltersChange={onFiltersChange}
                    onError={onError}
                />
            );
        } else if (isRichTextWidget(widget)) {
            renderWidget = (
                <RenderModeAwareDashboardRichTextWidget
                    widget={widget}
                    screen={screen}
                    dashboardItemClasses={dashboardItemClasses}
                />
            );
        }

        return <BackendProvider backend={backendWithEventing}>{renderWidget}</BackendProvider>;
    }

    return <div>Unknown widget</div>;
});
