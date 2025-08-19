// (C) 2021-2025 GoodData Corporation

import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import { validateExistingRichTextWidget } from "./validation/widgetValidations.js";
import { ChangeRichTextWidgetContent } from "../../commands/index.js";
import { DashboardRichTextWidgetContentChanged, richTextWidgetContentChanged } from "../../events/index.js";
import { layoutActions } from "../../store/layout/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { DashboardContext } from "../../types/commonTypes.js";

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
        layoutActions.replaceRichTextWidgetContent({
            ref: richTextWidget.ref,
            content,
            undo: {
                cmd,
            },
        }),
    );

    return richTextWidgetContentChanged(ctx, richTextWidget.ref, content, correlationId);
}
