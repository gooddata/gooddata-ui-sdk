// (C) 2021-2022 GoodData Corporation
import { batchActions } from "redux-batched-actions";
import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";
import { MoveSectionItemToNewSection } from "../../commands/layout.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import {
    DashboardLayoutSectionItemMovedToNewSection,
    layoutSectionItemMovedToNewSection,
} from "../../events/layout.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes.js";
import {
    validateItemExists,
    validateSectionExists,
    validateSectionPlacement,
} from "./validation/layoutValidation.js";

type MoveSectionItemToNewSectionContext = {
    readonly ctx: DashboardContext;
    readonly cmd: MoveSectionItemToNewSection;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: MoveSectionItemToNewSectionContext) {
    const {
        ctx,
        layout,
        cmd: {
            payload: { sectionIndex, toSectionIndex, itemIndex, removeOriginalSectionIfEmpty },
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

    return {
        targetSectionIndex: toSectionIndex,
        targetItemIndex: 0,
        itemToMove,
        shouldRemoveSection: Boolean(removeOriginalSectionIfEmpty) && fromSection.items.length === 1,
    };
}

export function* moveSectionItemToNewSectionHandler(
    ctx: DashboardContext,
    cmd: MoveSectionItemToNewSection,
): SagaIterator<DashboardLayoutSectionItemMovedToNewSection> {
    const commandCtx: MoveSectionItemToNewSectionContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };

    const { targetSectionIndex, targetItemIndex, itemToMove, shouldRemoveSection } =
        validateAndResolve(commandCtx);

    const { itemIndex, sectionIndex, toSectionIndex } = cmd.payload;

    const itemSectionIndex = toSectionIndex > sectionIndex ? sectionIndex : sectionIndex + 1;

    const section: ExtendedDashboardLayoutSection = {
        type: "IDashboardLayoutSection",
        items: [],
    };

    yield put(
        batchActions([
            layoutActions.addSection({
                index: targetSectionIndex,
                section,
                usedStashes: [],
                undo: {
                    cmd,
                },
            }),
            layoutActions.moveSectionItem({
                sectionIndex: itemSectionIndex,
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
                          index: itemSectionIndex,
                          undo: {
                              cmd,
                          },
                      }),
                  ]
                : []),
        ]),
    );

    return layoutSectionItemMovedToNewSection(
        ctx,
        itemToMove,
        sectionIndex,
        targetSectionIndex,
        itemIndex,
        targetItemIndex,
        shouldRemoveSection,
        cmd.correlationId,
    );
}
