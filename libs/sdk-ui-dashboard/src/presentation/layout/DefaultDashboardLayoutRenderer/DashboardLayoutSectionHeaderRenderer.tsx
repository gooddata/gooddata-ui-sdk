// (C) 2019-2025 GoodData Corporation
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { emptyItemFacadeWithFullSize } from "./utils/emptyFacade.js";

export function DashboardLayoutSectionHeaderRenderer(props: IDashboardLayoutSectionHeaderRenderProps<any>) {
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
