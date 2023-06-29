// (C) 2022 GoodData Corporation

import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/fluidLayout/index.js";

export const emptyItemFacadeWithFullSize: IDashboardLayoutItemFacade<unknown> = {
    index: () => 0,
    raw: () => null as any, // TODO: should we allow this in the interface?
    widget: () => null,
    ref: () => undefined,
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
