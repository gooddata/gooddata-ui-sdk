// (C) 2021-2024 GoodData Corporation

import { IDashboardCommand } from "./base.js";
import { IInsight, ObjRef } from "@gooddata/sdk-model";

/**
 * Payload of the {@link ChangeRichTextWidgetContent} command.
 * @beta
 */
export interface AddInsightToStackWidgetContentPayload {
    /**
     * Stack widget reference whose content to change.
     */
    readonly ref: ObjRef;

    readonly insight: IInsight;

    /**
     * Insight local identifier to be updated.
     */
    readonly selectedInsight: string;
}

/**
 * @beta
 */
export interface AddInsightToStackWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.STACK_WIDGET.ADD_INSIGHT";
    readonly payload: AddInsightToStackWidgetContentPayload;
}

/**
 * Creates the ChangeRichTextWidgetContent command. Dispatching this command will result in change of the rich text widget's
 * markdown content.
 *
 * @param ref - reference of the rich text widget to modify
 * @param content - updated content
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function addInsightToStackWidgetContent(
    ref: ObjRef,
    insight: IInsight,
    selectedInsight: string,
    correlationId?: string,
): AddInsightToStackWidgetContent {
    return {
        type: "GDC.DASH/CMD.STACK_WIDGET.ADD_INSIGHT",
        correlationId,
        payload: {
            ref,
            insight,
            selectedInsight,
        },
    };
}
