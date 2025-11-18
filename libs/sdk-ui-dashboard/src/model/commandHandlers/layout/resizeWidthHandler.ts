// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import {
    IDashboardLayout,
    IDashboardLayoutItem,
    IWidget,
    ScreenSize,
    isDashboardLayout,
} from "@gooddata/sdk-model";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { getUpdatedSizesOnly } from "./containerWidthSanitization.js";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/flexibleLayout/config.js";
import {
    getContainerDirectionAtPath,
    getLayoutConfiguration,
} from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import {
    findItem,
    findSection,
    getItemIndex,
    getParentPath,
    getSectionIndex,
    serializeLayoutItemPath,
} from "../../../_staging/layout/coordinates.js";
import { determineWidthForScreen, getMinWidth } from "../../../_staging/layout/sizing.js";
import { ILayoutItemPath } from "../../../types.js";
import { ResizeWidth } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    DashboardLayoutSectionItemWidthResized,
    layoutSectionItemWidthResized,
} from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardWidget, IItemWithWidth } from "../../types/layoutTypes.js";

function validateLayoutIndexes(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    command: ResizeWidth,
) {
    const {
        payload: { itemPath, sectionIndex, itemIndex },
    } = command;

    if (itemPath === undefined) {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        const fromSection = layout.sections[sectionIndex];
        if (!validateItemExists(fromSection, itemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
            );
        }
    } else {
        if (!validateSectionExists(layout, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize item from non-existent section at ${serializeLayoutItemPath(
                    itemPath,
                )}.`,
            );
        }

        const fromSection = findSection(layout, itemPath);
        if (!validateItemExists(fromSection, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize non-existent item from index ${serializeLayoutItemPath(
                    itemPath,
                )}. There are only ${fromSection.items.length} items in this section.`,
            );
        }
    }
}

function processChildren(
    layoutItem: IDashboardLayoutItem<ExtendedDashboardWidget>,
    itemPath: ILayoutItemPath,
    targetItemWidth: number,
): IItemWithWidth[] {
    if (!isDashboardLayout(layoutItem.widget)) {
        return []; // at this point, we only process nested layouts - this is required by the type check
    }
    const parentContainerDirection = getLayoutConfiguration(layoutItem.widget).direction;

    return layoutItem.widget.sections.flatMap((section, sectionIndex) => {
        return section.items.flatMap((item, itemIndex) => {
            const currentPath: ILayoutItemPath = [...itemPath, { sectionIndex, itemIndex }];
            const itemWidth = item.size.xl.gridWidth;
            // Only the column children will get resized to the parent width (including the container itself).
            // The row children will shrink when they are too big for the new parent size, but will never
            // grow, otherwise they would behave as if they were inside the column container.
            const newItemWidth =
                parentContainerDirection === "column"
                    ? targetItemWidth
                    : Math.min(targetItemWidth, itemWidth);
            if (isDashboardLayout(item.widget)) {
                return [
                    { itemPath: currentPath, width: newItemWidth },
                    ...processChildren(item, currentPath, targetItemWidth),
                ];
            }
            return [{ itemPath: currentPath, width: newItemWidth }];
        });
    });
}

function mapNestedItemsToNewWidth(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemPath: ILayoutItemPath,
    newItemWidth: number,
): IItemWithWidth[] {
    const modifiedItem = findItem(layout, itemPath);
    if (isDashboardLayout(modifiedItem.widget)) {
        return processChildren(modifiedItem, itemPath, newItemWidth);
    }
    return [];
}

function findItemsWithChangedWidth(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemPath: ILayoutItemPath,
    newItemWidth: number,
    screen: ScreenSize,
): IItemWithWidth[] {
    const modifiedItemWithNewWidth = { itemPath, width: newItemWidth };
    const nestedItemsWithNewWidth = mapNestedItemsToNewWidth(layout, itemPath, newItemWidth);
    const allItemsWithNewWidth = [modifiedItemWithNewWidth, ...nestedItemsWithNewWidth];
    return getUpdatedSizesOnly(layout, allItemsWithNewWidth, screen);
}

export function* resizeWidthHandler(
    ctx: DashboardContext,
    cmd: ResizeWidth,
): SagaIterator<DashboardLayoutSectionItemWidthResized> {
    const {
        payload: { itemPath, sectionIndex, itemIndex, width },
    } = cmd;

    const layout = yield select(selectLayout);
    const insightsMap = yield select(selectInsightsMap);
    const screen = yield select(selectScreen);
    const settings = yield select(selectSettings);

    validateLayoutIndexes(ctx, layout, cmd);
    validateWidth(ctx, layout, insightsMap, cmd, settings, screen);

    const itemLayoutPath = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;
    const itemsWithChangedWidth = findItemsWithChangedWidth(layout, itemLayoutPath, width, screen);
    if (itemsWithChangedWidth.length > 0) {
        yield put(
            tabsActions.updateWidthOfMultipleItems({
                itemsWithSizes: itemsWithChangedWidth,
            }),
        );
    }

    yield call(resizeParentContainers, getParentPath(itemLayoutPath));

    return layoutSectionItemWidthResized(
        ctx,
        getSectionIndex(itemLayoutPath),
        getItemIndex(itemLayoutPath),
        itemLayoutPath,
        width,
        cmd.correlationId,
    );
}

function validateWidth(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    insightsMap: ReturnType<typeof selectInsightsMap>,
    cmd: ResizeWidth,
    settings: ReturnType<typeof selectSettings>,
    screen: ReturnType<typeof selectScreen> = "xl",
) {
    const {
        payload: { itemPath, sectionIndex, itemIndex, width },
    } = cmd;

    const widget =
        itemPath === undefined
            ? (layout.sections[sectionIndex].items[itemIndex].widget as IWidget)
            : (findItem(layout, itemPath).widget as IWidget);

    const direction = getContainerDirectionAtPath(layout, itemPath);
    const minLimit = getMinWidth(widget, insightsMap, screen, settings, direction);
    const parent =
        itemPath !== undefined && itemPath.slice(0, -1).length > 0 && findItem(layout, itemPath.slice(0, -1));

    const maxLimit = parent
        ? determineWidthForScreen(screen, parent.size)
        : DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;

    const validWidth = width >= minLimit && width <= maxLimit;

    if (!validWidth) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to set invalid width. Allowed width is from ${minLimit} to ${maxLimit}.`,
        );
    }
}
