// (C) 2019-2026 GoodData Corporation

import { type ReactElement } from "react";

import { DashboardLayoutEditSectionHeader } from "./DashboardLayoutEditSectionHeader.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { type IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { type IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { isInitialPlaceholderWidget } from "../../../widgets/placeholders/types.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

const containsOnlyPlaceholders = (section: IDashboardLayoutSectionFacade<any>) => {
    return section.items().every((widget) => isInitialPlaceholderWidget(widget.widget()));
};

export function DashboardLayoutEditSectionHeaderRenderer({
    section,
    parentLayoutItemSize,
}: IDashboardLayoutSectionHeaderRenderProps<any>): ReactElement | null {
    const screen = useScreenSize();
    const gridWidth = determineWidthForScreen(screen, parentLayoutItemSize);
    const emptyItem = buildEmptyItemFacadeWithSetSize(gridWidth, section.index());
    const isInitialDropzone = section.isFirst() && containsOnlyPlaceholders(section);

    return (
        <DashboardLayoutItemViewRenderer
            DefaultItemRenderer={DashboardLayoutItemViewRenderer}
            item={emptyItem}
            // header is always at the top, this information is not usable by it but required by
            // the shared interface with widget
            rowIndex={-1}
        >
            <DashboardLayoutEditSectionHeader
                section={section}
                parentLayoutItemSize={parentLayoutItemSize}
                isEmptySection={isInitialDropzone}
            />
        </DashboardLayoutItemViewRenderer>
    );
}
