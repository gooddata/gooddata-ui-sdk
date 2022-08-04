// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { getDropZoneDebugStyle } from "../debug";
import {
    addSectionItem,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    placeholdersActions,
    selectWidgetPlaceholder,
    IWidgetPlaceholderSpec,
    dispatchAndWaitFor,
} from "../../../model";
import stringify from "json-stable-stringify";
import { useDashboardDrop } from "../useDashboardDrop";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import { isInsightDraggableListItem, isKpiPlaceholderDraggableItem } from "../types";
import { getSizeInfo } from "../../../model/layout";

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

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    dispatchAndWaitFor(
                        dispatch,
                        addSectionItem(sectionIndex, targetItemIndex, {
                            type: "IDashboardLayoutItem",
                            widget: {
                                type: "insight",
                                insight: insightRef(insight),
                                ignoreDashboardFilters: [],
                                drills: [],
                                title: insightTitle(insight),
                                description: "",
                                configuration: { hideTitle: false },
                                properties: {},
                            },
                            size: {
                                xl: {
                                    gridHeight: sizeInfo.height.default,
                                    gridWidth: sizeInfo.width.default!,
                                },
                            },
                        }),
                    ).then(() => {
                        dispatch(placeholdersActions.clearWidgetPlaceholder());
                    });
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    const sizeInfo = getSizeInfo(settings, "kpi");
                    const placeholderSpec: IWidgetPlaceholderSpec = {
                        itemIndex: targetItemIndex,
                        sectionIndex,
                        size: {
                            height: sizeInfo.height.default!,
                            width: sizeInfo.width.default!,
                        },
                        type: "kpi",
                    };
                    dispatch(placeholdersActions.setWidgetPlaceholder(placeholderSpec));
                }
            },
            hover: (item) => {
                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    const placeholderSpec: IWidgetPlaceholderSpec = {
                        itemIndex: targetItemIndex,
                        sectionIndex,
                        size: {
                            height: sizeInfo.height.default!,
                            width: sizeInfo.width.default!,
                        },
                        type: "widget",
                    };
                    if (stringify(placeholderSpec) !== stringify(widgetPlaceholder)) {
                        dispatch(placeholdersActions.setWidgetPlaceholder(placeholderSpec));
                    }
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    const sizeInfo = getSizeInfo(settings, "kpi");
                    const placeholderSpec: IWidgetPlaceholderSpec = {
                        itemIndex: targetItemIndex,
                        sectionIndex,
                        size: {
                            height: sizeInfo.height.default!,
                            width: sizeInfo.width.default!,
                        },
                        type: "widget",
                    };
                    if (stringify(placeholderSpec) !== stringify(widgetPlaceholder)) {
                        dispatch(placeholdersActions.setWidgetPlaceholder(placeholderSpec));
                    }
                }
            },
        },
        [dispatch, widgetPlaceholder, settings, targetItemIndex, sectionIndex],
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
