// (C) 2020-2025 GoodData Corporation
import {
    IDashboardLayoutSizeByScreenSize,
    IInsight,
    ISettings,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import {
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    IVisualizationSizeInfo,
    WIDGET_DROPZONE_SIZE_INFO_DEFAULT,
} from "@gooddata/sdk-ui-ext";
import React, { useRef } from "react";
import cx from "classnames";
import {
    ExtendedDashboardWidget,
    isCustomWidget,
    selectEnableWidgetCustomHeight,
    selectInsightsMap,
    selectIsInEditMode,
    selectSettings,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
    selectWidgetsOverlayState,
    selectWidgetsModification,
    selectSectionModification,
    selectIsInExportMode,
    selectIsExport,
    useWidgetSelection,
    isExtendedDashboardLayoutWidget,
    selectEnableSnapshotExportAccessibility,
} from "../../model/index.js";
import { isAnyPlaceholderWidget, isPlaceholderWidget } from "../../widgets/index.js";
import { getSizeInfo, calculateWidgetMinHeight } from "../../_staging/layout/sizing.js";
import { getRemainingWidthInRow } from "./rowEndHotspotHelper.js";
import { ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import {
    BaseDraggableLayoutItemSize,
    DraggableLayoutItem,
    useDashboardDrag,
    useResizeItemStatus,
} from "../dragAndDrop/index.js";
import { DashboardWidget, IDashboardWidgetProps } from "../widget/index.js";
import { DEFAULT_COLUMN_CLIENT_WIDTH, DEFAULT_WIDTH_RESIZER_HEIGHT } from "./constants.js";
import {
    getDashboardLayoutItemHeightForRatioAndScreen,
    IDashboardLayoutItemFacade,
    IDashboardLayoutWidgetRenderer,
} from "./DefaultDashboardLayoutRenderer/index.js";
import { DashboardItemOverlay } from "./DashboardItemOverlay/DashboardItemOverlay.js";
import { getRefsForSection, getRefsForItem } from "./refs.js";
import { getItemIndex } from "../../_staging/layout/coordinates.js";
import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { ResizeOverlay } from "./dragAndDrop/Resize/ResizeOverlay.js";
import { WidthResizerHotspot } from "./dragAndDrop/Resize/WidthResizerHotspot.js";
import { Hotspot } from "./dragAndDrop/draggableWidget/Hotspot.js";
import { useWidgetDragEndHandler } from "../dragAndDrop/draggableWidget/useWidgetDragEndHandler.js";
import { DashboardItemPathAndSizeProvider } from "../dashboard/components/DashboardItemPathAndSizeContext.js";
import { shouldShowRowEndDropZone } from "./dragAndDrop/draggableWidget/RowEndHotspot.js";
import { HoverDetector } from "./dragAndDrop/Resize/HoverDetector.js";
import { useWidthValidation } from "./DefaultDashboardLayoutRenderer/useItemWidthValidation.js";
import { useWidgetExportData } from "../export/index.js";

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
export const DashboardLayoutWidget: IDashboardLayoutWidgetRenderer<
    ExtendedDashboardWidget,
    Pick<IDashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange" | "rowIndex">
> = ({ item, DefaultWidgetRenderer, onDrill, onFiltersChange, onError, getLayoutDimensions, rowIndex }) => {
    const screen = useScreenSize();
    const dispatch = useDashboardDispatch();
    const insights = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const isExportMode = useDashboardSelector(selectIsInExportMode);
    const isExport = useDashboardSelector(selectIsExport);
    const isSnapshotAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);

    const handleDragEnd = useWidgetDragEndHandler();

    // TODO: we should probably do something more meaningful when item has no widget; should that even
    //  be allowed? undefined widget will make things explode down the line away so..
    const widget = item.widget()!;
    const isCustom = isCustomWidget(widget);
    const isDraggableWidgetType = !(isPlaceholderWidget(widget) || isCustom);
    const { isSelected } = useWidgetSelection(widget.ref);
    const isRichText = isRichTextWidget(widget);
    const isRichTextWidgetInEditState = isSelected && isRichText;
    const isNestedLayout = isExtendedDashboardLayoutWidget(widget);
    const exportData = useWidgetExportData(widget);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                return createDraggableItem(item, insights, settings);
            },
            canDrag: isInEditMode && isDraggableWidgetType && !isRichTextWidgetInEditState,
            dragStart: (item) => {
                dispatch(uiActions.setDraggingWidgetSource(item));
            },
            dragEnd: handleDragEnd,
        },
        [item, insights, isInEditMode, isDraggableWidgetType, isRichTextWidgetInEditState],
    );

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    const currentSize = item.size()[screen]!;
    const minHeight = calculateWidgetMinHeight(item.raw(), currentSize, insights, settings, isExportMode);
    const height =
        currentSize.heightAsRatio && !currentSize.gridHeight
            ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen)
            : undefined;

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
    function getWidthInPx(): number {
        return contentRef?.current
            ? contentRef.current.getBoundingClientRect().width
            : DEFAULT_COLUMN_CLIENT_WIDTH;
    }

    function getHeightInPx(): number {
        return contentRef?.current
            ? contentRef.current.getBoundingClientRect().height
            : DEFAULT_WIDTH_RESIZER_HEIGHT;
    }

    function getGridColumnWidth(): number {
        const columnWidthInGC = item.sizeForScreen(screen)?.gridWidth as number;
        const columnWidthInPx = getWidthInPx();
        return (columnWidthInPx + 20) / columnWidthInGC;
    }

    const canShowHotspot = isInEditMode && !isDragging;

    const className = cx({
        "custom-height": enableWidgetCustomHeight,
        "gd-nested-layout-widget-renderer": isNestedLayout,
    });

    const hotspotClassNames = cx({
        "gd-nested-layout-hotspot": isNestedLayout,
        "gd-first-container-row-dropzone": rowIndex === 0,
    });

    const remainingGridWidth = isCustomWidget(widget) ? 0 : getRemainingWidthInRow(item, screen, rowIndex);

    const { isValid, parentWidth } = useWidthValidation(item.size());

    if (!isValid) {
        console.error(
            `DashboardLayoutWidget: Widget ID: ${widget.identifier} has width set to ${currentSize.gridWidth} which is bigger than the parent container's width ${parentWidth}!`,
        );
    }

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
            <div
                ref={dragRef}
                className={cx([
                    "dashboard-widget-draggable-wrapper",
                    {
                        "gd-custom-widget-export": isCustom && isExport,
                        "gd-nested-layout-widget-wrapper": isNestedLayout,
                        "gd-widget-export": isSnapshotAccessibilityEnabled && isExport,
                    },
                ])}
            >
                {canShowHotspot && !isAnyPlaceholderWidget(widget) && !isCustomWidget(widget) ? (
                    <Hotspot dropZoneType="prev" layoutPath={item.index()} classNames={hotspotClassNames} />
                ) : null}
                <DashboardItemPathAndSizeProvider itemPath={item.index()} itemSize={item.size()}>
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
                {canShowHotspot && !isAnyPlaceholderWidget(widget) && isActive ? (
                    <ResizeOverlay
                        isActive={isActive}
                        isResizingColumnOrRow={isResizingColumnOrRow}
                        reachedWidthLimit={widthLimitReached}
                        reachedHeightLimit={heightLimitReached}
                        isOverNestedLayout={isNestedLayout}
                        isInFirstRow={rowIndex === 0}
                    />
                ) : null}
                {canShowHotspot && !isAnyPlaceholderWidget(widget) ? (
                    <>
                        {isCustomWidget(widget) ? null : (
                            <>
                                <Hotspot
                                    dropZoneType="next"
                                    layoutPath={item.index()}
                                    classNames={hotspotClassNames}
                                    hideBorder={
                                        (item.isLastInSection() || item.isLastInRow(screen)) &&
                                        shouldShowRowEndDropZone(remainingGridWidth)
                                    }
                                />
                            </>
                        )}
                    </>
                ) : null}
            </div>
            {canShowHotspot && !isAnyPlaceholderWidget(widget) ? (
                <>
                    {isCustomWidget(widget) ? null : (
                        <>
                            <WidthResizerHotspot
                                item={item}
                                getGridColumnHeightInPx={getHeightInPx}
                                getGridColumnWidth={getGridColumnWidth}
                                getLayoutDimensions={getLayoutDimensions}
                                rowIndex={rowIndex}
                            />
                        </>
                    )}
                </>
            ) : null}

            <DashboardItemOverlay
                type="column"
                onHide={() =>
                    dispatch(
                        uiActions.toggleWidgetsOverlay({
                            refs: [item.ref()],
                            visible: false,
                        }),
                    )
                }
                render={
                    Boolean(isInEditMode && overlayShow) && !sectionModifications.includes("insertedByPlugin")
                }
                modifications={itemModifications}
            />
        </DefaultWidgetRenderer>
    );
};

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
