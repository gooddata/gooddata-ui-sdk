// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { MoveSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import {
    validateItemExists,
    validateItemPlacement,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation";
import { layoutActions } from "../../state/layout";
import { layoutSectionItemMoved } from "../../events/layout";

export function* moveSectionItemHandler(ctx: DashboardContext, cmd: MoveSectionItem): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { itemIndex, sectionIndex, toSectionIndex, toItemIndex } = cmd.payload;

    if (!validateSectionExists(layout, sectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move non-existed item from index ${itemIndex}. There are only ${fromSection.items.length} items.`,
                cmd.correlationId,
            ),
        );
    }

    const itemToMove = fromSection.items[itemIndex];

    if (!validateSectionPlacement(layout, toSectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move item to a wrong section at index ${toSectionIndex}. There are currently ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const targetSection = layout.sections[toSectionIndex];

    if (!validateItemPlacement(targetSection, toItemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move item to a wrong location at index ${toItemIndex}. Target section has ${targetSection.items.length} items.`,
                cmd.correlationId,
            ),
        );
    }

    yield put(
        layoutActions.moveSectionItem({
            sectionIndex,
            itemIndex,
            toSectionIndex,
            toItemIndex,
            undo: {
                cmd,
            },
        }),
    );

    const targetSectionIndex = toSectionIndex < 0 ? layout.sections.length - 1 : toSectionIndex;
    const targetItemIndex = toItemIndex < 0 ? targetSection.items.length : toItemIndex;

    yield dispatchDashboardEvent(
        layoutSectionItemMoved(
            ctx,
            itemToMove,
            sectionIndex,
            targetSectionIndex,
            itemIndex,
            targetItemIndex,
            cmd.correlationId,
        ),
    );
}
