// (C) 2007-2024 GoodData Corporation
import { IDashboardWidget } from "@gooddata/sdk-model";
import cx from "classnames";
import React from "react";

import { selectIsInEditMode, useDashboardSelector } from "../../../../model/index.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";

import { Hotspot } from "./Hotspot.js";
import { updateItem } from "../../../../_staging/layout/coordinates.js";

export type RowEndHotspotProps<TWidget = IDashboardWidget> = {
    item: IDashboardLayoutItemFacade<TWidget>;
};

export const RowEndHotspot = (props: RowEndHotspotProps<unknown>) => {
    const { item } = props;

    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const layoutPath = item.index();

    const isLastInSection = item.isLast();
    const showEndingHotspot = isLastInSection && isInEditMode;

    if (!showEndingHotspot) {
        return null;
    }

    const layoutPathForEndHotspot = updateItem(
        layoutPath,
        layoutPath[layoutPath.length - 1].sectionIndex,
        layoutPath[layoutPath.length - 1].itemIndex + 1,
    ); // increment item index manually as end hotspot is rendered as prev type

    return (
        <>
            <div
                className={cx(
                    "gd-fluidlayout-column",
                    "gd-fluidlayout-column-row-end-hotspot",
                    "s-fluid-layout-column",
                )}
            >
                <Hotspot
                    dropZoneType="prev"
                    isEndingHotspot
                    layoutPath={layoutPathForEndHotspot}
                    isLastInSection={item.isLast()}
                />
            </div>
        </>
    );
};
