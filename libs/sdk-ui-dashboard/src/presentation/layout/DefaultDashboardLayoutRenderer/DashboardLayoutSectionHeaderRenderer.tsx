// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer";
import { DashboardLayoutSectionHeader } from "./DashboardLayoutSectionHeader";
import { IDashboardLayoutSectionHeaderRenderProps } from "./interfaces";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";

const emptyItemFacadeWithFullSize: IDashboardLayoutItemFacade<unknown> = {
    index: () => 0,
    raw: () => null as any, // TODO: should we allow this in the interface?
    widget: () => null,
    section: () => undefined as any, // TODO: should we allow this in the interface?
    size: () => ({ xl: { gridWidth: 12 } }),
    sizeForScreen: () => ({ gridWidth: 12 }),
    isLast: () => true,
    widgetEquals: () => false,
    widgetIs: () => false,
    hasSizeForScreen: () => false,
    indexIs: () => false,
    isFirst: () => true,
    test: () => false,
    testRaw: () => false,
    isCustomItem: () => false,
    isInsightWidgetItem: () => false,
    isInsightWidgetDefinitionItem: () => false,
    isKpiWidgetItem: () => false,
    isKpiWidgetDefinitionItem: () => false,
    isLayoutItem: () => false,
    isWidgetItem: () => false,
    isWidgetDefinitionItem: () => false,
    isWidgetItemWithInsightRef: () => false,
    isWidgetItemWithKpiRef: () => false,
    isWidgetItemWithRef: () => false,
    isEmpty: () => false,
};

export function DashboardLayoutSectionHeaderRenderer(
    props: IDashboardLayoutSectionHeaderRenderProps<any>,
): JSX.Element | null {
    const { section, screen } = props;
    const sectionHeader = section.header();

    return sectionHeader ? (
        <DashboardLayoutItemRenderer
            DefaultItemRenderer={DashboardLayoutItemRenderer}
            item={emptyItemFacadeWithFullSize}
            screen={screen}
        >
            <DashboardLayoutSectionHeader
                title={sectionHeader.title}
                description={sectionHeader.description}
            />
        </DashboardLayoutItemRenderer>
    ) : null;
}
