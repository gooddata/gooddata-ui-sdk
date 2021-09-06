// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";
import { isWidget, isDashboardWidget, UnexpectedError, isInsightWidget } from "@gooddata/sdk-backend-spi";
import { BackendProvider, convertError, useBackendStrict } from "@gooddata/sdk-ui";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { withEventing } from "@gooddata/sdk-backend-base";

import {
    selectAlertByWidgetRef,
    useDashboardEventDispatch,
    useDashboardSelector,
    widgetExecutionFailed,
    widgetExecutionStarted,
    widgetExecutionSucceeded,
} from "../../../model";
import { DashboardItem } from "../../presentationComponents";

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
        const onStart = (def: IExecutionDefinition) => dispatchEvent(widgetExecutionStarted(widgetRef!, def));
        const onSuccess = () => dispatchEvent(widgetExecutionSucceeded(widgetRef!));
        const onError = (error: any) => dispatchEvent(widgetExecutionFailed(widgetRef!, convertError(error)));
        return withEventing(effectiveBackend, {
            beforeExecute: onStart,
            successfulResultReadAll: onSuccess,
            successfulResultReadWindow: onSuccess,
            failedExecute: onError,
            failedResultReadAll: onError,
            failedResultReadWindow: onError,
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
