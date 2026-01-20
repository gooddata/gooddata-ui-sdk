// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";
import { type IWidgetFilterOperation } from "../types/widgetTypes.js";

/**
 * Payload of the {@link IChangeRichTextWidgetContent} command.
 * @beta
 */
export interface IChangeRichTextWidgetContentPayload {
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
export interface IChangeRichTextWidgetContent extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_CONTENT";
    readonly payload: IChangeRichTextWidgetContentPayload;
}

/**
 * Creates the ChangeRichTextWidgetContent command. Dispatching this command will result in change of the rich text widget's
 * Markdown content.
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
): IChangeRichTextWidgetContent {
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
 * Payload of the {@link IChangeRichTextWidgetFilterSettings} command.
 * @beta
 */
export interface IChangeRichTextWidgetFilterSettingsPayload {
    /**
     * Reference to RichText Widget whose filter settings to change.
     */
    readonly ref: ObjRef;

    /**
     * Filter operation to apply.
     */
    readonly operation: IWidgetFilterOperation;
}

/**
 * @beta
 */
export interface IChangeRichTextWidgetFilterSettings extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS";
    readonly payload: IChangeRichTextWidgetFilterSettingsPayload;
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpEnableDateFilter} operation.
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
): IChangeRichTextWidgetFilterSettings {
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

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpDisableDateFilter} operation.
 *
 * Dispatching this command will result in change of Rich Text widget's date filter setting. The date filtering will
 * be disabled.
 *
 * @param ref - reference of the Rich Text widget to modify
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function disableRichTextWidgetDateFilter(
    ref: ObjRef,
    correlationId?: string,
): IChangeRichTextWidgetFilterSettings {
    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "disableDateFilter",
            },
        },
    };
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpIgnoreDateFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into Rich Text widget's date filter ignore-list.
 * Ignored date filters are not passed down to the metrics resolved in rich text references.
 *
 * The operation is idempotent - trying to ignore a date filter multiple times will have no effect.
 *
 * @param ref - reference of the Rich Text widget to modify
 * @param oneOrMoreDataSets - one or more refs of date datasets used by date filters that should be added to the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function ignoreDateFilterOnRichTextWidget(
    ref: ObjRef,
    oneOrMoreDataSets: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeRichTextWidgetFilterSettings {
    const dateDataSetRefs = Array.isArray(oneOrMoreDataSets) ? oneOrMoreDataSets : [oneOrMoreDataSets];

    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "ignoreDateFilter",
                dateDataSetRefs,
            },
        },
    };
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpUnignoreDateFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from Rich Text widget's date filter ignore-list.
 * Ignored date filters are not passed down to the metrics resolved in rich text references.
 *
 * The operation is idempotent - trying to unignore a date filter multiple times will have no effect.
 *
 * @param ref - reference of the Rich Text widget to modify
 * @param oneOrMoreDataSets - one or more refs of date datasets used by date filters that should be removed from the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function unignoreDateFilterOnRichTextWidget(
    ref: ObjRef,
    oneOrMoreDataSets: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeRichTextWidgetFilterSettings {
    const dateDataSetRefs = Array.isArray(oneOrMoreDataSets) ? oneOrMoreDataSets : [oneOrMoreDataSets];

    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "unignoreDateFilter",
                dateDataSetRefs,
            },
        },
    };
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpIgnoreAttributeFilter} operation.
 *
 * Dispatching this command will result in addition of one or more filters into Rich Text widget's attribute filter ignore-list.
 * Those attribute filters that use the provided displayForms for filtering will be ignored by the widget on top of any
 * other filters that are already ignored.
 *
 * Ignored attribute filters are not passed down to the metrics and will not be used to filter those metrics.
 *
 * The operation is idempotent - trying to ignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the rich text widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be added to the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function ignoreFilterOnRichTextWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeRichTextWidgetFilterSettings {
    const displayFormRefs = Array.isArray(oneOrMoreDisplayForms)
        ? oneOrMoreDisplayForms
        : [oneOrMoreDisplayForms];

    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "ignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}

/**
 * Creates the ChangeRichTextWidgetFilterSettings command for {@link IFilterOpUnignoreAttributeFilter} operation.
 *
 * Dispatching this command will result in removal of one or more filters from Rich Text widget's attribute filter ignore-list.
 * Ignored attribute filters are not passed down to the metrics and will not be used to filter those metrics.
 *
 * The operation is idempotent - trying to unignore an attribute filter multiple times will have no effect.
 *
 * @param ref - reference of the rich text widget to modify
 * @param oneOrMoreDisplayForms - one or more refs of display forms used by attribute filters that should be removed from the ignore-list
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function unignoreFilterOnRichTextWidget(
    ref: ObjRef,
    oneOrMoreDisplayForms: ObjRef | ObjRef[],
    correlationId?: string,
): IChangeRichTextWidgetFilterSettings {
    const displayFormRefs = Array.isArray(oneOrMoreDisplayForms)
        ? oneOrMoreDisplayForms
        : [oneOrMoreDisplayForms];

    return {
        type: "GDC.DASH/CMD.RICH_TEXT_WIDGET.CHANGE_FILTER_SETTINGS",
        correlationId,
        payload: {
            ref,
            operation: {
                type: "unignoreAttributeFilter",
                displayFormRefs,
            },
        },
    };
}
