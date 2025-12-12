// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingRichTextWidget } from "./validation/widgetValidations.js";
import { type ChangeRichTextWidgetContent } from "../../commands/index.js";
import {
    type DashboardRichTextWidgetContentChanged,
    richTextWidgetContentChanged,
} from "../../events/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectWidgetsMap } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

export function* changeRichTextWidgetContentHandler(
    ctx: DashboardContext,
    cmd: ChangeRichTextWidgetContent,
): SagaIterator<DashboardRichTextWidgetContentChanged> {
    const {
        payload: { content },
        correlationId,
    } = cmd;
    const widgets: ReturnType<typeof selectWidgetsMap> = yield select(selectWidgetsMap);
    const richTextWidget = validateExistingRichTextWidget(widgets, cmd, ctx);

    yield put(
        tabsActions.replaceRichTextWidgetContent({
            ref: richTextWidget.ref,
            content,
            undo: {
                cmd,
            },
        }),
    );

    return richTextWidgetContentChanged(ctx, richTextWidget.ref, content, correlationId);
}
