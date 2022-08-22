// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import invariant from "ts-invariant";

import { getDropZoneDebugStyle } from "../debug";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    addSectionItem,
    removeSectionItem,
    selectWidgetPlaceholderCoordinates,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import {
    InsightDraggableListItem,
    InsightPlaceholderDraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
    KpiPlaceholderDraggableItem,
} from "../types";
import { getInsightPlaceholderSizeInfo, getSizeInfo } from "../../../_staging/layout/sizing";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";
import { newPlaceholderWidget } from "../../../widgets";
import { ISettings } from "@gooddata/sdk-model";

interface IHotspotProps {
    sectionIndex: number;
    itemIndex: number;
    isLastInSection: boolean;
    classNames?: string;
    dropZoneType: "prev" | "next";
}

function getDraggableItemSizeInfo(
    settings: ISettings,
    item: InsightDraggableListItem | InsightPlaceholderDraggableItem | KpiPlaceholderDraggableItem,
) {
    if (isInsightDraggableListItem(item)) {
        return getSizeInfo(settings, "insight", item.insight);
    }
    if (isKpiPlaceholderDraggableItem(item)) {
        return getSizeInfo(settings, "kpi");
    }
    if (isInsightPlaceholderDraggableItem(item)) {
        return getInsightPlaceholderSizeInfo(settings);
    }
    invariant(false, "unsupported draggable item");
}

export const Hotspot: React.FC<IHotspotProps> = (props) => {
    const { itemIndex, sectionIndex, classNames, dropZoneType } = props;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const widgetPlaceholderCoords = useDashboardSelector(selectWidgetPlaceholderCoordinates);

    // for "next" we need to add the item after the current index, for "prev" on the current one
    const targetItemIndex = dropZoneType === "next" ? itemIndex + 1 : itemIndex;

    const handleInsightListItemDrop = useInsightListItemDropHandler();
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const needsToAddWidgetDropzone =
        !widgetPlaceholderCoords || // first placeholder ever
        widgetPlaceholderCoords.sectionIndex !== sectionIndex || // or different section
        (dropZoneType === "prev" && widgetPlaceholderCoords.itemIndex !== itemIndex - 1) || // or not immediately before for prev hotspot
        (dropZoneType === "next" && widgetPlaceholderCoords.itemIndex !== itemIndex + 1); // or not immediately after for next hotspot

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
            },
            hover: (item) => {
                if (!needsToAddWidgetDropzone) {
                    return;
                }

                // we will definitely be adding a new placeholder, so remove the current one if any
                if (widgetPlaceholderCoords) {
                    dispatch(
                        removeSectionItem(
                            widgetPlaceholderCoords.sectionIndex,
                            widgetPlaceholderCoords.itemIndex,
                        ),
                    );
                }

                const sizeInfo = getDraggableItemSizeInfo(settings, item);

                dispatch(
                    addSectionItem(sectionIndex, targetItemIndex, {
                        type: "IDashboardLayoutItem",
                        size: {
                            xl: {
                                gridHeight: sizeInfo.height.default!,
                                gridWidth: sizeInfo.width.default!,
                            },
                        },
                        widget: newPlaceholderWidget(),
                    }),
                );
            },
        },
        [
            dispatch,
            widgetPlaceholderCoords,
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
