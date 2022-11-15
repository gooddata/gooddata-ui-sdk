// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade";

export function DashboardLayoutSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
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
            />
        </DashboardLayoutItemViewRenderer>
    ) : null;
}
