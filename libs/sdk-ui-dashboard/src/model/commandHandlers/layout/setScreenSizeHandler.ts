// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { type ISetScreenSize } from "../../commands/index.js";
import { type IScreenSizeChanged, screenSizeChanged } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* setScreenSizeHandler(
    ctx: DashboardContext,
    cmd: ISetScreenSize,
): SagaIterator<IScreenSizeChanged> {
    const { screenSize } = cmd.payload;

    yield put(tabsActions.setScreen({ screen: screenSize }));

    return screenSizeChanged(ctx, screenSize, cmd.correlationId);
}
