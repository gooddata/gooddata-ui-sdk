// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { ReplaceSectionItem } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout, selectScreen, selectStash } from "../../store/layout/layoutSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation.js";
import { layoutActions } from "../../store/layout/index.js";
import { validateAndResolveStashedItems } from "./validation/stashValidation.js";
import isEmpty from "lodash/isEmpty.js";
import { DashboardLayoutSectionItemReplaced, layoutSectionItemReplaced } from "../../events/layout.js";
import {
    validateAndNormalizeWidgetItems,
    validateAndResolveItemFilterSettings,
} from "./validation/itemValidation.js";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../store/insights/index.js";
import { InternalDashboardItemDefinition } from "../../types/layoutTypes.js";
import { addTemporaryIdentityToWidgets } from "../../utils/dashboardItemUtils.js";
import {
    serializeLayoutItemPath,
    findSection,
    findItem,
    getSectionIndex,
    getItemIndex,
    getParentPath,
} from "../../../_staging/layout/coordinates.js";
import { normalizeItemSizeToParent } from "../../../_staging/layout/sizing.js";
import { selectSettings } from "../../store/config/configSelectors.js";
import { resizeParentContainers } from "./containerHeightSanitization.js";

type ReplaceSectionItemContext = {
    ctx: DashboardContext;
    cmd: ReplaceSectionItem;
    items: InternalDashboardItemDefinition[];
    layout: ReturnType<typeof selectLayout>;
    stash: ReturnType<typeof selectStash>;
};

function validateAndResolve(commandCtx: ReplaceSectionItemContext) {
    const {
        ctx,
        cmd: {
            payload: { itemPath, itemIndex, sectionIndex },
        },
        items,
        layout,
        stash,
    } = commandCtx;

    if (itemPath === undefined) {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to replace item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        const fromSection = layout.sections[sectionIndex];

        if (!validateItemExists(fromSection, itemIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to replace non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
            );
        }

        const stashValidationResult = validateAndResolveStashedItems(stash, items);

        if (!isEmpty(stashValidationResult.missing)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
            );
        }

        return {
            itemToReplace: fromSection.items[itemIndex],
            stashValidationResult,
        };
    } else {
        if (!validateSectionExists(layout, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to replace item from non-existent section at ${serializeLayoutItemPath(
                    itemPath,
                )}.`,
            );
        }

        const fromSection = findSection(layout, itemPath);

        if (!validateItemExists(fromSection, itemPath)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to replace non-existent item from index ${serializeLayoutItemPath(
                    itemPath,
                )}. There are only ${fromSection.items.length} items in this section.`,
            );
        }

        const stashValidationResult = validateAndResolveStashedItems(stash, items);

        if (!isEmpty(stashValidationResult.missing)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
            );
        }

        return {
            itemToReplace: findItem(layout, itemPath),
            stashValidationResult,
        };
    }
}

export function* replaceSectionItemHandler(
    ctx: DashboardContext,
    cmd: ReplaceSectionItem,
): SagaIterator<DashboardLayoutSectionItemReplaced> {
    const {
        payload: { item },
    } = cmd;
    const commandCtx: ReplaceSectionItemContext = {
        ctx,
        cmd,
        items: addTemporaryIdentityToWidgets([item]),
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
    };
    const { itemToReplace, stashValidationResult } = validateAndResolve(commandCtx);
    const { itemPath, sectionIndex, itemIndex, stashIdentifier, autoResolveDateFilterDataset } = cmd.payload;

    const normalizationResult: SagaReturnType<typeof validateAndNormalizeWidgetItems> = yield call(
        validateAndNormalizeWidgetItems,
        ctx,
        stashValidationResult,
        cmd,
    );

    const itemsToAdd: SagaReturnType<typeof validateAndResolveItemFilterSettings> = yield call(
        validateAndResolveItemFilterSettings,
        ctx,
        cmd,
        normalizationResult,
        autoResolveDateFilterDataset,
    );

    const settings: SagaReturnType<typeof selectSettings> = yield select(selectSettings);
    const screen: SagaReturnType<typeof selectScreen> = yield select(selectScreen);

    const layoutPath = itemPath === undefined ? [{ sectionIndex, itemIndex }] : itemPath;

    const { item: itemWithNormalizedSize } = normalizeItemSizeToParent(
        itemsToAdd[0],
        layoutPath,
        commandCtx.layout,
        settings,
        normalizationResult.resolvedInsights.resolved,
        screen,
    );

    yield put(
        batchActions([
            insightsActions.addInsights(normalizationResult.resolvedInsights.loaded),
            layoutActions.replaceSectionItem({
                layoutPath,
                newItems: [itemWithNormalizedSize],
                stashIdentifier,
                usedStashes: stashValidationResult.existing,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    yield call(resizeParentContainers, getParentPath(layoutPath));

    return layoutSectionItemReplaced(
        ctx,
        sectionIndex === undefined ? getSectionIndex(layoutPath) : sectionIndex,
        itemIndex === undefined ? getItemIndex(layoutPath) : itemIndex,
        layoutPath,
        [itemWithNormalizedSize],
        itemToReplace,
        stashIdentifier,
        cmd.correlationId,
    );
}
