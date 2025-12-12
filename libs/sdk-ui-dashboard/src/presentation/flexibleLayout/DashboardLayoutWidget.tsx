// (C) 2020-2025 GoodData Corporation

import { type Ref, useRef } from "react";

import cx from "classnames";

import {
    type IDashboardLayoutSize,
    type IDashboardLayoutSizeByScreenSize,
    type IInsight,
    type ISettings,
    type ScreenSize,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import {
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    type IVisualizationSizeInfo,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
} from "@gooddata/sdk-ui-ext";

import { DEFAULT_COLUMN_CLIENT_WIDTH, DEFAULT_WIDTH_RESIZER_HEIGHT } from "./constants.js";
import { DashboardItemOverlay } from "./DashboardItemOverlay/DashboardItemOverlay.js";
import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutWidgetRenderProps,
    getDashboardLayoutItemHeightForRatioAndScreen,
} from "./DefaultDashboardLayoutRenderer/index.js";
import { useWidthValidation } from "./DefaultDashboardLayoutRenderer/useItemWidthValidation.js";
import { Hotspot } from "./dragAndDrop/draggableWidget/Hotspot.js";
import { useShouldShowRowEndHotspot } from "./dragAndDrop/draggableWidget/RowEndHotspot.js";
import { HoverDetector } from "./dragAndDrop/Resize/HoverDetector.js";
import { ResizeOverlay } from "./dragAndDrop/Resize/ResizeOverlay.js";
import { WidthResizerHotspot } from "./dragAndDrop/Resize/WidthResizerHotspot.js";
import { getRefsForItem, getRefsForSection } from "./refs.js";
import { DASHBOARD_LAYOUT_GRID_SINGLE_COLUMN } from "../../_staging/dashboard/flexibleLayout/config.js";
import { getLayoutConfiguration } from "../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { getItemIndex } from "../../_staging/layout/coordinates.js";
import { calculateWidgetMinHeight, getSizeInfo } from "../../_staging/layout/sizing.js";
import { type ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import {
    type ExtendedDashboardWidget,
    isCustomWidget,
    isExtendedDashboardLayoutWidget,
    selectEnableSnapshotExportAccessibility,
    selectInsightsMap,
    selectIsExport,
    selectIsInEditMode,
    selectIsInExportMode,
    selectSectionModification,
    selectSettings,
    selectWidgetsModification,
    selectWidgetsOverlayState,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../model/index.js";
import { isAnyPlaceholderWidget, isPlaceholderWidget } from "../../widgets/index.js";
import { DashboardItemPathAndSizeProvider } from "../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import { useWidgetDragEndHandler } from "../dragAndDrop/draggableWidget/useWidgetDragEndHandler.js";
import {
    type BaseDraggableLayoutItemSize,
    type DraggableLayoutItem,
    useDashboardDrag,
    useResizeItemStatus,
} from "../dragAndDrop/index.js";
import { useWidgetExportData } from "../export/index.js";
import { DashboardWidget, type IDashboardWidgetProps } from "../widget/index.js";

function logInvalidWidth(
    isValid: boolean,
    widgetId: string,
    gridWidth: number,
    parentWidth: number | undefined,
): void {
    if (!isValid) {
        console.error(
            `DashboardLayoutWidget: Widget ID: ${widgetId} has width set to ${gridWidth} which is bigger than the parent container's width ${parentWidth} or parent container has a column direction set and the widget width is smaller than the parent!`,
        );
    }
}

function calculateHeight(currentSize: IDashboardLayoutSize, screen: ScreenSize): number | undefined {
    const hasRatioHeight = Boolean(currentSize.heightAsRatio) && !currentSize.gridHeight;
    return hasRatioHeight ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen) : undefined;
}

/**
 * Tests in KD require widget index for css selectors.
 * Widget index equals to the widget order in the layout.
 * Also, placeholders are ignored for this.
 */
function getWidgetIndex(item: IDashboardLayoutItemFacade<ExtendedDashboardWidget>): number {
    const sectionPath = item.section().index();
    const isIgnoredForIndexes = (widget: ExtendedDashboardWidget | undefined) => {
        return !widget || isAnyPlaceholderWidget(widget);
    };

    let itemsInSectionsBefore = 0;
    for (let i = 0; i < sectionPath.sectionIndex; i += 1) {
        itemsInSectionsBefore +=
            item
                .section()
                .layout()
                .section(i)
                ?.items()
                .filter((i) => !isIgnoredForIndexes(i.widget())).length ?? 0;
    }
    const ignoredWidgetsBeforeItemCount = item
        .section()
        .items()
        .filter(
            (i) => getItemIndex(i.index()) < getItemIndex(item.index()) && isIgnoredForIndexes(i.widget()),
        ).length;
    return itemsInSectionsBefore + getItemIndex(item.index()) - ignoredWidgetsBeforeItemCount;
}

/**
 * @internal
 */
export function DashboardLayoutWidget({
    item,
    DefaultWidgetRenderer,
    onDrill,
    onFiltersChange,
    onError,
    getLayoutDimensions,
    rowIndex,
}: IDashboardLayoutWidgetRenderProps<ExtendedDashboardWidget> &
    Pick<IDashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange" | "rowIndex">) {
    const screen = useScreenSize();
    const dispatch = useDashboardDispatch();
    const insights = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const isExportMode = useDashboardSelector(selectIsInExportMode);
    const isExport = useDashboardSelector(selectIsExport);
    const isSnapshotAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const handleDragEnd = useWidgetDragEndHandler();

    // TODO: we should probably do something more meaningful when item has no widget; should that even
    //  be allowed? undefined widget will make things explode down the line away so..
    const widget = item.widget()!;
    const isCustom = isCustomWidget(widget);
    const isPlaceholder = isPlaceholderWidget(widget);
    const isDraggableWidgetType = !isPlaceholder && !isCustom;
    const { isSelected } = useWidgetSelection(widget.ref);
    const isRichTextWidgetInEditState = isSelected && isRichTextWidget(widget);
    const isNestedLayout = isExtendedDashboardLayoutWidget(widget);
    const exportData = useWidgetExportData(widget);
    const { enableRowEndHotspot } = useShouldShowRowEndHotspot(item, rowIndex);
    const { direction } = getLayoutConfiguration(item.section().layout().raw());

    const canDrag = isInEditMode && isDraggableWidgetType && !isRichTextWidgetInEditState;
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => createDraggableItem(item, insights, settings),
            canDrag,
            dragStart: (dragItem) => dispatch(uiActions.setDraggingWidgetSource(dragItem)),
            dragEnd: handleDragEnd,
        },
        [item, insights, isInEditMode, isDraggableWidgetType, isRichTextWidgetInEditState],
    );

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    const currentSize = item.size()[screen]!;
    const minHeight = calculateWidgetMinHeight(item.raw(), currentSize, insights, settings, isExportMode);
    const height = calculateHeight(currentSize, screen);

    const allowOverflow = !!currentSize.heightAsRatio;

    const index = getWidgetIndex(item);

    const refs = getRefsForItem(item);
    const sectionModifications = useDashboardSelector(
        selectSectionModification(getRefsForSection(item.section())),
    );
    const itemModifications = useDashboardSelector(selectWidgetsModification(refs));
    const overlayShow = useDashboardSelector(selectWidgetsOverlayState(refs));

    const { isActive, isResizingColumnOrRow, heightLimitReached, widthLimitReached } = useResizeItemStatus(
        widget.identifier,
    );

    const contentRef = useRef<HTMLDivElement | null>(null);
    const getWidthInPx = () =>
        contentRef.current?.getBoundingClientRect().width ?? DEFAULT_COLUMN_CLIENT_WIDTH;
    const getHeightInPx = () =>
        contentRef.current?.getBoundingClientRect().height ?? DEFAULT_WIDTH_RESIZER_HEIGHT;
    const getGridColumnWidth = () => {
        const columnWidthInGC = item.sizeForScreen(screen)?.gridWidth ?? DASHBOARD_LAYOUT_GRID_SINGLE_COLUMN;
        return (getWidthInPx() + 20) / columnWidthInGC;
    };

    const canShowHotspot = isInEditMode && !isDragging;
    const isNotPlaceholder = !isAnyPlaceholderWidget(widget);
    const isStandardWidget = isNotPlaceholder && !isCustomWidget(widget);
    const canShowWidgetHotspots = canShowHotspot && isStandardWidget;
    const canShowResizeOverlay = canShowHotspot && isNotPlaceholder && isActive;

    const className = cx({
        "custom-height": true,
        "gd-nested-layout-widget-renderer": isNestedLayout,
    });

    const { isValid, parentWidth } = useWidthValidation(item.size());
    logInvalidWidth(isValid, widget.identifier, currentSize.gridWidth, parentWidth);

    const isInFirstRow = rowIndex === 0;
    const wrapperRef = isInEditMode ? (dragRef as unknown as Ref<HTMLDivElement>) : undefined;
    const wrapperClassName = cx([
        "dashboard-widget-draggable-wrapper",
        {
            "gd-custom-widget-export": isCustom && isExport,
            "gd-nested-layout-widget-wrapper": isNestedLayout,
            "gd-widget-export": isSnapshotAccessibilityEnabled && isExport,
        },
    ]);
    const isInsertedByPlugin = sectionModifications.includes("insertedByPlugin");
    const shouldRenderOverlay = isInEditMode && overlayShow && !isInsertedByPlugin;
    const handleHideOverlay = () =>
        dispatch(uiActions.toggleWidgetsOverlay({ refs: [item.ref()], visible: false }));

    return (
        <DefaultWidgetRenderer
            DefaultWidgetRenderer={DefaultWidgetRenderer}
            item={item}
            allowOverflow={allowOverflow}
            height={height}
            minHeight={minHeight}
            className={className}
            contentRef={contentRef}
            getLayoutDimensions={getLayoutDimensions}
            rowIndex={rowIndex}
        >
            <div ref={wrapperRef} className={wrapperClassName}>
                {canShowWidgetHotspots ? (
                    <Hotspot
                        dropZoneType="prev"
                        direction={direction}
                        layoutPath={item.index()}
                        isOverNestedLayout={isNestedLayout}
                        isInFirstRow={isInFirstRow}
                    />
                ) : null}
                <DashboardItemPathAndSizeProvider layoutItem={item}>
                    <HoverDetector widgetRef={widget.ref}>
                        <DashboardWidget
                            // @ts-expect-error Don't expose index prop on public interface (we need it only for css class for KD tests)
                            index={index}
                            onDrill={onDrill}
                            onError={onError}
                            onFiltersChange={onFiltersChange}
                            widget={widget as ExtendedDashboardWidget}
                            parentLayoutItemSize={item.size()}
                            parentLayoutPath={item.index()}
                            ErrorComponent={ErrorComponent}
                            LoadingComponent={LoadingComponent}
                            rowIndex={rowIndex}
                            exportData={exportData}
                        />
                    </HoverDetector>
                </DashboardItemPathAndSizeProvider>
                {canShowResizeOverlay ? (
                    <ResizeOverlay
                        isActive={isActive}
                        isResizingColumnOrRow={isResizingColumnOrRow}
                        reachedWidthLimit={widthLimitReached}
                        reachedHeightLimit={heightLimitReached}
                        isOverNestedLayout={isNestedLayout}
                        isInFirstRow={isInFirstRow}
                    />
                ) : null}
                {canShowWidgetHotspots ? (
                    <Hotspot
                        dropZoneType="next"
                        direction={direction}
                        layoutPath={item.index()}
                        hideDropTarget={enableRowEndHotspot}
                        isOverNestedLayout={isNestedLayout}
                        isInFirstRow={isInFirstRow}
                    />
                ) : null}
            </div>
            {canShowWidgetHotspots ? (
                <WidthResizerHotspot
                    item={item}
                    getGridColumnHeightInPx={getHeightInPx}
                    getGridColumnWidth={getGridColumnWidth}
                    getLayoutDimensions={getLayoutDimensions}
                    rowIndex={rowIndex}
                />
            ) : null}

            <DashboardItemOverlay
                type="column"
                onHide={handleHideOverlay}
                render={shouldRenderOverlay}
                modifications={itemModifications}
            />
        </DefaultWidgetRenderer>
    );
}

