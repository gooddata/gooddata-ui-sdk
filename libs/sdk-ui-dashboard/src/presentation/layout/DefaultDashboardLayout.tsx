// (C) 2020-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    ObjRef,
    IInsight,
    objRefToString,
    isWidget,
    IDashboardLayout,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { LRUCache } from "@gooddata/util";
import invariant from "ts-invariant";

import {
    useDashboardSelector,
    selectIsExport,
    selectIsLayoutEmpty,
    selectLayout,
    ExtendedDashboardWidget,
    selectInsightsMap,
    selectEnableWidgetCustomHeight,
    selectRenderMode,
    selectWidgetPlaceholder,
    IWidgetPlaceholderSpec,
} from "../../model";
import { useDashboardComponentsContext } from "../dashboardContexts";

import { DashboardLayoutWidget } from "./DashboardLayoutWidget";
import { EmptyDashboardError } from "./EmptyDashboardError";
import { IDashboardLayoutProps } from "./types";
import {
    DashboardLayout,
    DashboardLayoutBuilder,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer";
import { RenderModeAwareDashboardLayoutSectionHeaderRenderer } from "./DefaultDashboardLayoutRenderer/RenderModeAwareDashboardLayoutSectionHeaderRenderer";
import { getMemoizedWidgetSanitizer } from "./DefaultDashboardLayoutUtils";
import { SectionHotspot } from "../dragAndDrop";
import {
    InsightPlaceholderWidget,
    KpiPlaceholderWidget,
    newInsightPlaceholderWidget,
    newKpiPlaceholderWidget,
    newPlaceholderWidget,
    PlaceholderWidget,
} from "../../widgets";

/**
 * Get dashboard layout for exports.
 *  - Create new extra rows if current row has width of widgets greater than 12
 *
 * @internal
 * @param layout - dashboard layout to modify
 * @returns transformed layout
 */
function getDashboardLayoutForExport(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
): IDashboardLayout<ExtendedDashboardWidget> {
    const dashLayout = DashboardLayoutBuilder.for(layout);
    const layoutFacade = dashLayout.facade();
    const sections = layoutFacade.sections();
    const screenSplitSections = sections.map((section) => ({
        items: section.items().asGridRows("xl"),
        header: section.header(),
    }));

    dashLayout.removeSections();
    screenSplitSections.forEach((wrappedSection) => {
        wrappedSection.items.forEach((rowSection, index) => {
            dashLayout.createSection((section) => {
                rowSection.forEach((item) => {
                    if (index === 0) {
                        section.header(wrappedSection.header);
                    }
                    section.createItem(item.size().xl, (i) => i.widget(item.widget()));
                });
                return section;
            });
        });
    });

    return dashLayout.build();
}

const itemKeyGetter: IDashboardLayoutItemKeyGetter<ExtendedDashboardWidget> = (keyGetterProps) => {
    const widget = keyGetterProps.item.widget();
    if (isWidget(widget)) {
        return objRefToString(widget.ref);
    }
    return keyGetterProps.item.index().toString();
};

function widgetForPlaceholderForSpec(
    widgetPlaceholder: IWidgetPlaceholderSpec,
    isLast: boolean,
): PlaceholderWidget | InsightPlaceholderWidget | KpiPlaceholderWidget {
    const { itemIndex, sectionIndex } = widgetPlaceholder;

    switch (widgetPlaceholder.type) {
        case "insight":
            return newInsightPlaceholderWidget(sectionIndex, itemIndex, isLast);
        case "kpi":
            return newKpiPlaceholderWidget(sectionIndex, itemIndex, isLast);
        case "widget":
            return newPlaceholderWidget(sectionIndex, itemIndex, isLast);
        default:
            invariant(false, "unknown placeholder type");
    }
}

/**
 * @alpha
 */
export const DefaultDashboardLayout = (props: IDashboardLayoutProps): JSX.Element => {
    const { onFiltersChange, onDrill, onError, ErrorComponent: CustomError } = props;

    const { ErrorComponent } = useDashboardComponentsContext({ ErrorComponent: CustomError });

    const layout = useDashboardSelector(selectLayout);
    const isLayoutEmpty = useDashboardSelector(selectIsLayoutEmpty);
    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);
    const insights = useDashboardSelector(selectInsightsMap);
    const isExport = useDashboardSelector(selectIsExport);
    const renderMode = useDashboardSelector(selectRenderMode);
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const getInsightByRef = useCallback(
        (insightRef: ObjRef): IInsight | undefined => {
            return insights.get(insightRef);
        },
        [insights],
    );

    const sanitizeWidgets = useMemo(() => {
        // keep the cache local so that it is cleared when the dashboard changes for example and this component is remounted
        const cache = new LRUCache<IDashboardLayoutItem<ExtendedDashboardWidget>>({ maxSize: 100 });
        return getMemoizedWidgetSanitizer(cache);
    }, []);

    const transformedLayout = useMemo(() => {
        if (isExport) {
            return getDashboardLayoutForExport(layout);
        }

        let builder = DashboardLayoutBuilder.for(layout).modifySections((section) =>
            section.modifyItems(sanitizeWidgets(getInsightByRef, enableWidgetCustomHeight)),
        );

        if (widgetPlaceholder) {
            builder = builder.modifySection(widgetPlaceholder.sectionIndex, (section) =>
                section.addItem(
                    {
                        type: "IDashboardLayoutItem",
                        size: {
                            xl: {
                                gridHeight: widgetPlaceholder.size.height,
                                gridWidth: widgetPlaceholder.size.width,
                            },
                        },
                        widget: widgetForPlaceholderForSpec(
                            widgetPlaceholder,
                            widgetPlaceholder.itemIndex === section.facade().items().count(),
                        ),
                    },
                    widgetPlaceholder.itemIndex,
                ),
            );
        }

        return builder.build();
    }, [layout, isExport, getInsightByRef, enableWidgetCustomHeight, sanitizeWidgets, widgetPlaceholder]);

    const widgetRenderer = useCallback<IDashboardLayoutWidgetRenderer<ExtendedDashboardWidget>>(
        (renderProps) => {
            return (
                <DashboardLayoutWidget
                    onError={onError}
                    onDrill={onDrill}
                    onFiltersChange={onFiltersChange}
                    {...renderProps}
                />
            );
        },
        [onError, onDrill, onFiltersChange],
    );

    return isLayoutEmpty ? (
        <EmptyDashboardError ErrorComponent={ErrorComponent} />
    ) : (
        <>
            <DashboardLayout
                className={isExport ? "export-mode" : ""}
                layout={transformedLayout}
                itemKeyGetter={itemKeyGetter}
                widgetRenderer={widgetRenderer}
                enableCustomHeight={enableWidgetCustomHeight}
                sectionHeaderRenderer={RenderModeAwareDashboardLayoutSectionHeaderRenderer}
                renderMode={renderMode}
            />
            <SectionHotspot index={transformedLayout.sections.length} targetPosition="below" />
        </>
    );
};
