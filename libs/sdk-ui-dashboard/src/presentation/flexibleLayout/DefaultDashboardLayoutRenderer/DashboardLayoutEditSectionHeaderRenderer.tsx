// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import { ReactElement } from "react";

import { DashboardLayoutEditSectionHeader } from "./DashboardLayoutEditSectionHeader.js";
import { DashboardLayoutItemViewRenderer } from "./DashboardLayoutItemViewRenderer.js";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces.js";
import { buildEmptyItemFacadeWithSetSize } from "./utils/emptyFacade.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { isInitialPlaceholderWidget } from "../../../widgets/index.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

const containsOnlyPlaceholders = (section: IDashboardLayoutSectionFacade<any>) => {
    return section.items().every((widget) => isInitialPlaceholderWidget(widget.widget()));
};

export function DashboardLayoutEditSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): ReactElement | null {
    const { section, parentLayoutItemSize } = props;
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
