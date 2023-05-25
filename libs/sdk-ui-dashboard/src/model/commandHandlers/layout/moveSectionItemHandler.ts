// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { MoveSectionItem } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import {
    validateItemExists,
    validateItemPlacement,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation.js";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionItemMoved, layoutSectionItemMoved } from "../../events/layout.js";
import { resolveIndexOfNewItem, resolveRelativeIndex } from "../../utils/arrayOps.js";
import { batchActions } from "redux-batched-actions";

type MoveSectionItemContext = {
    readonly ctx: DashboardContext;
    readonly cmd: MoveSectionItem;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: MoveSectionItemContext) {
    const {
        ctx,
        layout,
        cmd: {
            payload: { sectionIndex, toSectionIndex, itemIndex, toItemIndex, removeOriginalSectionIfEmpty },
        },
    } = commandCtx;

    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to move item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to move non-existent item from index ${itemIndex}. There are only ${fromSection.items.length} items.`,
        );
    }

    const itemToMove = fromSection.items[itemIndex];

    if (!validateSectionPlacement(layout, toSectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to move item to a wrong section at index ${toSectionIndex}. There are currently ${layout.sections.length} sections.`,
        );
    }

    const targetSectionIndex = resolveRelativeIndex(layout.sections, toSectionIndex);
    const targetSection = layout.sections[targetSectionIndex];

    if (!validateItemPlacement(targetSection, toItemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to move item to a wrong location at index ${toItemIndex}. Target section has ${targetSection.items.length} items.`,
        );
    }

    let targetItemIndex = 0;

    if (sectionIndex === targetSectionIndex) {
        targetItemIndex = resolveRelativeIndex(targetSection.items, toItemIndex);

        if (itemIndex === targetItemIndex) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move item to a same place where it already resides ${toItemIndex}.`,
            );
        }
    } else {
        targetItemIndex = resolveIndexOfNewItem(targetSection.items, toItemIndex);
    }

    return {
        targetSectionIndex,
        targetItemIndex,
        itemToMove,
        shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
    };
}

export function* moveSectionItemHandler(
    ctx: DashboardContext,
    cmd: MoveSectionItem,
): SagaIterator<DashboardLayoutSectionItemMoved> {
    const commandCtx: MoveSectionItemContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };

    const { targetSectionIndex, targetItemIndex, itemToMove, shouldRemoveSection } =
        validateAndResolve(commandCtx);
    const { itemIndex, sectionIndex } = cmd.payload;

    yield put(
        batchActions([
            layoutActions.moveSectionItem({
                sectionIndex,
                itemIndex,
                toSectionIndex: targetSectionIndex,
                toItemIndex: targetItemIndex,

                undo: {
                    cmd,
                },
            }),
            ...(shouldRemoveSection
                ? [
                      layoutActions.removeSection({
                          index: sectionIndex,
                          undo: {
                              cmd,
                          },
                      }),
                  ]
                : []),
        ]),
    );

    const targetSectionIndexUpdated =
        shouldRemoveSection && sectionIndex < targetSectionIndex ? sectionIndex - 1 : targetSectionIndex;

    return layoutSectionItemMoved(
        ctx,
        itemToMove,
        sectionIndex,
        targetSectionIndexUpdated,
        itemIndex,
        targetItemIndex,
        shouldRemoveSection,
        cmd.correlationId,
    );
}
