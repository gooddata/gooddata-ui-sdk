// (C) 2022-2024 GoodData Corporation

import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { ILayoutSectionPath } from "../../../../types.js";
import { asLayoutItemPath } from "../../../../_staging/layout/coordinates.js";

export const buildEmptyItemFacadeWithSetSize = (
    gridWidth: number,
    sectionIndex: ILayoutSectionPath,
): IDashboardLayoutItemFacade<unknown> => ({
    index: () => asLayoutItemPath(sectionIndex, 0),
    raw: () => null as any, // TODO: should we allow this in the interface?
    widget: () => null,
    ref: () => undefined,
    section: () => undefined as any, // TODO: should we allow this in the interface?
    size: () => ({ xl: { gridWidth } }),
    sizeForScreen: () => ({ gridWidth }),
    sizeForScreenWithFallback: () => ({ gridWidth }),
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
});
