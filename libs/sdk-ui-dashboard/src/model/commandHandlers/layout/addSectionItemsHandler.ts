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

// TODO: this needs to handle calculation of the date dataset to use for the items
export function* addSectionItemsHandler(ctx: DashboardContext, cmd: AddSectionItems): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const stash: ReturnType<typeof selectStash> = yield select(selectStash);

    const { items, itemIndex, sectionIndex } = cmd.payload;

    if (!validateSectionExists(layout, sectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to add items to non-existing layout section at index ${sectionIndex}.`,
                cmd.correlationId,
            ),
        );
    }

    const section: ExtendedDashboardLayoutSection = layout.sections[sectionIndex];

    if (!validateItemPlacement(section, itemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to insert new item at wrong index ${itemIndex}. There are currently ${section.items.length} items.`,
                cmd.correlationId,
            ),
        );
    }

    const stashValidationResult = validateAndResolveStashedItems(stash, items);

    if (!isEmpty(stashValidationResult.missing)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to use non-existing stashes. Identifiers of missing stashes: ${stashValidationResult.missing.join(
                    ", ",
                )}`,
                cmd.correlationId,
            ),
        );
    }

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
            itemIndex < 0 ? section.items.length : itemIndex,
            stashValidationResult.resolved,
            stashValidationResult.existing,
            cmd.correlationId,
        ),
    );
}
