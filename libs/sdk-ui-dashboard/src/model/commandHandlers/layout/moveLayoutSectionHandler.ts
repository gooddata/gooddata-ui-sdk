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
            correlationId,
        },
        layout,
    } = commandCtx;

    if (!validateSectionExists(layout, sectionIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to move non-existent section from index ${sectionIndex}. There are only ${layout.sections.length} sections.`,
            correlationId,
        );
    }

    if (!validateSectionPlacement(layout, toIndex)) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to move section to a wrong index ${toIndex}. There are currently ${layout.sections.length} sections.`,
            correlationId,
        );
    }

    const absoluteIndex = resolveRelativeIndex(layout.sections, toIndex);

    if (sectionIndex === absoluteIndex) {
        throw invalidArgumentsProvided(
            ctx,
            `Attempting to move section to a same index where it already resides ${sectionIndex}.`,
            correlationId,
        );
    }

    return {
        absoluteIndex,
    };
}

export function* moveLayoutSectionHandler(ctx: DashboardContext, cmd: MoveLayoutSection): SagaIterator<void> {
    const commandCtx: MoveLayoutSectionContext = {
        ctx,
        cmd,
        layout: yield select(selectLayout),
    };

    const { absoluteIndex } = validateAndResolve(commandCtx);
    const { sectionIndex, toIndex } = cmd.payload;

    yield put(
        layoutActions.moveSection({
            sectionIndex,
            toIndex,
            undo: {
                cmd,
            },
        }),
    );

    const section = commandCtx.layout.sections[sectionIndex];

    yield dispatchDashboardEvent(
        layoutSectionMoved(ctx, section, sectionIndex, absoluteIndex, cmd.correlationId),
    );
}
