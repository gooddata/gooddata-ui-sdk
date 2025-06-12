// (C) 2021-2024 GoodData Corporation

import { DashboardContext } from "../../types/commonTypes.js";
import { ChangeRichTextWidgetContent } from "../../commands/index.js";
import { SagaIterator } from "redux-saga";
import { DashboardRichTextWidgetContentChanged, richTextWidgetContentChanged } from "../../events/index.js";
import { selectWidgetsMap } from "../../store/layout/layoutSelectors.js";
import { put, select } from "redux-saga/effects";
import { validateExistingRichTextWidget } from "./validation/widgetValidations.js";
import { layoutActions } from "../../store/layout/index.js";

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
