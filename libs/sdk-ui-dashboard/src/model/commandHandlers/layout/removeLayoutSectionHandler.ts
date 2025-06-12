// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { DashboardContext } from "../../types/commonTypes.js";
import { RemoveLayoutSection } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { put, select, call } from "redux-saga/effects";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardLayoutSectionRemoved, layoutSectionRemoved } from "../../events/layout.js";
import isEmpty from "lodash/isEmpty.js";
import { validateSectionExists } from "./validation/layoutValidation.js";
import { resolveRelativeIndex } from "../../utils/arrayOps.js";
import {
    serializeLayoutSectionPath,
    findSections,
    updateSectionIndex,
    getParentPath,
} from "../../../_staging/layout/coordinates.js";
import { resizeParentContainers } from "./containerHeightSanitization.js";

export function* removeLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: RemoveLayoutSection,
): SagaIterator<DashboardLayoutSectionRemoved> {
    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);
    const { index, stashIdentifier } = cmd.payload;
    const isLegacyCommand = typeof index === "number";
    const sections = isLegacyCommand ? layout.sections : findSections(layout, index);

    if (isEmpty(sections)) {
        throw invalidArgumentsProvided(ctx, cmd, `Attempting to remove a section from an empty layout.`);
    }

    if (isLegacyCommand) {
        if (!validateSectionExists(layout, index)) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Attempting to remove non-existing layout section at index ${index}.`,
            );
        }
    } else {
        if (!validateSectionExists(layout, index)) {
            throw invalidArgumentsProvided(
                ctx,
                cmd,
                `Attempting to remove non-existing layout section at index ${serializeLayoutSectionPath(
                    index,
                )}.`,
            );
        }
    }

    const absoluteIndex = isLegacyCommand
        ? resolveRelativeIndex(layout.sections, index)
        : resolveRelativeIndex(sections, index.sectionIndex);
    const section = sections[absoluteIndex];

    const targetSection = isLegacyCommand
        ? { parent: undefined, sectionIndex: absoluteIndex }
        : updateSectionIndex(index, absoluteIndex);

    yield put(
        layoutActions.removeSection({
            index: targetSection,
            stashIdentifier,
            undo: {
                cmd,
            },
        }),
    );

    yield call(resizeParentContainers, getParentPath(targetSection));

    return layoutSectionRemoved(
        ctx,
        section,
        absoluteIndex,
        targetSection,
        false,
        stashIdentifier,
        cmd.correlationId,
    );
}
