// (C) 2021 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveLayoutSection } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionRemoved, layoutSectionRemoved } from "../../events/layout.js";
import isEmpty from "lodash/isEmpty.js";
import { validateSectionExists } from "./validation/layoutValidation.js";
import { resolveRelativeIndex } from "../../utils/arrayOps.js";

export function* removeLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: RemoveLayoutSection,
): SagaIterator<DashboardLayoutSectionRemoved> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { index, stashIdentifier } = cmd.payload;

    if (isEmpty(layout.sections)) {
        throw invalidArgumentsProvided(ctx, cmd, `Attempting to remove a section from an empty layout.`);
    }

    if (!validateSectionExists(layout, index)) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Attempting to remove non-existing layout section at index ${index}.`,
        );
    }

    const absoluteIndex = resolveRelativeIndex(layout.sections, index);
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

    return layoutSectionRemoved(ctx, section, absoluteIndex, false, stashIdentifier, cmd.correlationId);
}
