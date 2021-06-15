// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveSectionItem } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateItemExists, validateSectionExists } from "./validation/layoutValidation";
import { layoutSectionItemRemoved, layoutSectionRemoved } from "../../events/layout";
import { layoutActions } from "../../state/layout";
import { ExtendedDashboardLayoutSection } from "../../types/layoutTypes";

export function* removeSectionItemHandler(ctx: DashboardContext, cmd: RemoveSectionItem): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { sectionIndex, itemIndex, eager, stashIdentifier } = cmd.payload;

    if (!validateSectionExists(layout, sectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to remove item from non-existent section at ${sectionIndex}. There are only ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const fromSection = layout.sections[sectionIndex];

    if (!validateItemExists(fromSection, itemIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to remove non-existent item from index ${itemIndex} in section ${sectionIndex}. There are only ${fromSection.items.length} items in this section.`,
                cmd.correlationId,
            ),
        );
    }

    const itemToRemove = fromSection.items[itemIndex];

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
