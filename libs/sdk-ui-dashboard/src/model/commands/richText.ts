// (C) 2021-2025 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

import { IDashboardCommand } from "./base.js";
import { WidgetFilterOperation } from "../types/widgetTypes.js";

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

//
//
//

/**
 * Payload of the {@link ChangeRichTextWidgetFilterSettings} command.
 * @beta
 */
export interface ChangeRichTextWidgetFilterSettingsPayload {
    /**
     * Reference to RichText Widget whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Filter operation to apply.
     */
    readonly operation: WidgetFilterOperation;
}

/**
 * @beta
 */
export interface ChangeRichTextWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: ChangeRichTextWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link FilterOpEnableDateFilter} operation.
 *
 * Dispatching this command will result in change of RichText widget's date filter setting. The date filtering will
 * be enabled and the provided date data set will be used for date-filtering widget's RichText.
 *
 * @param ref - reference of the RichText widget to modify
 * @param dateDataset - date data set to use for filtering the RichText, if "default" is provided, the default date dataset will be resolved and used
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function enableRichTextWidgetDateFilter(
    ref: ObjRef,
    dateDataset: ObjRef | "default",
    correlationId?: string,
): ChangeRichTextWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "enableDateFilter",
                dateDataset,
            },
        },
    };
}
