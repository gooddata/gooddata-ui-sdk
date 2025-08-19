// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { resizeParentContainers } from "./containerHeightSanitization.js";
import { validateSectionExists, validateSectionPlacement } from "./validation/layoutValidation.js";
import {
    areLayoutPathsEqual,
    findSection,
    findSections,
    getParentPath,
    getSectionIndex,
    serializeLayoutSectionPath,
    updateSectionIndex,
} from "../../../_staging/layout/coordinates.js";
import { MoveLayoutSection } from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { DashboardLayoutSectionMoved, layoutSectionMoved } from "../../events/layout.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectLayout } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";
import { resolveRelativeIndex } from "../../utils/arrayOps.js";

type MoveLayoutSectionContext = {
    readonly ctx: DashboardContext;
    readonly cmd: MoveLayoutSection;
    readonly layout: ReturnType<typeof selectLayout>;
};

function validateAndResolve(commandCtx: MoveLayoutSectionContext) {
    const {
        ctx,
        cmd: {
            payload: { sectionIndex, toIndex },
        },
        layout,
    } = commandCtx;

    if (typeof sectionIndex === "number" && typeof toIndex === "number") {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move non-existent section from index ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            );
        }

        if (!validateSectionPlacement(layout, toIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move section to a wrong index ${toIndex}. There are currently ${layout.sections.length} sections.`,
            );
        }

        const absoluteIndex = resolveRelativeIndex(layout.sections, toIndex);

        if (sectionIndex === absoluteIndex) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move section to a same index where it already resides ${sectionIndex}.`,
            );
        }

        return {
            absoluteIndex,
            movedSection: layout.sections[sectionIndex],
        };
    } else if (typeof sectionIndex !== "number" && typeof toIndex !== "number") {
        if (!validateSectionExists(layout, sectionIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move non-existent section from index ${serializeLayoutSectionPath(
                    sectionIndex,
                )}.`,
            );
        }

        if (!validateSectionPlacement(layout, toIndex)) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move section to a wrong index ${serializeLayoutSectionPath(sectionIndex)}.`,
            );
        }

        const sections = findSections(layout, sectionIndex);
        const targetSectionIndex = getSectionIndex(toIndex);
        const absoluteIndex = resolveRelativeIndex(sections, targetSectionIndex);

        if (
            areLayoutPathsEqual(sectionIndex.parent, toIndex.parent) &&
            sectionIndex.sectionIndex === absoluteIndex
        ) {
            throw invalidArgumentsProvided(
                ctx,
                commandCtx.cmd,
                `Attempting to move section to a same index where it already resides ${serializeLayoutSectionPath(
                    sectionIndex,
                )}.`,
            );
        }

        return {
            absoluteIndex,
            movedSection: findSection(layout, sectionIndex),
        };
    } else {
        throw invalidArgumentsProvided(
            ctx,
            commandCtx.cmd,
            `Invalid command parameters. Either both sectionIndex and toIndex must be number or not.`,
        );
    }
}

export function* moveLayoutSectionHandler(
    ctx: DashboardContext,
    cmd: MoveLayoutSection,
): SagaIterator<DashboardLayoutSectionMoved> {
    const layout = yield select(selectLayout);
    const commandCtx: MoveLayoutSectionContext = {
        ctx,
        cmd,
        layout,
    };

    const { absoluteIndex, movedSection } = validateAndResolve(commandCtx);
    const { sectionIndex, toIndex } = cmd.payload;

    const sourceSection =
        typeof sectionIndex === "number" ? { parent: undefined, sectionIndex: sectionIndex } : sectionIndex;

    const toSectionPath =
        typeof toIndex === "number"
            ? { parent: undefined, sectionIndex: absoluteIndex }
            : updateSectionIndex(toIndex, absoluteIndex);

    yield put(
        layoutActions.moveSection({
            sectionIndex: sourceSection,
            toIndex: toSectionPath,
            undo: {
                cmd,
            },
        }),
    );

    yield call(resizeParentContainers, getParentPath(sourceSection));
    yield call(resizeParentContainers, getParentPath(toSectionPath));

    return layoutSectionMoved(
        ctx,
        movedSection,
        typeof sectionIndex === "number" ? sectionIndex : getSectionIndex(sourceSection),
        typeof toIndex === "number" ? absoluteIndex : getSectionIndex(toSectionPath),
        sourceSection,
        toSectionPath,
        cmd.correlationId,
    );
}
