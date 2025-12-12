// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type SetScreenSize } from "../../commands/index.js";
import { type ScreenSizeChanged, screenSizeChanged } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* setScreenSizeHandler(
    ctx: DashboardContext,
    cmd: SetScreenSize,
): SagaIterator<ScreenSizeChanged> {
    const { screenSize } = cmd.payload;

    yield put(tabsActions.setScreen({ screen: screenSize }));

    return screenSizeChanged(ctx, screenSize, cmd.correlationId);
}
