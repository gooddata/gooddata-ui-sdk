// (C) 2021-2022 GoodData Corporation

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
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/fluidLayout/config.js";

function validateLayoutIndexes(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    command: ResizeWidth,
) {
    const {
        payload: { sectionIndex, itemIndex },
    } = command;

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
}

export function* resizeWidthHandler(
    ctx: DashboardContext,
    cmd: ResizeWidth,
): SagaIterator<DashboardLayoutSectionItemWidthResized> {
    const {
        payload: { sectionIndex, itemIndex, width },
    } = cmd;

    const layout = yield select(selectLayout);
    const insightsMap = yield select(selectInsightsMap);

    validateLayoutIndexes(ctx, layout, cmd);
    validateWidth(ctx, layout, insightsMap, cmd);

    yield put(
        layoutActions.changeItemWidth({
            sectionIndex,
            itemIndex,
            width,
        }),
    );

    return layoutSectionItemWidthResized(ctx, sectionIndex, itemIndex, width, cmd.correlationId);
}

function validateWidth(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    insightsMap: ReturnType<typeof selectInsightsMap>,
    cmd: ResizeWidth,
) {
    const {
        payload: { sectionIndex, itemIndex, width },
    } = cmd;

    const widget = layout.sections[sectionIndex].items[itemIndex].widget as IWidget;

    const minLimit = getMinWidth(widget, insightsMap);
    const maxLimit = DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;

    const validHeight = width >= minLimit && width <= maxLimit;

    if (!validHeight) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to set invalid width. Allowed width is from ${minLimit} to ${maxLimit}.`,
        );
    }
}