function getFilledSize(
    itemSize: IDashboardLayoutSizeByScreenSize,
    sizeInfo?: IVisualizationSizeInfo,
): BaseDraggableLayoutItemSize {
    return {
        gridWidth:
            itemSize.xl?.gridWidth ||
            sizeInfo?.width.default ||
            WIDGET_DROPZONE_SIZE_INFO_DEFAULT.width.default,
        gridHeight:
            itemSize.xl?.gridHeight ||
            sizeInfo?.height.default ||
            WIDGET_DROPZONE_SIZE_INFO_DEFAULT.height.default,
    };
}

function createDraggableItem(
    item: IDashboardLayoutItemFacade<ExtendedDashboardWidget>,
    insights: ObjRefMap<IInsight>,
    settings: ISettings,
): DraggableLayoutItem {
    const widget = item.widget()!;
    const layoutPath = item.index();
    const size = item.size();

    const isOnlyItemInSection = item.section().items().count() === 1;

    if (isKpiWidget(widget)) {
        const sizeInfo = getSizeInfo(settings, "kpi", widget.kpi);

        return {
            type: "kpi",
            kpi: widget.kpi,
            title: widget.title,
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else if (isInsightWidget(widget)) {
        const insight = insights.get(widget.insight)!;
        const sizeInfo = getSizeInfo(settings, "kpi", insight);

        return {
            type: "insight",
            insight,
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            title: widget.title,
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else if (isRichTextWidget(widget)) {
        const sizeInfo = getSizeInfo(settings, "richText");

        return {
            type: "richText",
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            title: widget.title,
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else if (isVisualizationSwitcherWidget(widget)) {
        const sizeInfo = getSizeInfo(settings, "visualizationSwitcher");

        return {
            type: "visualizationSwitcher",
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            title: widget.title,
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else if (isExtendedDashboardLayoutWidget(widget)) {
        return {
            type: "dashboardLayout",
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            title: "",
            isOnlyItemInSection,
            size: getFilledSize(size, DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT),
        };
    } else {
        return {
            type: widget.type,
            widget,
            layoutPath,
            itemIndex: -1, // only for type compatibility reasons, will not be used
            sectionIndex: -1, // only for type compatibility reasons, will not be used
            title: "",
            isOnlyItemInSection,
            size: getFilledSize(size),
        };
    }
}
