// (C) 2020-2025 GoodData Corporation
import { ReactElement, useMemo } from "react";
import { IDataView, UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isWidget,
    isInsightWidget,
    isDashboardWidget,
    widgetRef,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import cx from "classnames";
import { BackendProvider, convertError, useBackendStrict } from "@gooddata/sdk-ui";
import { withEventing } from "@gooddata/sdk-backend-base";

import {
    useDashboardEventDispatch,
    useDashboardSelector,
    selectEnableFlexibleLayout,
    isExtendedDashboardLayoutWidget,
} from "../../../model/index.js";
import {
    widgetExecutionFailed,
    widgetExecutionStarted,
    widgetExecutionSucceeded,
} from "../../../model/events/widget.js";
import { IDashboardWidgetProps } from "./types.js";
import { safeSerializeObjRef } from "../../../_staging/metadata/safeSerializeObjRef.js";

import { RenderModeAwareDashboardInsightWidget } from "./InsightWidget/index.js";
import { RenderModeAwareDashboardRichTextWidget } from "./RichTextWidget/index.js";
import { RenderModeAwareDashboardVisualizationSwitcherWidget } from "./VisualizationSwitcherWidget/RenderModeAwareDashboardVisualizationSwitcherWidget.js";
import { RenderModeAwareDashboardNestedLayoutWidget } from "./DashboardNestedLayoutWidget/RenderModeAwareDashboardNestedLayoutWidget.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { useWidgetIndex } from "../../dashboardContexts/index.js";

type WidgetComponentAdditionalProps = Pick<
    IDashboardWidgetProps,
    "widget" | "parentLayoutPath" | "screen" | "onFiltersChange" | "onError" | "exportData"
>;

interface IWidgetComponentOwnProps {
    index: number | undefined;
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
        : `s-dash-item-${index ?? 0}`;
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
export function DefaultDashboardWidget({
    onError,
    onFiltersChange,
    screen,
    widget,
    backend,
    parentLayoutItemSize,
    parentLayoutPath,
    rowIndex,
    exportData,
}: IDashboardWidgetProps): ReactElement {
    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const index = useWidgetIndex();

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
    } else if (isFlexibleLayoutEnabled && isExtendedDashboardLayoutWidget(widget)) {
        const dashboardItemClasses = parentLayoutPath
            ? `s-dash-item-${serializeLayoutItemPath(parentLayoutPath)}--container`
            : `s-dash-item-${index ?? 0}--container`;
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
}
