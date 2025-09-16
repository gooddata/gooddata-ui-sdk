// (C) 2019-2025 GoodData Corporation

import { ReactElement, useMemo } from "react";

import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutViewSectionHeader } from "./DashboardLayoutViewSectionHeaderRenderer.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

export function DashboardLayoutSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<unknown>,
): ReactElement | null {
    const { section, parentLayoutItemSize } = props;
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
