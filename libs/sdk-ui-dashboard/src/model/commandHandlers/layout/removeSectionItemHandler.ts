// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../store/_infra/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../store/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation";
import { layoutSectionItemRemoved, layoutSectionRemoved } from "../../events/layout";
import { layoutActions } from "../../store/layout";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes";

type RemoveSectionItemContext = {
    readonly ctx: DashboardContext;
    readonly cmd: RemoveSectionItem;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: RemoveSectionItemContext) {
    const {
        ctx,
        cmd: {
            payload: { sectionIndex, itemIndex },
        },
        layout,
    } = commandCtx;

    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to remove item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Attempting to remove non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
        );
    }

    const itemToRemove = fromSection.items[itemIndex];

    return {
        fromSection,
        itemToRemove,
    };
}

export function* removeSectionItemHandler(ctx: DashboardContext, cmd: RemoveSectionItem): SagaIterator<void> {
    const commandCtx: RemoveSectionItemContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };
    const { fromSection, itemToRemove } = validateAndResolve(commandCtx);
    const { sectionIndex, itemIndex, eager, stashIdentifier } = cmd.payload;

    if (eager && fromSection.items.length === 1) {
        yield put(
            layoutActions.removeSection({
                index: sectionIndex,
                stashIdentifier,
                undo: {
                    cmd,
                },
            }),
        );

        // normally should do select to get state after the update, however this update is straightforward
        // and can be reconstructed no-problem here.
        const sectionWithEmptyItems: ExtendedDashboardLayoutSection = {
            ...fromSection,
            items: [],
        };

        yield dispatchDashboardEvent(
            layoutSectionItemRemoved(
                ctx,
                itemToRemove,
                itemIndex,
                sectionWithEmptyItems,
                stashIdentifier,
                cmd.correlationId,
            ),
        );

        yield dispatchDashboardEvent(
            layoutSectionRemoved(
                ctx,
                sectionWithEmptyItems,
                sectionIndex,
                true,
                undefined,
                cmd.correlationId,
            ),
        );
    } else {
        yield put(
            layoutActions.removeSectionItem({
                sectionIndex,
                itemIndex,
                stashIdentifier,
                undo: {
                    cmd,
                },
            }),
        );

        yield dispatchDashboardEvent(
            layoutSectionItemRemoved(
                ctx,
                itemToRemove,
                itemIndex,
                undefined,
                stashIdentifier,
                cmd.correlationId,
            ),
        );
    }
}
