// (C) 2007-2024 GoodData Corporation
import { IDashboardWidget, ScreenSize } from "@gooddata/sdk-model";
import cx from "classnames";
import React from "react";

import { Hotspot } from "./Hotspot.js";
import { WidgetDropZoneColumn } from "./WidgetDropZoneColumn.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/legacyFluidLayout/index.js";
import { useDashboardSelector, selectIsInEditMode } from "../../../../model/index.js";
import { getLayoutCoordinates } from "../../../../_staging/layout/coordinates.js";

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;

    screen: ScreenSize;
};

export const RowEndHotspot = (props: RowEndHotspotProps<unknown>) => {
    const { item, screen } = props;

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const { sectionIndex, itemIndex } = getLayoutCoordinates(item);

    const isLastInSection = item.isLast();
    const showEndingHotspot = isLastInSection && isInEditMode;

    if (!showEndingHotspot) {
        return null;
    }

    return (
        <>
            <WidgetDropZoneColumn
                screen={screen}
                sectionIndex={sectionIndex}
                itemIndex={itemIndex + 1}
                isLastInSection={true}
            />
            <div
                className={cx(
                    "gd-fluidlayout-column",
                    "gd-fluidlayout-column-row-end-hotspot",
                    "s-fluid-layout-column",
                    `s-fluid-layout-screen-${screen}`,
                )}
            >
                <Hotspot
                    dropZoneType="next"
                    isEndingHotspot
                    itemIndex={itemIndex}
                    sectionIndex={sectionIndex}
                    isLastInSection={item.isLast()}
                />
            </div>
        </>
    );
};
