// (C) 2020-2023 GoodData Corporation
import {
    IDashboardLayoutSizeByScreenSize,
    IInsight,
    ISettings,
    isInsightWidget,
    isKpiWidget,
} from "@gooddata/sdk-model";
import { IVisualizationSizeInfo, WIDGET_DROPZONE_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
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
    selectIsExport,
} from "../../model/index.js";
import { isAnyPlaceholderWidget, isPlaceholderWidget } from "../../widgets/index.js";
import { getSizeInfo, calculateWidgetMinHeight } from "../../_staging/layout/sizing.js";
import { getLayoutCoordinates } from "../../_staging/layout/coordinates.js";
import { ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { useDashboardComponentsContext } from "../dashboardContexts/index.js";
import {
    BaseDraggableLayoutItemSize,
    DraggableLayoutItem,
    Hotspot,
    ResizeOverlay,
    useDashboardDrag,
    useResizeItemStatus,
    useWidgetDragEndHandler,
    WidthResizerHotspot,
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

/**
 * Tests in KD require widget index for css selectors.
 * Widget index equals to the widget order in the layout.
 * Also placeholders are ignored for this.
 */
function getWidgetIndex(item: IDashboardLayoutItemFacade<ExtendedDashboardWidget>): number {
    const sectionIndex = item.section().index();
    const isIgnoredForIndexes = (widget: ExtendedDashboardWidget | undefined) => {
        return !widget || isAnyPlaceholderWidget(widget);
    };

    let itemsInSectionsBefore = 0;
    for (let i = 0; i < sectionIndex; i += 1) {
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
        .filter((i) => i.index() < item.index() && isIgnoredForIndexes(i.widget())).length;
    return itemsInSectionsBefore + item.index() - ignoredWidgetsBeforeItemCount;
}

/**
 * @internal
 */
export const DashboardLayoutWidget: IDashboardLayoutWidgetRenderer<
    ExtendedDashboardWidget,
    Pick<IDashboardWidgetProps, "onError" | "onDrill" | "onFiltersChange">
> = (props) => {
    const { item, screen, DefaultWidgetRenderer, onDrill, onFiltersChange, onError, getLayoutDimensions } =
        props;

    const dispatch = useDashboardDispatch();
    const insights = useDashboardSelector(selectInsightsMap);
    const settings = useDashboardSelector(selectSettings);
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const isExport = useDashboardSelector(selectIsExport);
    const enableWidgetCustomHeight = useDashboardSelector(selectEnableWidgetCustomHeight);

    const handleDragEnd = useWidgetDragEndHandler();

    // TODO: we should probably do something more meaningful when item has no widget; should that even
    //  be allowed? undefined widget will make things explode down the line away so..
    const widget = item.widget()!;
    const isCustom = isCustomWidget(widget);
    const isDraggableWidgetType = !(isPlaceholderWidget(widget) || isCustom);

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                return createDraggableItem(item, insights, settings);
            },
            canDrag: isInEditMode && isDraggableWidgetType,
            dragStart: (item) => {
                dispatch(uiActions.setDraggingWidgetSource(item));
            },
            dragEnd: handleDragEnd,
        },
        [item, insights, isInEditMode],
    );

    const { ErrorComponent, LoadingComponent } = useDashboardComponentsContext();

    const currentSize = item.size()[screen]!;
    const minHeight = calculateWidgetMinHeight(widget, currentSize, insights, settings);
    const height =
        currentSize.heightAsRatio && !currentSize.gridHeight
            ? getDashboardLayoutItemHeightForRatioAndScreen(currentSize, screen)
            : undefined;

    const allowOverflow = !!currentSize.heightAsRatio;
    const className = enableWidgetCustomHeight ? "custom-height" : undefined;
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
        return columnWidthInPx / columnWidthInGC;
    }

    const canShowHotspot = isInEditMode && !isDragging;

    return (
        <DefaultWidgetRenderer
            DefaultWidgetRenderer={DefaultWidgetRenderer}
            item={item}
            screen={screen}
            allowOverflow={allowOverflow}
            height={height}
            minHeight={minHeight}
            className={className}
            contentRef={contentRef}
            getLayoutDimensions={getLayoutDimensions}
        >
            <div
                ref={dragRef}
                className={cx([
                    "dashboard-widget-draggable-wrapper",
                    { "gd-custom-widget-export": isCustom && isExport },
                ])}
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
            </div>

            {canShowHotspot && !isAnyPlaceholderWidget(widget) ? (
                <>
                    <ResizeOverlay
                        isActive={isActive}
                        isResizingColumnOrRow={isResizingColumnOrRow}
                        reachedWidthLimit={widthLimitReached}
                        reachedHeightLimit={heightLimitReached}
                    />
                    {!isCustomWidget(widget) ? (
                        <>
                            <Hotspot
                                dropZoneType="prev"
                                itemIndex={item.index()}
                                sectionIndex={item.section().index()}
                                isLastInSection={false}
                            />
                            <Hotspot
                                dropZoneType="next"
                                itemIndex={item.index()}
                                sectionIndex={item.section().index()}
                                isLastInSection={item.isLast()}
                            />
                            <WidthResizerHotspot
                                item={item}
                                screen={screen}
                                getGridColumnHeightInPx={getHeightInPx}
                                getGridColumnWidth={getGridColumnWidth}
                                getLayoutDimensions={getLayoutDimensions}
                            />
                        </>
                    ) : null}
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

    const { sectionIndex, itemIndex } = getLayoutCoordinates(item);
    const size = item.size();

    const isOnlyItemInSection = item.section().items().count() === 1;

    if (isKpiWidget(widget)) {
        const sizeInfo = getSizeInfo(settings, "kpi", widget.kpi);

        return {
            type: "kpi",
            kpi: widget.kpi,
            title: widget.title,
            sectionIndex,
            itemIndex,
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else if (isInsightWidget(widget)) {
        const insight = insights.get(widget.insight)!;
        const sizeInfo = getSizeInfo(settings, "kpi", insight);

        return {
            type: "insight",
            insight,
            sectionIndex,
            itemIndex,
            title: widget.title,
            isOnlyItemInSection,
            size: getFilledSize(size, sizeInfo),
        };
    } else {
        return {
            type: widget.type,
            widget,
            sectionIndex,
            itemIndex,
            title: "",
            isOnlyItemInSection,
            size: getFilledSize(size),
        };
    }
}
