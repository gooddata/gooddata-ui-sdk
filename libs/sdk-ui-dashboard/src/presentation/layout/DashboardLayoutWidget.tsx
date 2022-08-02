// (C) 2020-2022 GoodData Corporation
import React from "react";
import {
    IInsight,
    AnalyticalWidgetType,
    isWidget,
    widgetType as getWidgetType,
    isKpiWidget,
    isInsightWidget,
    IDashboardLayoutSize,
    ISettings,
    IKpi,
} from "@gooddata/sdk-model";
import {
    ExtendedDashboardWidget,
    selectEnableWidgetCustomHeight,
    selectInsightsMap,
    selectSettings,
    useDashboardSelector,
} from "../../model";
import { DashboardWidget, IDashboardWidgetProps } from "../widget";
import {
    getDashboardLayoutItemHeight,
    getDashboardLayoutItemHeightForRatioAndScreen,
    IDashboardLayoutItemFacade,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer";
import { ObjRefMap } from "../../_staging/metadata/objRefMap";
import { useDashboardComponentsContext } from "../dashboardContexts";
import { Hotspot, ResizeOverlay, useResizeStatus } from "../dragAndDrop";
import { getDashboardLayoutWidgetDefaultHeight } from "../../model/layout";
import { isInsightPlaceholderWidget } from "../../widgets/placeholders/types";

function calculateWidgetMinHeight(
    widget: ExtendedDashboardWidget,
    currentSize: IDashboardLayoutSize,
    insights: ObjRefMap<IInsight>,
    settings: ISettings,
): number | undefined {
    let widgetType: AnalyticalWidgetType;
    let insight: IInsight;
    let content: IInsight | IKpi;

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        insight = insights.get(widget.insight)!;
        content = insight;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }

    return (
        getDashboardLayoutItemHeight(currentSize) ||
        (!currentSize.heightAsRatio
            ? getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
            : undefined)
    );
}

/**
 * Tests in KD require widget index for css selectors.
 * Widget index equals to the widget order in the layout.
 */
function getWidgetIndex(item: IDashboardLayoutItemFacade<ExtendedDashboardWidget>): number {
    const sectionIndex = item.section().index();
    let itemsInSectionsBefore = 0;
    for (let i = 0; i < sectionIndex; i += 1) {
        itemsInSectionsBefore += item.section().layout().section(i)?.items().count() ?? 0;
    }
    return itemsInSectionsBefore + item.index();
}

/**
 * @internal
 */
export const DashboardLayoutWidget: IDashboardLayoutWidgetRenderer<
    ExtendedDashboardWidget,
    Pick<IDashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange">
> = (props) => {
    const { item, screen, DefaultWidgetRenderer, onDrill, onFiltersChange, onError } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();
    // TODO: we should probably do something more meaningful when item has no widget; should that even
    //  be allowed? undefined widget will make things explode down the line away so..
    const widget = item.widget()!;
    const currentSize = item.size()[screen]!;
    const minHeight = calculateWidgetMinHeight(widget, currentSize, insights, settings);
    const height =
        currentSize.heightAsRatio && !currentSize.gridHeight
            ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen)
            : undefined;

    const allowOverflow = !!currentSize.heightAsRatio;
    const className = enableWidgetCustomHeight ? "custom-height" : undefined;
    const index = getWidgetIndex(item);

    const { isActive, isResizingColumnOrRow, heightLimitReached } = useResizeStatus(widget.identifier);

    return (
        <DefaultWidgetRenderer
            DefaultWidgetRenderer={DefaultWidgetRenderer}
            item={item}
            screen={screen}
            allowOverflow={allowOverflow}
            height={height}
            minHeight={minHeight}
            className={className}
        >
            <DashboardWidget
                // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
                index={index}
                screen={screen}
                onDrill={onDrill}
                onError={onError}
                onFiltersChange={onFiltersChange}
                widget={widget as ExtendedDashboardWidget}
                ErrorComponent={ErrorComponent}
                LoadingComponent={LoadingComponent}
            />
            <ResizeOverlay
                isActive={isActive}
                isResizingColumnOrRow={isResizingColumnOrRow}
                isUnderWidthMinLimit={false}
                reachedHeightLimit={heightLimitReached}
            />
            {!isInsightPlaceholderWidget(widget) && (
                <>
                    <Hotspot
                        dropZoneType="prev"
                        itemIndex={item.index()}
                        sectionIndex={item.section().index()}
                    />
                    <Hotspot
                        dropZoneType="next"
                        itemIndex={item.index()}
                        sectionIndex={item.section().index()}
                    />
                </>
            )}
        </DefaultWidgetRenderer>
    );
};
