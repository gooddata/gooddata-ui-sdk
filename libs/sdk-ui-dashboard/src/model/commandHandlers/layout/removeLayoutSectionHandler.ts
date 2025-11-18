// (C) 2021-2025 GoodData Corporation

import { isEmpty } from "lodash-es";
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { validateSectionExists } from "./validation/layoutValidation.js";
import {
    findSections,
    getParentPath,
    serializeLayoutSectionPath,
    updateSectionIndex,
} from "../../../_staging/layout/coordinates.js";
import { RemoveLayoutSection } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardLayoutSectionRemoved, layoutSectionRemoved } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { resolveRelativeIndex } from "../../utils/arrayOps.js";

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
        tabsActions.removeSection({
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
