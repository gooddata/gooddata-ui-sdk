// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { layoutActions } from "../../store/layout/index.js";
import { layoutDirectionChanged, LayoutDirectionChanged } from "../../events/layout.js";
import { ToggleLayoutDirection } from "../../commands/layout.js";

export function* toggleLayoutDirectionHandler(
    ctx: DashboardContext,
    cmd: ToggleLayoutDirection,
): SagaIterator<LayoutDirectionChanged> {
    const { layoutPath, direction } = cmd.payload;

    yield put(
        layoutActions.toggleLayoutDirection({
            layoutPath,
            direction,
            undo: {
                cmd,
            },
        }),
    );

    return layoutDirectionChanged(ctx, layoutPath, direction, cmd.correlationId);
}
