// (C) 2023-2026 GoodData Corporation

import { put, select } from "redux-saga/effects";

import { validateExistingInsightWidget } from "./validation/widgetValidations.js";
import { type IRemoveDrillToUrlForInsightWidget } from "../../commands/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* removeDrillToUrlForInsightWidgetHandler(
    ctx: DashboardContext,
    cmd: IRemoveDrillToUrlForInsightWidget,
) {
    const {
        payload: { blacklistAttributes },
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const insightWidget = validateExistingInsightWidget(widgets, cmd, ctx);
    const { ref: widgetRef, ignoredDrillToUrlAttributes: currentBlacklistAttributes } = insightWidget;

    const newBlacklistAttributes = [...(currentBlacklistAttributes ?? []), ...blacklistAttributes];

    yield put(
        tabsActions.replaceWidgetBlacklistAttributes({
            ref: widgetRef,
            blacklistAttributes: newBlacklistAttributes,
            undo: {
                cmd,
            },
        }),
    );
}
