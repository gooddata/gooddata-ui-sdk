// (C) 2019-2024 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { useMemo } from "react";
import { GRID_COLUMNS_COUNT } from "./constants.js";
import { implicitLayoutItemSizeFromXlSize } from "./utils/sizing.js";

export function DashboardLayoutSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    // TODO handle undefined size?
    const possibleSectionSizes = implicitLayoutItemSizeFromXlSize(section.raw().size!);
    const sectionSize = possibleSectionSizes[screen];

    const gridWith = sectionSize?.gridWidth ?? GRID_COLUMNS_COUNT;

    const emptyItem = useMemo(() => {
        return buildEmptyItemFacadeWithSetSize(gridWith);
    }, [gridWith]);

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
