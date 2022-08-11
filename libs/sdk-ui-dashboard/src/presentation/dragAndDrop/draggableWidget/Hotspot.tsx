// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { getDropZoneDebugStyle } from "../debug";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    selectWidgetPlaceholder,
    addSectionItem,
    removeSectionItem,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import {
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types";
import { getInsightPlaceholderSizeInfo, getSizeInfo } from "../../../_staging/layout/sizing";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";
import { newPlaceholderWidget } from "../../../widgets";

interface IHotspotProps {
    sectionIndex: number;
    itemIndex: number;
    classNames?: string;
    dropZoneType: "prev" | "next";
}

export const Hotspot: React.FC<IHotspotProps> = (props) => {
    const { itemIndex, sectionIndex, classNames, dropZoneType } = props;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    // for "next" we need to add the item after the current index, for "prev" on the current one
    const targetItemIndex = dropZoneType === "next" ? itemIndex + 1 : itemIndex;

    const handleInsightListItemDrop = useInsightListItemDropHandler();
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const needsToAddWidgetDropzone =
        !widgetPlaceholder || // first placeholder ever
        widgetPlaceholder.sectionIndex !== sectionIndex || // or different section
        (dropZoneType === "prev" && widgetPlaceholder.itemIndex !== itemIndex - 1) || // or not immediately before for prev hotspot
        (dropZoneType === "next" && widgetPlaceholder.itemIndex !== itemIndex + 1); // or not immediately after for next hotspot

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop(sectionIndex, targetItemIndex);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop(sectionIndex, targetItemIndex);
                }
            },
            hover: (item) => {
                if (!needsToAddWidgetDropzone) {
                    return;
                }

                // we will definitely be adding a new placeholder, so remove the current one if any
                if (widgetPlaceholder) {
                    dispatch(removeSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex));
                }

                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    const placeholderSpec = newPlaceholderWidget(
                        sectionIndex, // TODO get rid of this, get the coords using widget ref
                        targetItemIndex,
                        false, // TODO how to get this? should WidgetDropZone get this instead?
                    );
                    dispatch(
                        addSectionItem(sectionIndex, targetItemIndex, {
                            type: "IDashboardLayoutItem",
                            size: {
                                xl: {
                                    gridHeight: sizeInfo.height.default!,
                                    gridWidth: sizeInfo.width.default!,
                                },
                            },
                            widget: placeholderSpec,
                        }),
                    );
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    const sizeInfo = getSizeInfo(settings, "kpi");
                    const placeholderSpec = newPlaceholderWidget(
                        sectionIndex, // TODO get rid of this, get the coords using widget ref
                        targetItemIndex,
                        false, // TODO how to get this? should WidgetDropZone get this instead?
                    );
                    dispatch(
                        addSectionItem(sectionIndex, targetItemIndex, {
                            type: "IDashboardLayoutItem",
                            size: {
                                xl: {
                                    gridHeight: sizeInfo.height.default!,
                                    gridWidth: sizeInfo.width.default!,
                                },
                            },
                            widget: placeholderSpec,
                        }),
                    );
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    const sizeInfo = getInsightPlaceholderSizeInfo(settings);
                    const placeholderSpec = newPlaceholderWidget(
                        sectionIndex, // TODO get rid of this, get the coords using widget ref
                        targetItemIndex,
                        false, // TODO how to get this? should WidgetDropZone get this instead?
                    );
                    dispatch(
                        addSectionItem(sectionIndex, targetItemIndex, {
                            type: "IDashboardLayoutItem",
                            size: {
                                xl: {
                                    gridHeight: sizeInfo.height.default!,
                                    gridWidth: sizeInfo.width.default!,
                                },
                            },
                            widget: placeholderSpec,
                        }),
                    );
                }
            },
        },
        [
            dispatch,
            widgetPlaceholder,
            settings,
            targetItemIndex,
            sectionIndex,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleKpiPlaceholderDrop,
        ],
    );

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx(classNames, "dropzone", dropZoneType, { hidden: !canDrop })}
            style={debugStyle}
            ref={dropRef}
        />
    );
};
