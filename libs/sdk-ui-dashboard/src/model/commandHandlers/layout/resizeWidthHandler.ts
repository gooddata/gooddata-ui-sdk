// (C) 2021-2024 GoodData Corporation

import { IWidget } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { ResizeWidth } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";

import { getMinWidth } from "../../../_staging/layout/sizing.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
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
} from "../../../_staging/layout/coordinates.js";

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

export function* resizeWidthHandler(
    ctx: DashboardContext,
    cmd: ResizeWidth,
): SagaIterator<DashboardLayoutSectionItemWidthResized> {
    const {
        payload: { itemPath, sectionIndex, itemIndex, width },
    } = cmd;

    const layout = yield select(selectLayout);
    const insightsMap = yield select(selectInsightsMap);

    validateLayoutIndexes(ctx, layout, cmd);
    validateWidth(ctx, layout, insightsMap, cmd);

    const layoutPath = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;

    yield put(
        layoutActions.changeItemWidth({
            layoutPath,
            width,
        }),
    );

    return layoutSectionItemWidthResized(
        ctx,
        getSectionIndex(layoutPath),
        getItemIndex(layoutPath),
        layoutPath,
        width,
        cmd.correlationId,
    );
}

function validateWidth(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    insightsMap: ReturnType<typeof selectInsightsMap>,
    cmd: ResizeWidth,
) {
    const {
        payload: { itemPath, sectionIndex, itemIndex, width },
    } = cmd;

    const widget =
        itemPath === undefined
            ? (layout.sections[sectionIndex].items[itemIndex].widget as IWidget)
            : (findItem(layout, itemPath).widget as IWidget);

    const minLimit = getMinWidth(widget, insightsMap, "xl");
    const parent =
        itemPath !== undefined && itemPath.slice(0, -1).length > 0 && findItem(layout, itemPath.slice(0, -1));

    const maxLimit = parent ? parent.size.xl.gridWidth : DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;

    const validWidth = width >= minLimit && width <= maxLimit;

    if (!validWidth) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to set invalid width. Allowed width is from ${minLimit} to ${maxLimit}.`,
        );
    }
}
