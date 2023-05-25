// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { AddSectionItems } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout, selectStash } from "../../store/layout/layoutSelectors.js";
import { call, put, SagaReturnType, select } from "redux-saga/effects";
import { validateItemPlacement, validateSectionExists } from "./validation/layoutValidation.js";
import { ExtendedDashboardLayoutSection, InternalDashboardItemDefinition } from "../../types/layoutTypes.js";
import { validateAndResolveStashedItems } from "./validation/stashValidation.js";
import isEmpty from "lodash/isEmpty.js";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionItemsAdded, layoutSectionItemsAdded } from "../../events/layout.js";
import { resolveIndexOfNewItem } from "../../utils/arrayOps.js";
import { selectInsightsMap } from "../../store/insights/insightsSelectors.js";
import { batchActions } from "redux-batched-actions";
import { insightsActions } from "../../store/insights/index.js";
import {
    validateAndNormalizeWidgetItems,
    validateAndResolveItemFilterSettings,
} from "./validation/itemValidation.js";
import { addTemporaryIdentityToWidgets } from "../../utils/dashboardItemUtils.js";

type AddSectionItemsContext = {
    readonly ctx: DashboardContext;
    readonly cmd: AddSectionItems;
    readonly items: InternalDashboardItemDefinition[];
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
    readonly availableInsights: ReturnType<typeof selectInsightsMap>;
};

function validateAndResolveItems(commandCtx: AddSectionItemsContext) {
    const {
        ctx,
        layout,
        stash,
        items,
        cmd: {
            payload: { sectionIndex, itemIndex },
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

export function* addSectionItemsHandler(
    ctx: DashboardContext,
    cmd: AddSectionItems,
): SagaIterator<DashboardLayoutSectionItemsAdded> {
    const {
        payload: { items },
    } = cmd;
    const commandCtx: AddSectionItemsContext = {
        ctx,
        cmd,
        items: addTemporaryIdentityToWidgets(items),
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
        availableInsights: yield select(selectInsightsMap),
    };

    const { stashValidationResult, section } = validateAndResolveItems(commandCtx);
    const {
        payload: { itemIndex, sectionIndex, autoResolveDateFilterDataset },
    } = cmd;

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

    yield put(
        batchActions([
            insightsActions.addInsights(normalizationResult.resolvedInsights.loaded),
            layoutActions.addSectionItems({
                sectionIndex,
                itemIndex,
                items: itemsToAdd,
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
