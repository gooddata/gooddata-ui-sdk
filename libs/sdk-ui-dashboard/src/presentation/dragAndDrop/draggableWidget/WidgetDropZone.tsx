// (C) 2022 GoodData Corporation
import React from "react";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import invariant from "ts-invariant";

import { CustomDashboardWidgetComponent } from "../../widget/types";
import {
    addSectionItem,
    dispatchAndWaitFor,
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
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";

export const WidgetDropZone: CustomDashboardWidgetComponent = (props) => {
    const { widget } = props;
    invariant(isPlaceholderWidget(widget));

    const { sectionIndex, itemIndex, isLastInSection } = widget;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

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
                    handleKpiPlaceholderDrop(sectionIndex, itemIndex);
                }
            },
        },
        [dispatch, settings, sectionIndex, itemIndex, handleKpiPlaceholderDrop],
    );

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
};
