// (C) 2022 GoodData Corporation
import React from "react";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { CustomDashboardWidgetComponent } from "../../widget/types";
import {
    addSectionItem,
    dispatchAndWaitFor,
    IWidgetPlaceholderSpec,
    placeholdersActions,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { WidgetDropZoneBox } from "./WidgetDropZoneBox";
import { isPlaceholderWidget } from "../../../widgets/placeholders/types";
import { isInsightDraggableListItem, isKpiPlaceholderDraggableItem } from "../types";
import { getSizeInfo } from "../../../model/layout";

export const WidgetDropZone: CustomDashboardWidgetComponent = (props) => {
    const { widget } = props;
    invariant(isPlaceholderWidget(widget));

    const { sectionIndex, itemIndex, isLastInSection } = widget;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const [, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    dispatchAndWaitFor(
                        dispatch,
                        addSectionItem(sectionIndex, itemIndex, {
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
                        itemIndex,
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
        },
        [dispatch, settings, sectionIndex, itemIndex],
    );

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
};
