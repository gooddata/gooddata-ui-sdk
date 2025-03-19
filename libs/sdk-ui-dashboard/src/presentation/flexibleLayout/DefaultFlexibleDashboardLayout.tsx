// (C) 2020-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    ObjRef,
    IInsight,
    objRefToString,
    isWidget,
    IDashboardLayout,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { LRUCache } from "lru-cache";
import max from "lodash/max.js";
import cx from "classnames";

import {
    useDashboardSelector,
    selectIsExport,
    selectLayout,
    ExtendedDashboardWidget,
    selectInsightsMap,
    selectEnableWidgetCustomHeight,
    selectRenderMode,
    selectFocusObject,
} from "../../model/index.js";
import { serializeLayoutItemPath } from "../../_staging/layout/coordinates.js";

import { DashboardLayoutWidget } from "./DashboardLayoutWidget.js";
import { IDashboardLayoutProps } from "./types.js";
import {
    DashboardLayout,
    DashboardLayoutBuilder,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer/index.js";
import { renderModeAwareDashboardLayoutSectionRenderer } from "./DefaultDashboardLayoutRenderer/RenderModeAwareDashboardLayoutSectionRenderer.js";
import { renderModeAwareDashboardLayoutSectionHeaderRenderer } from "./DefaultDashboardLayoutRenderer/RenderModeAwareDashboardLayoutSectionHeaderRenderer.js";
import { getMemoizedWidgetSanitizer } from "./DefaultDashboardLayoutUtils.js";
import { EmptyDashboardLayout } from "./EmptyDashboardLayout.js";
import { EmptyDashboardNestedLayout } from "./EmptyDashboardNestedLayout.js";
import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { useDashboardItemPathAndSize } from "../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useDashboardCustomizationsContext } from "../dashboardContexts/index.js";
import { DefaultDashboardExportVariables } from "../export/index.js";

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
            // Also ensure that all items in a section have equal grid height - the max one.
            // This simulates non-export mode, where the flex-box stretches
            // all the items in a row to the equal height.
            // This is necessary as we have no control over the custom widgets heights.
            const sectionItemsGridHeights = rowSection.map((item) => item.size().xl.gridHeight);
            const maxGridHeight = max(sectionItemsGridHeights);

            dashLayout.createSection((section) => {
                rowSection.forEach((item) => {
                    if (index === 0) {
                        section.header(wrappedSection.header);
                    }
                    section.createItem({ ...item.size().xl, gridHeight: maxGridHeight }, (i) =>
                        i.widget(item.widget()),
                    );
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
    return serializeLayoutItemPath(keyGetterProps.item.index());
};

/**
 * @alpha
 */
export const DefaultFlexibleDashboardLayout = (props: IDashboardLayoutProps): JSX.Element => {
    const { layout: providedLayout, onFiltersChange, onDrill, onError, dashboardItemClasses } = props;

    const selectedLayout = useDashboardSelector(selectLayout);

    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);
    const insights = useDashboardSelector(selectInsightsMap);
    const isExport = useDashboardSelector(selectIsExport);
    const renderMode = useDashboardSelector(selectRenderMode);
    const dashboardFocusObject = useDashboardSelector(selectFocusObject);
    const { existingExportTransformFn } = useDashboardCustomizationsContext();

    const screenSize = useScreenSize();
    const { itemPath, itemSize } = useDashboardItemPathAndSize();

    const layout: IDashboardLayout<ExtendedDashboardWidget> = useMemo(
        () => ({
            ...(providedLayout ?? selectedLayout),
            ...(itemSize ? { size: itemSize[screenSize] } : {}),
        }),
        [providedLayout, selectedLayout, itemSize, screenSize],
    );

    const isLayoutEmpty = !layout.sections.length;

    const getInsightByRef = useCallback(
        (insightRef: ObjRef): IInsight | undefined => {
            return insights.get(insightRef);
        },
        [insights],
    );

    const sanitizeWidgets = useMemo(() => {
        // keep the cache local so that it is cleared when the dashboard changes for example and this component is remounted
        const cache = new LRUCache<string, IDashboardLayoutItem<ExtendedDashboardWidget>>({ max: 100 });
        return getMemoizedWidgetSanitizer(cache);
    }, []);

    const transformedLayout = useMemo(() => {
        if (isExport) {
            return getDashboardLayoutForExport(layout);
        }

        return DashboardLayoutBuilder.for(layout, itemPath)
            .modifySections((section) =>
                section.modifyItems(sanitizeWidgets(getInsightByRef, enableWidgetCustomHeight)),
            )
            .build();
    }, [isExport, layout, itemPath, sanitizeWidgets, getInsightByRef, enableWidgetCustomHeight]);

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

    if (isLayoutEmpty) {
        if (providedLayout) {
            return <EmptyDashboardNestedLayout />;
        }
        return <EmptyDashboardLayout />;
    }

    return (
        <>
            {!itemPath || itemPath.length === 0 ? (
                <DefaultDashboardExportVariables renderMode={renderMode} />
            ) : null}
            <DashboardLayout
                className={cx(dashboardItemClasses, {
                    "export-mode": isExport,
                })}
                layout={transformedLayout}
                parentLayoutItemSize={itemSize}
                parentLayoutPath={itemPath}
                exportTransformer={existingExportTransformFn}
                itemKeyGetter={itemKeyGetter}
                widgetRenderer={widgetRenderer}
                enableCustomHeight={enableWidgetCustomHeight}
                sectionRenderer={renderModeAwareDashboardLayoutSectionRenderer}
                sectionHeaderRenderer={renderModeAwareDashboardLayoutSectionHeaderRenderer}
                renderMode={renderMode}
                focusObject={dashboardFocusObject}
            />
        </>
    );
};
