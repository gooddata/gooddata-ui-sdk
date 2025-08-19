// (C) 2022-2025 GoodData Corporation

import { ScreenSize } from "@gooddata/sdk-model";

import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/index.js";
import { asLayoutItemPath } from "../../../../_staging/layout/coordinates.js";
import { ILayoutSectionPath } from "../../../../types.js";

export const buildEmptyItemFacadeWithSetSize = (
    gridWidth: number,
    sectionIndex: ILayoutSectionPath,
): IDashboardLayoutItemFacade<unknown> =>
    ({
        index: () => asLayoutItemPath(sectionIndex, 0),
        raw: () => null as any, // TODO: should we allow this in the interface?
        widget: () => null,
        ref: () => undefined,
        section: () => undefined as any, // TODO: should we allow this in the interface?
        size: () => ({ xl: { gridWidth } }),
        sizeForScreen: () => ({ gridWidth }),
        sizeForScreenWithFallback: () => ({ gridWidth }),
        isLastInSection: () => true,
        isLastInRow: (_screen: ScreenSize) => true,
        widgetEquals: () => false,
        widgetIs: () => false,
        hasSizeForScreen: () => false,
        indexIs: () => false,
        isFirstInSection: () => true,
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
    }) as unknown as IDashboardLayoutItemFacade<unknown>;
