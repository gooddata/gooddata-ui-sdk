// (C) 2021-2025 GoodData Corporation

import { IWidget } from "@gooddata/sdk-model";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { ResizeHeight } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    DashboardLayoutSectionItemsHeightResized,
    layoutSectionItemsHeightResized,
} from "../../events/layout.js";
import { getMaxHeight, getMinHeight } from "../../../_staging/layout/sizing.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import {
    serializeLayoutSectionPath,
    findSection,
    asLayoutItemPath,
    serializeLayoutItemPath,
    getParentPath,
} from "../../../_staging/layout/coordinates.js";

import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import { resizeParentContainers } from "./containerHeightSanitization.js";

function validateLayoutIndexes(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    command: ResizeHeight,
) {
    const {
        payload: { sectionIndex, itemIndexes },
    } = command;
    if (typeof sectionIndex === "number") {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        const fromSection = layout.sections[sectionIndex];

        itemIndexes.forEach((itemIndex) => {
            if (!validateItemExists(fromSection, itemIndex)) {
                throw invalidArgumentsProvided(
                    ctx,
                    command,
                    `Attempting to resize non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
                );
            }
        });
    } else {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                command,
                `Attempting to resize item from non-existent section at ${serializeLayoutSectionPath(
                    sectionIndex,
                )}.`,
            );
        }

        const fromSection = findSection(layout, sectionIndex);

        itemIndexes.forEach((itemIndex) => {
            const layoutPath = asLayoutItemPath(sectionIndex, itemIndex);
            if (!validateItemExists(fromSection, layoutPath)) {
                throw invalidArgumentsProvided(
                    ctx,
                    command,
                    `Attempting to resize non-existent item from index ${serializeLayoutItemPath(
                        layoutPath,
                    )}. There are only ${fromSection.items.length} items in this section.`,
                );
            }
        });
    }
}

export function* resizeHeightHandler(
    ctx: DashboardContext,
    cmd: ResizeHeight,
): SagaIterator<DashboardLayoutSectionItemsHeightResized> {
    const {
        payload: { sectionIndex, itemIndexes, height },
    } = cmd;

    const layout = yield select(selectLayout);
    const insightsMap = yield select(selectInsightsMap);

    validateLayoutIndexes(ctx, layout, cmd);

    validateHeight(ctx, layout, insightsMap, cmd);

    const numericalSectionIndex = typeof sectionIndex === "number" ? sectionIndex : sectionIndex.sectionIndex;
    const sectionPath = typeof sectionIndex === "number" ? { parent: undefined, sectionIndex } : sectionIndex;

    yield put(
        layoutActions.changeItemsHeight({
            sectionIndex: sectionPath,
            itemIndexes,
            height,
        }),
    );

    yield call(resizeParentContainers, getParentPath(sectionPath));

    return layoutSectionItemsHeightResized(
        ctx,
        numericalSectionIndex,
        sectionPath,
        itemIndexes,
        height,
        cmd.correlationId,
    );
}

function validateHeight(
    ctx: DashboardContext,
    layout: ReturnType<typeof selectLayout>,
    insightsMap: ReturnType<typeof selectInsightsMap>,
    cmd: ResizeHeight,
) {
    const {
        payload: { sectionIndex, itemIndexes, height },
    } = cmd;

    const widgets = itemIndexes.map((itemIndex) =>
        typeof sectionIndex === "number"
            ? (layout.sections[sectionIndex].items[itemIndex].widget as IWidget)
            : (findSection(layout, sectionIndex).items[itemIndex].widget as IWidget),
    );

    const minLimit = getMinHeight(widgets, insightsMap);
    const maxLimit = getMaxHeight(widgets, insightsMap);

    const validHeight = height >= minLimit && height <= maxLimit;

    if (!validHeight) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to set invalid height. Allowed height is from ${minLimit} to ${maxLimit}.`,
        );
    }
}
