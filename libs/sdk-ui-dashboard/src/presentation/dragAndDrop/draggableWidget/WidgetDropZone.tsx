// (C) 2022 GoodData Corporation
import React from "react";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import { getInsightSizeInfo } from "@gooddata/sdk-ui-ext";
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
import { isInsightPlaceholderWidget } from "../../../widgets/placeholders/types";

export const WidgetDropZone: CustomDashboardWidgetComponent = (props) => {
    const { widget } = props;
    invariant(isInsightPlaceholderWidget(widget));

    const { sectionIndex, itemIndex, isLastInSection } = widget;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const [, dropRef] = useDashboardDrop(
        "insightListItem",
        {
            drop: ({ insight }) => {
                const sizeInfo = getInsightSizeInfo(insight, settings);
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
