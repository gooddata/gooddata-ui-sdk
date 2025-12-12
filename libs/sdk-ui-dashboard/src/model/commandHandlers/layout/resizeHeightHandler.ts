// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import {
    asLayoutItemPath,
    findSection,
    getParentPath,
    serializeLayoutItemPath,
    serializeLayoutSectionPath,
} from "../../../_staging/layout/coordinates.js";
import { getMaxHeight, getMinHeight } from "../../../_staging/layout/sizing.js";
import { type ResizeHeight } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    type DashboardLayoutSectionItemsHeightResized,
    layoutSectionItemsHeightResized,
} from "../../events/layout.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectScreen } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

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
    const screen = yield select(selectScreen);
    const settings = yield select(selectSettings);

    validateLayoutIndexes(ctx, layout, cmd);

    validateHeight(ctx, layout, insightsMap, cmd, screen, settings);

    const numericalSectionIndex = typeof sectionIndex === "number" ? sectionIndex : sectionIndex.sectionIndex;
    const sectionPath = typeof sectionIndex === "number" ? { parent: undefined, sectionIndex } : sectionIndex;

    yield put(
        tabsActions.changeItemsHeight({
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
    screen: ReturnType<typeof selectScreen> = "xl",
    settings: ReturnType<typeof selectSettings>,
) {
    const {
        payload: { sectionIndex, itemIndexes, height },
    } = cmd;

    const widgets = itemIndexes.map((itemIndex) =>
        typeof sectionIndex === "number"
            ? layout.sections[sectionIndex].items[itemIndex]
            : findSection(layout, sectionIndex).items[itemIndex],
    );

    const minLimit = getMinHeight(widgets, insightsMap, screen, settings);
    const maxLimit = getMaxHeight(widgets, insightsMap, screen, settings);

    const validHeight = height >= minLimit && height <= maxLimit;

    if (!validHeight) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to set invalid height. Allowed height is from ${minLimit} to ${maxLimit}.`,
        );
    }
}
