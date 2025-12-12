// (C) 2020-2025 GoodData Corporation

import { type ReactElement, memo, useMemo } from "react";

import cx from "classnames";

import { withEventing } from "@gooddata/sdk-backend-base";
import { type IDataView, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isDashboardWidget,
    isInsightWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    isWidget,
    widgetRef,
} from "@gooddata/sdk-model";
import { BackendProvider, convertError, useBackendStrict } from "@gooddata/sdk-ui";

import { RenderModeAwareDashboardNestedLayoutWidget } from "./DashboardNestedLayoutWidget/RenderModeAwareDashboardNestedLayoutWidget.js";
import { RenderModeAwareDashboardInsightWidget } from "./InsightWidget/index.js";
import { RenderModeAwareDashboardRichTextWidget } from "./RichTextWidget/index.js";
import { type IDashboardWidgetProps } from "./types.js";
import { RenderModeAwareDashboardVisualizationSwitcherWidget } from "./VisualizationSwitcherWidget/RenderModeAwareDashboardVisualizationSwitcherWidget.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { safeSerializeObjRef } from "../../../_staging/metadata/safeSerializeObjRef.js";
import {
    widgetExecutionFailed,
    widgetExecutionStarted,
    widgetExecutionSucceeded,
} from "../../../model/events/widget.js";
import { isExtendedDashboardLayoutWidget, useDashboardEventDispatch } from "../../../model/index.js";

type WidgetComponentAdditionalProps = Pick<
    IDashboardWidgetProps,
    "widget" | "parentLayoutPath" | "screen" | "onFiltersChange" | "onError" | "exportData"
>;

interface IWidgetComponentOwnProps {
    index: number;
    rowIndex: number;
}

function WidgetComponent({
    widget,
    index,
    rowIndex,
    parentLayoutPath,
    screen,
    exportData,
}: IWidgetComponentOwnProps & WidgetComponentAdditionalProps) {
    const dashboardItemClasses = parentLayoutPath
        ? `s-dash-item-${serializeLayoutItemPath(parentLayoutPath)}`
        : `s-dash-item-${index}`;
    const dashboardItemClassNames = cx(dashboardItemClasses, {
        "gd-first-container-row-widget": rowIndex === 0,
    });

    if (isInsightWidget(widget)) {
        return (
            <RenderModeAwareDashboardInsightWidget
                widget={widget}
                screen={screen}
                dashboardItemClasses={dashboardItemClassNames}
                exportData={exportData}
            />
        );
    } else if (isRichTextWidget(widget)) {
        return (
            <RenderModeAwareDashboardRichTextWidget
                widget={widget}
                screen={screen}
                dashboardItemClasses={dashboardItemClassNames}
                exportData={exportData}
            />
        );
    } else if (isVisualizationSwitcherWidget(widget)) {
        return (
            <RenderModeAwareDashboardVisualizationSwitcherWidget
                widget={widget}
                screen={screen}
                dashboardItemClasses={dashboardItemClassNames}
                exportData={exportData}
            />
        );
    }
    return null;
}

/**
 * @internal
 */
export const DefaultDashboardWidget = memo(function DefaultDashboardWidget({
    onError,
    onFiltersChange,
    screen,
    widget,
    backend,
    // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
    index,
    parentLayoutItemSize,
    parentLayoutPath,
    rowIndex,
    exportData,
}: IDashboardWidgetProps): ReactElement {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [effectiveBackend, dispatchEvent, safeSerializeObjRef(ref)]);

    if (isWidget(widget)) {
        return (
            <BackendProvider backend={backendWithEventing}>
                <WidgetComponent
                    widget={widget}
                    screen={screen}
                    index={index}
                    parentLayoutPath={parentLayoutPath}
                    onFiltersChange={onFiltersChange}
                    onError={onError}
                    rowIndex={rowIndex!}
                    exportData={exportData}
                />
            </BackendProvider>
        );
    } else if (isExtendedDashboardLayoutWidget(widget)) {
        const dashboardItemClasses = parentLayoutPath
            ? `s-dash-item-${serializeLayoutItemPath(parentLayoutPath)}--container`
            : `s-dash-item-${index}--container`;
        const dashboardItemClassNames = cx(dashboardItemClasses, {
            "gd-first-container-row-widget": rowIndex === 0,
        });
        return (
            <RenderModeAwareDashboardNestedLayoutWidget
                // nested layout widget merges layout and other widget props into single object. Split them here
                widget={widget}
                layout={widget}
                onFiltersChange={onFiltersChange}
                parentLayoutItemSize={parentLayoutItemSize}
                parentLayoutPath={parentLayoutPath}
                dashboardItemClasses={dashboardItemClassNames}
            />
        );
    }

    return <div>Unknown widget</div>;
});
