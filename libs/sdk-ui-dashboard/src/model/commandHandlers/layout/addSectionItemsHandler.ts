// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { AddSectionItems } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateItemPlacement, validateSectionExists } from "./validation/layoutValidation";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes";
import { validateAndResolveStashedItems } from "./validation/stashValidation";
import isEmpty from "lodash/isEmpty";
import { layoutActions } from "../../state/layout";
import { DashboardLayoutSectionItemsAdded, layoutSectionItemsAdded } from "../../events/layout";
import { resolveIndexOfNewItem } from "../../utils/arrayOps";
import { selectInsightsMap } from "../../state/insights/insightsSelectors";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../state/insights";
import { validateAndNormalizeItems } from "./validation/itemValidation";

type AddSectionItemsContext = {
    readonly ctx: DashboardContext;
    readonly cmd: AddSectionItems;
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
    readonly availableInsights: ReturnType<typeof selectInsightsMap>;
};

function validateAndResolve(commandCtx: AddSectionItemsContext) {
    const {
        ctx,
        layout,
        stash,
        cmd: {
            payload: { sectionIndex, itemIndex, items },
        },
    } = commandCtx;
    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to add items to non-existing layout section at index ${sectionIndex}.`,
        );
    }

    const section: ExtendedDashboardLayoutSection = layout.sections[sectionIndex];

    if (!validateItemPlacement(section, itemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to insert new item at wrong index ${itemIndex}. There are currently ${section.items.length} items.`,
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
        stashValidationResult,
        section,
    };
}

// TODO: this needs to include validation of the filter settings
export function* addSectionItemsHandler(
    ctx: DashboardContext,
    cmd: AddSectionItems,
): SagaIterator<DashboardLayoutSectionItemsAdded> {
    const commandCtx: AddSectionItemsContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
        availableInsights: yield select(selectInsightsMap),
    };

    const { stashValidationResult, section } = validateAndResolve(commandCtx);
    const {
        payload: { itemIndex, sectionIndex },
    } = cmd;

    const normalizationResult: SagaReturnType<typeof validateAndNormalizeItems> = yield call(
        validateAndNormalizeItems,
        ctx,
        stashValidationResult.resolved,
        cmd,
    );

    yield put(
        batchActions([
            insightsActions.addInsights(normalizationResult.resolvedInsights.loaded),
            layoutActions.addSectionItems({
                sectionIndex,
                itemIndex,
                items: normalizationResult.normalizedItems,
                usedStashes: stashValidationResult.existing,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    return layoutSectionItemsAdded(
        ctx,
        sectionIndex,
        resolveIndexOfNewItem(section.items, itemIndex),
        stashValidationResult.resolved,
        stashValidationResult.existing,
        cmd.correlationId,
    );
}
