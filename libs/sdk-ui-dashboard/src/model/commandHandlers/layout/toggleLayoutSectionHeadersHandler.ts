// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type IToggleLayoutSectionHeaders } from "../../commands/layout.js";
import { type ILayoutSectionHeadersToggled, layoutSectionHeadersToggled } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* toggleLayoutSectionHeadersHandler(
    ctx: DashboardContext,
    cmd: IToggleLayoutSectionHeaders,
): SagaIterator<ILayoutSectionHeadersToggled> {
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
