// (C) 2021 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { AddLayoutSection } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { call, put, select } from "redux-saga/effects";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes";
import isEmpty from "lodash/isEmpty";
import { layoutActions } from "../../state/layout";
import { DashboardLayoutSectionAdded, layoutSectionAdded } from "../../events/layout";
import { validateSectionPlacement } from "./validation/layoutValidation";
import { StashValidationResult, validateAndResolveStashedItems } from "./validation/stashValidation";
import { resolveIndexOfNewItem } from "../../utils/arrayOps";
import { loadInsightsForDashboardItems } from "./common/loadMissingInsights";
import { selectInsightsMap } from "../../state/insights/insightsSelectors";
import { PromiseFnReturnType } from "../../types/sagas";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../state/insights";

type AddLayoutSectionContext = {
    readonly ctx: DashboardContext;
    readonly cmd: AddLayoutSection;
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
    readonly availableInsights: ReturnType<typeof selectInsightsMap>;
};

function validateAndResolve(commandCtx: AddLayoutSectionContext): StashValidationResult {
    const {
        ctx,
        layout,
        stash,
        cmd: {
            payload: { index, initialItems = [] },
            correlationId,
        },
    } = commandCtx;

    if (!validateSectionPlacement(layout, index)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to insert new section at wrong index ${index}. There are currently ${layout.sections.length} sections.`,
            correlationId,
        );
    }

    const stashValidationResult = validateAndResolveStashedItems(stash, initialItems);

    if (!isEmpty(stashValidationResult.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                ", ",
            )}`,
            correlationId,
        );
    }

    return stashValidationResult;
}

// TODO: this needs to handle calculation of the date dataset to use for the items
export function* addLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: AddLayoutSection,
): SagaIterator<DashboardLayoutSectionAdded> {
    const commandCtx: AddLayoutSectionContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
        availableInsights: yield select(selectInsightsMap),
    };

    const stashValidationResult = validateAndResolve(commandCtx);
    const {
        payload: { index, initialHeader },
    } = cmd;

    const section: ExtendedDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        header: initialHeader,
        items: stashValidationResult.resolved,
    };

    const insightsToAdd: PromiseFnReturnType<typeof loadInsightsForDashboardItems> = yield call(
        loadInsightsForDashboardItems,
        ctx,
        commandCtx.availableInsights,
        stashValidationResult.resolved,
    );

    yield put(
        batchActions([
            insightsActions.addInsights(insightsToAdd),
            layoutActions.addSection({
                section,
                usedStashes: stashValidationResult.existing,
                index,
                undo: {
                    cmd,
                },
            }),
        ]),
    );

    return layoutSectionAdded(
        ctx,
        section,
        resolveIndexOfNewItem(commandCtx.layout.sections, index),
        cmd.correlationId,
    );
}
