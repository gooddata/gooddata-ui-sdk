// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
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
import { IDashboardWidgetProps } from "./types";
import { DashboardKpi } from "../kpi/DashboardKpi";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget";

/**
 * @internal
 */
export const DefaultDashboardWidget = (props: IDashboardWidgetProps): JSX.Element => {
    const {
        onError,
        onFiltersChange,
        screen,
        widget,
        backend,
        // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
        index,
    } = props;

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

    if (!isDashboardWidget(widget)) {
        throw new UnexpectedError(
            "Cannot render custom widget with DefaultWidgetRenderer! Please handle custom widget rendering in your widgetRenderer.",
        );
    }

    if (isWidget(widget)) {
        return (
            <BackendProvider backend={backendWithEventing}>
                {isInsightWidget(widget) ? (
                    <DefaultDashboardInsightWidget
                        widget={widget}
                        screen={screen}
                        // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
                        index={index}
                    />
                ) : (
                    <DashboardItem className={cx("type-kpi", `s-dash-item-${index}`)} screen={screen}>
                        <DashboardKpi
                            kpiWidget={widget}
                            alert={alert}
                            onFiltersChange={onFiltersChange}
                            onError={onError}
                        />
                    </DashboardItem>
                )}
            </BackendProvider>
        );
    }

    return <div>Unknown widget</div>;
};
