// (C) 2021-2024 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { DashboardContext } from "../../types/commonTypes.js";
import { layoutActions } from "../../store/layout/index.js";
import { layoutSectionHeadersToggled, LayoutSectionHeadersToggled } from "../../events/layout.js";
import { ToggleLayoutSectionHeaders } from "../../commands/layout.js";

export function* toggleLayoutSectionHeadersHandler(
    ctx: DashboardContext,
    cmd: ToggleLayoutSectionHeaders,
): SagaIterator<LayoutSectionHeadersToggled> {
    const { layoutPath, enableSectionHeaders } = cmd.payload;

    yield put(
        layoutActions.toggleLayoutSectionHeaders({
            layoutPath,
            enableSectionHeaders,
            undo: {
                cmd,
            },
        }),
    );

    return layoutSectionHeadersToggled(ctx, layoutPath, enableSectionHeaders, cmd.correlationId);
}
