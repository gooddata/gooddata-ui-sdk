// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { AddSectionItems } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateItemPlacement, validateSectionExists } from "./validation/layoutValidation";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes";
import { validateAndResolveStashedItems } from "./validation/stashValidation";
import isEmpty from "lodash/isEmpty";
import { layoutActions } from "../../state/layout";
import { layoutSectionItemsAdded } from "../../events/layout";
import { resolveIndexOfNewItem } from "../../utils/arrayOps";

type AddSectionItemsContext = {
    readonly ctx: DashboardContext;
    readonly cmd: AddSectionItems;
    readonly layout: ReturnType<typeof selectLayout>;
    readonly stash: ReturnType<typeof selectStash>;
};

function validateAndResolve(commandCtx: AddSectionItemsContext) {
    const {
        ctx,
        layout,
        stash,
        cmd: {
            payload: { sectionIndex, itemIndex, items },
            correlationId,
        },
    } = commandCtx;
    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to add items to non-existing layout section at index ${sectionIndex}.`,
            correlationId,
        );
    }

    const section: ExtendedDashboardLayoutSection = layout.sections[sectionIndex];

    if (!validateItemPlacement(section, itemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to insert new item at wrong index ${itemIndex}. There are currently ${section.items.length} items.`,
            correlationId,
        );
    }

    const stashValidationResult = validateAndResolveStashedItems(stash, items);

    if (!isEmpty(stashValidationResult.missing)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                ", ",
            )}`,
            correlationId,
        );
    }

    return {
        stashValidationResult,
        section,
    };
}

// TODO: this needs to handle calculation of the date dataset to use for the items
export function* addSectionItemsHandler(ctx: DashboardContext, cmd: AddSectionItems): SagaIterator<void> {
    const commandCtx: AddSectionItemsContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
    };

    const { stashValidationResult, section } = validateAndResolve(commandCtx);
    const { itemIndex, sectionIndex } = cmd.payload;

    yield put(
        layoutActions.addSectionItems({
            sectionIndex,
            itemIndex,
            items: stashValidationResult.resolved,
            usedStashes: stashValidationResult.existing,
            undo: {
                cmd,
            },
        }),
    );

    yield dispatchDashboardEvent(
        layoutSectionItemsAdded(
            ctx,
            sectionIndex,
            resolveIndexOfNewItem(section.items, itemIndex),
            stashValidationResult.resolved,
            stashValidationResult.existing,
            cmd.correlationId,
        ),
    );
}
