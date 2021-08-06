// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { ReplaceSectionItem } from "../../commands";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout, selectStash } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation";
import { layoutActions } from "../../state/layout";
import { validateAndResolveStashedItems } from "./validation/stashValidation";
import isEmpty from "lodash/isEmpty";
import { DashboardLayoutSectionItemReplaced, layoutSectionItemReplaced } from "../../events/layout";

type ReplaceSectionItemContext = {
    ctx: DashboardContext;
    cmd: ReplaceSectionItem;
    layout: ReturnType<typeof selectLayout>;
    stash: ReturnType<typeof selectStash>;
};

function validateAndResolve(commandCtx: ReplaceSectionItemContext) {
    const {
        ctx,
        cmd: {
            payload: { sectionIndex, itemIndex, item },
        },
        layout,
        stash,
    } = commandCtx;

    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to replace item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to replace non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
        );
    }

    const stashValidationResult = validateAndResolveStashedItems(stash, [item]);

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
        itemToReplace: fromSection.items[itemIndex],
        stashValidationResult,
    };
}

// TODO: this needs to handle calculation of the date dataset to use for the item
export function* replaceSectionItemHandler(
    ctx: DashboardContext,
    cmd: ReplaceSectionItem,
): SagaIterator<DashboardLayoutSectionItemReplaced> {
    const commandCtx: ReplaceSectionItemContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
        stash: yield select(selectStash),
    };
    const { itemToReplace, stashValidationResult } = validateAndResolve(commandCtx);
    const { sectionIndex, itemIndex, stashIdentifier } = cmd.payload;

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

    return layoutSectionItemReplaced(
        ctx,
        sectionIndex,
        itemIndex,
        stashValidationResult.resolved,
        itemToReplace,
        stashIdentifier,
        cmd.correlationId,
    );
}
