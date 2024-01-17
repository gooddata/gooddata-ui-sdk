// (C) 2021-2024 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Payload of the {@link ChangeRichTextWidgetContent} command.
 * @beta
 */
export interface ChangeRichTextWidgetContentPayload {
    /**
     * Rich text widget reference whose content to change.
     */
    readonly ref: ObjRef;

    /**
     * Updated rich text widget content.
     */
    readonly content: string;
}

/**
 * @beta
 */
export interface ChangeRichTextWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_CONTENT";
    readonly payload: ChangeRichTextWidgetContentPayload;
}

/**
 * Creates the ChangeKpiWidgetHeader command. Dispatching this command will result in change of the KPI widget's
 * header which (now) includes title.
 *
 * @param ref - reference of the KPI widget to modify
 * @param header - new header to use
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function changeRichTextWidgetContent(
    ref: ObjRef,
    content: string,
    correlationId?: string,
): ChangeRichTextWidgetContent {
    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_CONTENT",
        correlationId,
        payload: {
            ref,
            content,
        },
    };
}
