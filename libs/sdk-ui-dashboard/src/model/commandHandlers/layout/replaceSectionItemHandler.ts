// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { ReplaceSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { commandRejected, invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation";
import { layoutActions } from "../../state/layout";
import { validateAndResolveStashedItems } from "./validation/stashValidation";
import isEmpty from "lodash/isEmpty";

// TODO: this needs to handle calculation of the date dataset to use for the item
export function* replaceSectionItemHandler(
    ctx: DashboardContext,
    cmd: ReplaceSectionItem,
): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const stash: ReturnType<typeof selectStash> = yield select(selectStash);
    const { sectionIndex, itemIndex, items, stashIdentifier } = cmd.payload;

    if (!validateSectionExists(layout, sectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to replace item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to replace non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
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
        layoutActions.replaceSectionItem({
            sectionIndex,
            itemIndex,
            newItems: stashValidationResult.resolved,
            stashIdentifier,
            usedStashes: stashValidationResult.existing,
            undo: {
                cmd,
            },
        }),
    );

    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}
