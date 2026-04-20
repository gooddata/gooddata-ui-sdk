// (C) 2019-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutViewSectionHeader } from "./DashboardLayoutViewSectionHeaderRenderer.js";
import { type IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";

export function DashboardLayoutSectionHeaderRenderer({
    section,
    parentLayoutItemSize,
}: IDashboardLayoutSectionHeaderRenderProps<unknown>): ReactElement | null {
    const sectionHeader = section.header();
    const screen = useScreenSize();
    const gridWidth = determineWidthForScreen(screen, parentLayoutItemSize);
    const emptyItem = useMemo(() => {
        return buildEmptyItemFacadeWithSetSize(gridWidth, section.index());
    }, [gridWidth, section]);

    if (!sectionHeader) {
        return null;
    }
    return (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
            // header is always at the top, this information is not usable by it but required by
            // the shared interface with widget
            rowIndex={-1}
        >
            <DashboardLayoutViewSectionHeader section={section} />
        </DashboardLayoutItemViewRenderer>
    );
}
