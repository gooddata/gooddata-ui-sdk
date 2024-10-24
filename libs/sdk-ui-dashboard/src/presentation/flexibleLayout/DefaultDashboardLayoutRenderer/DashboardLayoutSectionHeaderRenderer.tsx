// (C) 2019-2024 GoodData Corporation

import React, { useMemo } from "react";

import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { determineSizeForScreenFromSizingLayoutItem } from "./utils/sizing.js";

export function DashboardLayoutSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen, parentLayoutItem } = props;
    const sectionHeader = section.header();
    const gridWidth = determineSizeForScreenFromSizingLayoutItem(screen, parentLayoutItem);
    const emptyItem = useMemo(() => {
        return buildEmptyItemFacadeWithSetSize(gridWidth);
    }, [gridWidth]);

    return sectionHeader ? (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader.title}
                description={sectionHeader.description}
            />
        </DashboardLayoutItemViewRenderer>
    ) : null;
}
