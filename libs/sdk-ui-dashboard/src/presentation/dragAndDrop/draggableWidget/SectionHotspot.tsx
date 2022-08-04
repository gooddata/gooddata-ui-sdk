// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { getDropZoneDebugStyle } from "../debug";
import {
    addLayoutSection,
    dispatchAndWaitFor,
    placeholdersActions,
    selectIsWidgetPlaceholderShown,
    selectSettings,
    uiActions,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { SectionDropZoneBox } from "./SectionDropZoneBox";
import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorder";
import { idRef, insightRef, insightTitle } from "@gooddata/sdk-model";
import { isInsightDraggableListItem, isKpiPlaceholderDraggableItem } from "../../dragAndDrop/types";
import { getSizeInfo } from "../../../model/layout";
import { KPI_PLACEHOLDER_WIDGET_ID } from "../../../widgets/placeholders/types";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: number;
    targetPosition?: RowPosition;
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = (props) => {
    const { index, targetPosition } = props;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const isWidgetPlaceholderShown = useDashboardSelector(selectIsWidgetPlaceholderShown);

    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    const { insight } = item;
                    const sizeInfo = getSizeInfo(settings, "insight", insight);
                    dispatch(
                        addLayoutSection(index, {}, [
                            {
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
                            },
                        ]),
                    );
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    const sizeInfo = getSizeInfo(settings, "kpi");

                    dispatchAndWaitFor(dispatch, addLayoutSection(index, {})).then(() => {
                        dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
                        dispatch(uiActions.setConfigurationPanelOpened(true));
                        dispatch(
                            placeholdersActions.setWidgetPlaceholder({
                                itemIndex: 0,
                                sectionIndex: index,
                                size: {
                                    height: sizeInfo.height.default!,
                                    width: sizeInfo.width.default!,
                                },
                                type: "kpi",
                            }),
                        );
                    });
                }
            },
            hover: () => {
                if (isWidgetPlaceholderShown) {
                    dispatch(placeholdersActions.clearWidgetPlaceholder());
                }
            },
        },
        [dispatch, isWidgetPlaceholderShown, settings],
    );

    if (!canDrop) {
        return null;
    }

    const isLast = targetPosition === "below";

    const debugStyle = getDropZoneDebugStyle({ isOver });

    return (
        <div
            className={cx("row-hotspot-container", {
                last: isLast && canDrop,
                "s-last-drop-position": isLast && canDrop,
                hidden: !canDrop,
            })}
        >
            <div className={cx("row-hotspot", { hidden: !canDrop })} style={{ ...debugStyle }} ref={dropRef}>
                <div className="new-row-dropzone">
                    {isOver ? (
                        <SectionDropZoneBox isOver={isOver} />
                    ) : (
                        <DashboardLayoutSectionBorderLine position="top" status="muted" />
                    )}
                </div>
            </div>
        </div>
    );
};
