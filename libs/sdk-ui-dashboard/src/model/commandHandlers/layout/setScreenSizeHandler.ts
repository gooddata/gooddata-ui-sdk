// (C) 2021-2025 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { SetScreenSize } from "../../commands/index.js";
import { ScreenSizeChanged, screenSizeChanged } from "../../events/layout.js";
import { layoutActions } from "../../store/layout/index.js";
import { DashboardContext } from "../../types/commonTypes.js";

export function* setScreenSizeHandler(
    ctx: DashboardContext,
    cmd: SetScreenSize,
): SagaIterator<ScreenSizeChanged> {
    const { screenSize } = cmd.payload;

    yield put(layoutActions.setScreen({ screen: screenSize }));

    return screenSizeChanged(ctx, screenSize, cmd.correlationId);
}
