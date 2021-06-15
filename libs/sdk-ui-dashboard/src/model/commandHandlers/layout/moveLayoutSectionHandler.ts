// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes";
import { MoveLayoutSection } from "../../commands";
import { dispatchDashboardEvent } from "../../eventEmitter/eventDispatcher";
import { invalidArgumentsProvided } from "../../events/general";
import { selectLayout } from "../../state/layout/layoutSelectors";
import { put, select } from "redux-saga/effects";
import { validateSectionExists, validateSectionPlacement } from "./validation/layoutValidation";
import { layoutActions } from "../../state/layout";
import { layoutSectionMoved } from "../../events/layout";
import { resolveRelativeIndex } from "../../utils/arrayOps";

export function* moveLayoutSectionHandler(ctx: DashboardContext, cmd: MoveLayoutSection): SagaIterator<void> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { sectionIndex, toIndex } = cmd.payload;

    if (!validateSectionExists(layout, sectionIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move non-existent section from index ${sectionIndex}. There are only ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    if (!validateSectionPlacement(layout, toIndex)) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move section to a wrong index ${toIndex}. There are currently ${layout.sections.length} sections.`,
                cmd.correlationId,
            ),
        );
    }

    const absoluteIndex = resolveRelativeIndex(layout.sections, toIndex);

    if (sectionIndex === absoluteIndex) {
        return yield dispatchDashboardEvent(
            invalidArgumentsProvided(
                ctx,
                `Attempting to move section to a same index where it already resides ${sectionIndex}.`,
                cmd.correlationId,
            ),
        );
    }

    yield put(
        layoutActions.moveSection({
            sectionIndex,
            toIndex,
            undo: {
                cmd,
            },
        }),
    );

    const section = layout.sections[sectionIndex];

    yield dispatchDashboardEvent(
        layoutSectionMoved(ctx, section, sectionIndex, absoluteIndex, cmd.correlationId),
    );
}
