// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import {
    IDataView,
    isWidget,
    isDashboardWidget,
    UnexpectedError,
    isInsightWidget,
} from "@gooddata/sdk-backend-spi";
import { BackendProvider, convertError, useBackendStrict } from "@gooddata/sdk-ui";
import { withEventing } from "@gooddata/sdk-backend-base";

import { selectAlertByWidgetRef, useDashboardEventDispatch, useDashboardSelector } from "../../../model";
import { DashboardItem } from "../../presentationComponents";
import {
    widgetExecutionFailed,
    widgetExecutionStarted,
    widgetExecutionSucceeded,
} from "../../../model/events/widget";
import { DashboardWidgetProps } from "./types";
import { DashboardWidgetPropsProvider, useDashboardWidgetProps } from "./DashboardWidgetPropsContext";
import { DashboardKpiPropsProvider } from "../kpi/DashboardKpiPropsContext";
import { DashboardKpi } from "../kpi/DashboardKpi";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget";

/**
 * @internal
 */
export const DefaultDashboardWidgetInner = (): JSX.Element => {
    const { onError, onFiltersChange, screen, widget, backend } = useDashboardWidgetProps();

    const widgetRef = widget?.ref;
    const alertSelector = selectAlertByWidgetRef(widgetRef!);
    const alert = useDashboardSelector(alertSelector);

    const dispatchEvent = useDashboardEventDispatch();
    const effectiveBackend = useBackendStrict(backend);

    const backendWithEventing = useMemo(() => {
        // use a flag to report only the first result of the execution as per the events documented API
        let hasReportedResult = false;
        const onSuccess = (dataView: IDataView, executionId: string) => {
            if (!hasReportedResult) {
                dispatchEvent(widgetExecutionSucceeded(widgetRef!, dataView, executionId));
                hasReportedResult = true;
            }
        };
        const onError = (error: any, executionId: string) => {
            if (!hasReportedResult) {
                dispatchEvent(widgetExecutionFailed(widgetRef!, convertError(error), executionId));
                hasReportedResult = true;
            }
        };
        return withEventing(effectiveBackend, {
            beforeExecute: (def, executionId) => {
                hasReportedResult = false;
                dispatchEvent(widgetExecutionStarted(widgetRef!, def, executionId));
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
    }, [effectiveBackend, dispatchEvent]);

    if (!isDashboardWidget) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    if (isWidget(widget)) {
        return (
            <BackendProvider backend={backendWithEventing}>
                {isInsightWidget(widget) ? (
                    <DefaultDashboardInsightWidget widget={widget} screen={screen} />
                ) : (
                    <DashboardItem className="type-kpi" screen={screen}>
                        <DashboardKpiPropsProvider
                            kpiWidget={widget}
                            alert={alert}
                            onFiltersChange={onFiltersChange}
                            onError={onError}
                        >
                            <DashboardKpi />
                        </DashboardKpiPropsProvider>
                    </DashboardItem>
                )}
            </BackendProvider>
        );
    }

    return <div>Unknown widget</div>;
};

/**
 * @internal
 */
export const DefaultDashboardWidget = (props: DashboardWidgetProps): JSX.Element => {
    return (
        <DashboardWidgetPropsProvider {...props}>
            <DefaultDashboardWidgetInner />
        </DashboardWidgetPropsProvider>
    );
};
