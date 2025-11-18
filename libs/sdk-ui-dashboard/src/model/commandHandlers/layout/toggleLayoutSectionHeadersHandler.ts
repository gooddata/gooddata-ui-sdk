// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { ToggleLayoutSectionHeaders } from "../../commands/layout.js";
import { LayoutSectionHeadersToggled, layoutSectionHeadersToggled } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* toggleLayoutSectionHeadersHandler(
    ctx: DashboardContext,
    cmd: ToggleLayoutSectionHeaders,
): SagaIterator<LayoutSectionHeadersToggled> {
    const { layoutPath, enableSectionHeaders } = cmd.payload;

    yield put(
        tabsActions.toggleLayoutSectionHeaders({
            layoutPath,
            enableSectionHeaders,
            undo: {
                cmd,
            },
        }),
    );

    return layoutSectionHeadersToggled(ctx, layoutPath, enableSectionHeaders, cmd.correlationId);
}
