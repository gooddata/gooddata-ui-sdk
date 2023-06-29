// (C) 2007-2022 GoodData Corporation
import React from "react";

import {
    DashboardLayoutItemViewRenderer,
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionHeaderRenderProps,
} from "../../../DefaultDashboardLayoutRenderer/index.js";
import { DashboardEditLayoutSectionHeader } from "./DashboardEditLayoutSectionHeader.js";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";

type IDashboardLayoutSectionHeaderRendererOwnProps =
    IDashboardLayoutSectionHeaderRenderProps<IDashboardEditLayoutContent>;

type IDashboardLayoutSectionHeaderRendererProps = IDashboardLayoutSectionHeaderRendererOwnProps;

const emptyItemFacadeWithFullSize: IDashboardLayoutItemFacade<any> = {
    ref: () => undefined,
    index: () => 0,
    // @ts-expect-error this is mock
    raw: () => null,
    widget: () => null,
    // @ts-expect-error this is mock
    section: () => undefined,
    size: () => ({ xl: { gridWidth: 12 } }),
    sizeForScreen: () => ({ gridWidth: 12 }),
    isLast: () => true,
    widgetEquals: () => false,
    widgetIs: () => false,
    isEmpty: () => false,
    hasSizeForScreen: () => false,
    indexIs: () => false,
    isFirst: () => true,
    test: () => false,
    testRaw: () => false,
    isCustomItem: () => false,
    isInsightWidgetDefinitionItem: () => false,
    isInsightWidgetItem: () => false,
    isKpiWidgetDefinitionItem: () => false,
    isKpiWidgetItem: () => false,
    isLayoutItem: () => false,
    isWidgetDefinitionItem: () => false,
    isWidgetItem: () => false,
    isWidgetItemWithInsightRef: () => false,
    isWidgetItemWithKpiRef: () => false,
    isWidgetItemWithRef: () => false,
};

export const RenderDashboardEditLayoutSectionHeaderRenderer: React.FC<
    IDashboardLayoutSectionHeaderRendererProps
> = (props) => {
    const { section, screen, DefaultSectionHeaderRenderer } = props;

    const rowId = "rowId";
    const hasJustOneDropZone = false;
    const isDashboardEditing = true; // TODO state?

    const header = section.header();

    if (hasJustOneDropZone) {
        return null;
    }

    if (isDashboardEditing) {
        return (
            <DashboardLayoutItemViewRenderer
                DefaultItemRenderer={DashboardLayoutItemViewRenderer}
                item={emptyItemFacadeWithFullSize}
                screen={screen}
            >
                <DashboardEditLayoutSectionHeader
                    title={header?.title || ""}
                    description={header?.description || ""}
                    rowId={rowId}
                />
            </DashboardLayoutItemViewRenderer>
        );
    }

    return <DefaultSectionHeaderRenderer {...props} />;
};

export const DashboardEditLayoutSectionHeaderRenderer = RenderDashboardEditLayoutSectionHeaderRenderer;
