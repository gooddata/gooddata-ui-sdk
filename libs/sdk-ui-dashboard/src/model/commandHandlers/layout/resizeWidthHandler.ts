// (C) 2021-2025 GoodData Corporation

import {
    IWidget,
    isDashboardLayout,
    ScreenSize,
    IDashboardLayout,
    IDashboardLayoutContainerDirection,
} from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { put, select, call } from "redux-saga/effects";

import { ResizeWidth } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { determineWidthForScreen, getMinWidth } from "../../../_staging/layout/sizing.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout, selectScreen } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import {
    DashboardLayoutSectionItemWidthResized,
    layoutSectionItemWidthResized,
} from "../../events/layout.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/flexibleLayout/config.js";
import {
    serializeLayoutItemPath,
    findSection,
    findItem,
    getSectionIndex,
    getItemIndex,
    getParentPath,
} from "../../../_staging/layout/coordinates.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { getContainerDirectionAtPath } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { ILayoutItemPath } from "../../../types.js";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { getChildWidgetLayoutPaths, getUpdatedSizesOnly } from "./containerWidthSanitization.js";

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

function mapNestedItemsToNewWidth(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    parentLayoutDirection: IDashboardLayoutContainerDirection,
    itemPath: ILayoutItemPath,
    newItemWidth: number,
) {
    const modifiedItem = findItem(layout, itemPath);
    if (parentLayoutDirection === "column" && isDashboardLayout(modifiedItem.widget)) {
        const childLayoutPaths = getChildWidgetLayoutPaths(modifiedItem.widget, itemPath);
        return childLayoutPaths.map((itemPath) => ({ itemPath, width: newItemWidth }));
    }
    return [];
}

function findItemsWithChangedWidth(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    parentLayoutDirection: IDashboardLayoutContainerDirection,
    itemPath: ILayoutItemPath,
    newItemWidth: number,
    screen: ScreenSize,
) {
    const nestedItemsWithNewWidth = mapNestedItemsToNewWidth(
        layout,
        parentLayoutDirection,
        itemPath,
        newItemWidth,
    );
    const itemWithNewWidth = { itemPath, width: newItemWidth };
    const allItemsWithNewWidth = [itemWithNewWidth, ...nestedItemsWithNewWidth];
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

    const parentLayoutDirection = getContainerDirectionAtPath(layout, itemPath);
    const itemLayoutPath = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;
    const itemsWithChangedWidth = findItemsWithChangedWidth(
        layout,
        parentLayoutDirection,
        itemLayoutPath,
        width,
        screen,
    );

    if (itemsWithChangedWidth.length > 0) {
        yield put(
            layoutActions.updateWidthOfMultipleItems({
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
