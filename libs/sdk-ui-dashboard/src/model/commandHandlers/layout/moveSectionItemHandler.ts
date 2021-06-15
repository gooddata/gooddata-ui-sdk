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
import { resolveIndexOfNewItem, resolveRelativeIndex } from "../../utils/arrayOps";

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
                `Attempting to move non-existent item from index ${itemIndex}. There are only ${fromSection.items.length} items.`,
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

    const targetSectionIndex = resolveRelativeIndex(layout.sections, toSectionIndex);
    const targetSection = layout.sections[targetSectionIndex];

    if (!validateItemPlacement(targetSection, toItemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move item to a wrong location at index ${toItemIndex}. Target section has ${targetSection.items.length} items.`,
                cmd.correlationId,
            ),
        );
    }

    let targetItemIndex = 0;

    if (sectionIndex === targetSectionIndex) {
        targetItemIndex = resolveRelativeIndex(targetSection.items, toItemIndex);

        if (itemIndex === targetItemIndex) {
            return yield dispatchDashboardEvent(
                invalidArgumentsProvided(
                    ctx,
                    `Attempting to move item to a same place where it already resides ${toItemIndex}.`,
                    cmd.correlationId,
                ),
            );
        }
    } else {
        targetItemIndex = resolveIndexOfNewItem(targetSection.items, toItemIndex);
    }

    yield put(
        layoutActions.moveSectionItem({
            sectionIndex,
            itemIndex,
            toSectionIndex: targetSectionIndex,
            toItemIndex,
            undo: {
                cmd,
            },
        }),
    );

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
