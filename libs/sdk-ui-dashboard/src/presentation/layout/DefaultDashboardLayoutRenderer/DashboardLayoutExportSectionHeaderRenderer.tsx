// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade.js";

export function DashboardLayoutExportSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen, exportData } = props;
    const sectionHeader = section.header();

    return sectionHeader ? (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItemFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader.title}
                description={sectionHeader.description}
                exportData={exportData}
            />
        </DashboardLayoutItemViewRenderer>
    ) : null;
}
