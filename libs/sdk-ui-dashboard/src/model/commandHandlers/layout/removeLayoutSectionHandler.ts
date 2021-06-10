// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { RemoveLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { layoutActions } from "../../state/layout";
import { layoutSectionRemoved } from "../../events/layout";
import isEmpty from "lodash/isEmpty";

export function* removeLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: RemoveLayoutSection,
): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { index, stashIdentifier } = cmd.payload;

    if (isEmpty(layout.sections)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to remove a section from an empty layout.`,
                cmd.correlationId,
            ),
        );
    }

    if (index >= layout.sections.length) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to remove layout section at index ${index} while the layout has ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const absoluteIndex = index < 0 ? layout.sections.length - 1 : index;
    const section = layout.sections[absoluteIndex];

    yield put(
        layoutActions.removeSection({
            index: absoluteIndex,
            stashIdentifier,
            undo: {
                cmd,
            },
        }),
    );

    yield dispatchDashboardEvent(
        layoutSectionRemoved(ctx, section, absoluteIndex, false, stashIdentifier, cmd.correlationId),
    );
}
