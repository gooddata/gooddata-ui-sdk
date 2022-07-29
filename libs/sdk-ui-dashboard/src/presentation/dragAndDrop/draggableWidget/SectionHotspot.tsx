// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { getDropZoneDebugStyle } from "../debug";
import { addLayoutSection, selectSettings, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { SectionDropZoneBox } from "./SectionDropZoneBox";
import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorder";
import { insightRef, insightTitle } from "@gooddata/sdk-model";
import { getInsightSizeInfo } from "@gooddata/sdk-ui-ext";

export type RowPosition = "above" | "below";

interface ISectionHotspotProps {
    index: number;
    targetPosition?: RowPosition;
}

export const SectionHotspot: React.FC<ISectionHotspotProps> = (props) => {
    const { index, targetPosition } = props;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const [{ canDrop, isOver }, dropRef] = useDashboardDrop(
        "insightListItem",
        {
            drop: ({ insight }) => {
                const sizeInfo = getInsightSizeInfo(insight, settings);
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
            },
        },
        [dispatch],
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
