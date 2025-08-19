// (C) 2020-2025 GoodData Corporation
import isObject from "lodash/isObject.js";

import { IInsightDefinition } from "@gooddata/sdk-model";

import {
    CommandFailed,
    CommandFailedData,
    GdcProductName,
    IDrillableItemsCommandBody,
    IGdcMessageEnvelope,
    IGdcMessageEvent,
    IObjectMeta,
    getEventType,
    isCommandFailedData,
} from "./common.js";
import { IFilterContextContent, IRemoveFilterContextContent } from "./EmbeddedGdc.js";
import { ILegacyBaseExportConfig, IVisualization } from "./legacyTypes.js";

/**
 * Insight Export configuration
 *
 * Note: AFM is omitted on purpose; it should be added by AD itself; create new type using Omit\<\>
 *
 * @public
 */
export interface IInsightExportConfig extends ILegacyBaseExportConfig {
    /**
     * Include applied filters
     */
    includeFilterContext?: boolean;
}

/**
 * Base type for AD events
 *
 * @public
 */
export type IGdcAdMessageEvent<T, TBody> = IGdcMessageEvent<GdcProductName.ANALYTICAL_DESIGNER, T, TBody>;

/**
 * Base type for AD event data
 *
 * @public
 */
export type IGdcAdMessageEnvelope<T, TBody> = IGdcMessageEnvelope<
    GdcProductName.ANALYTICAL_DESIGNER,
    T,
    TBody
>;

/**
 * All AD command Types
 *
 * @public
 */
export enum GdcAdCommandType {
    /**
     * The command set drillable items
     */
    DrillableItems = "drillableItems",

    /**
     * The command open an insight
     */
    OpenInsight = "openInsight",

    /**
     * The command save an insight
     */
    Save = "saveInsight",

    /**
     * The command save the insight as a new one
     */
    SaveAs = "saveAsInsight",

    /**
     * The command export an insight
     */
    Export = "exportInsight",

    /**
     * The command reset the insight editor to empty state
     */
    Clear = "clear",

    /**
     * The command empties insight buckets and filters but keeps title and ID in the URL
     */
    ClearInsight = "clearInsight",

    /**
     * The command undo to previous state
     */
    Undo = "undo",

    /**
     * The command redo to next state
     */
    Redo = "redo",

    /**
     * The command to add or update filter context
     */
    SetFilterContext = "setFilterContext",

    /**
     * The command to remove filter item from current filter context
     */
    RemoveFilterContext = "removeFilterContext",

    /**
     * The command to request cancellation
     */
    RequestCancellation = "requestCancellation",

    /**
     * The command to set API token
     */
    SetApiToken = "setApiToken",

    /**
     * The command to force reset of catalog after attribute hierarchy has been modified.
     * @beta
     */
    AttributeHierarchyModified = "attributeHierarchyModified",
}

/**
 * All event types on AD
 *
 * @public
 */
export enum GdcAdEventType {
    /**
     * Type represent that AD is listening for drillable items command.
     */
    ListeningForDrillableItems = "listeningForDrillableItems",

    /**
     * Type represent that a new insight is initialized
     */
    NewInsightInitialized = "newInsightInitialized",

    /**
     * Type represent that the insight is opened
     */
    InsightOpened = "insightOpened",

    /**
     * Type represent that the insight is rendered
     */
    InsightRendered = "insightRendered",

    /**
     * Type represent that the insight editor is cleared
     */
    ClearFinished = "clearFinished",

    /**
     * Type represent that the insight is cleared
     */
    ClearInsightFinished = "clearInsightFinished",

    /**
     * Type represent that the insight is saved
     *
     * Note: use `visualizationSaved` because of backward compatibility
     * See visualizationSaved event on https://help.gooddata.com
     */
    InsightSaved = "visualizationSaved",

    /**
     * Type represent that the undo action is finished
     */
    UndoFinished = "undoFinished",

    /**
     * Type represent that the redo action is finished
     */
    RedoFinished = "redoFinished",

    /**
     * Type represent that the export action is finished
     */
    ExportFinished = "exportInsightFinished",

    /**
     * Type that drill performed
     */
    Drill = "drill",

    /**
     * Type represent that the filter context is changed
     */
    FilterContextChanged = "filterContextChanged",

    /**
     * Type represent that the set filter context action is finished
     */
    SetFilterContextFinished = "setFilterContextFinished",

    /**
     * Type represent that the remove filter context action is finished
     */
    RemoveFilterContextFinished = "removeFilterContextFinished",

    /**
     * Type notify AD that the insight editing has been cancelled
     */
    InsightEditingCancelled = "insightEditingCancelled",

    /**
     * Type to notify AD that the insight has been changed and execution started. It contains new insight definition.
     */
    InsightChanged = "insightChanged",

    /**
     * Type represents that AD is listening and waiting for API token to set up SDK backend instance.
     * AD will not continue with initialization until the token is set.
     */
    ListeningForApiToken = "listeningForApiToken",

    /**
     * Type notifies embedding application that API token is about to expire and a new API token
     * must be set via "setApiToken" command, otherwise session will expire soon (how soon depends on
     * the reminder settings, by default in 60 seconds, can be changed by optional parameter with
     * "setApiToken" was called the last time).
     */
    ApiTokenIsAboutToExpire = "apiTokenIsAboutToExpire",

    /**
     * Type to notify that the attribute hierarchy has been modified.
     * @beta
     */
    AttributeHierarchyModified = "attributeHierarchyModified",
}

/**
 * This event will be emitted if AD runs into errors while processing the posted command.
 *
 * @remarks see {@link GdcErrorType} for types of errors that may fly
 * @public
 */
export type AdCommandFailed = CommandFailed<GdcProductName.ANALYTICAL_DESIGNER>;

/**
 * Base type for the data of error events sent by AD
 * in case command processing comes to an expected or unexpected halt.
 *
 * @public
 */
export type AdCommandFailedData = CommandFailedData<GdcProductName.ANALYTICAL_DESIGNER>;

/**
 * Type-guard checking whether an object is an instance of {@link AdCommandFailedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdCommandFailedData(obj: unknown): obj is AdCommandFailedData {
    return isCommandFailedData<GdcProductName.ANALYTICAL_DESIGNER>(obj);
}

/**
 * Set drillable items.
 *
 * Contract:
 *
 * - Drillable items can be set by uris or identifiers of insight's measures/attributes
 *
 * @public
 */
export type AdDrillableItemsCommand = IGdcAdMessageEvent<
    GdcAdCommandType.DrillableItems,
    IDrillableItemsCommandBody
>;

/**
 * Data type of drillable items command
 *
 * Note: The main event data was wrapped to application and product data structure
 *
 * @remarks See {@link IDrillableItemsCommandBody}
 *
 * @public
 */
export type AdDrillableItemsCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.DrillableItems,
    IDrillableItemsCommandBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdDrillableItemsCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdDrillableItemsCommandData(obj: unknown): obj is AdDrillableItemsCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.DrillableItems;
}

//
// Open insight command
//

/**
 * Contain the information to construct the AD url to open an insight editor
 *
 * @public
 */
export interface IAdOpenInsightCommandBody {
    /**
     * Dataset identifier - A dataset consists of attributes and facts,
     * which correspond to data you want to measure and the data
     * that you want to use to segment or filter those measurements.
     */
    dataset?: string;

    /**
     * Project id
     */
    projectId?: string;

    /**
     * Client id - Each client has an identifier unique within the domain
     *
     * Note: use the combination of the data product ID and client ID instead of the project ID
     */
    clientId?: string;

    /**
     * Product id - A data product contains multiple segments. And a segment has clients assigned to it
     *
     * Note: use the combination of the data product ID and client ID instead of the project ID
     */
    productId?: string;

    /**
     * Insight id - leave it empty to reset the insight editor to empty state
     */
    insightId?: string;

    /**
     * Insight id - leave it empty to reset the insight editor to empty state
     *
     * Note: if both insightId and reportId are provided. the insightId will be use higher
     * with higher priority.
     */
    reportId?: string;

    /**
     * Show only the attributes, measures, facts, and dates with the specified tag
     */
    includeObjectsWithTags?: string;

    /**
     * Hide the attributes, measures, facts, and dates with the specified tag
     */
    excludeObjectsWithTags?: string;
}

/**
 * Open an insight.
 *
 * Contract:
 *
 * - if the insight could not found, then CommandFailed event will be posted
 * - after the insight is opened, then {@link AdInsightOpened} event will be posted
 *
 * Note: if insightId isn't provided, the empty insight editor will be opened
 *
 * @public
 */
export type AdOpenInsightCommand = IGdcAdMessageEvent<
    GdcAdCommandType.OpenInsight,
    IAdOpenInsightCommandBody
>;

/**
 * Data type of open insight command
 *
 * Note: The main event data was wrapped to application and product data structure
 *
 * @remarks See {@link IAdOpenInsightCommandBody}
 *
 * @public
 */
export type AdOpenInsightCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.OpenInsight,
    IAdOpenInsightCommandBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdOpenInsightCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdOpenInsightCommandData(obj: unknown): obj is AdOpenInsightCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.OpenInsight;
}

//
// Clear command
//

/**
 * Triggers the clear action to reset the insight editor to empty state
 *
 * @public
 */
export type AdClearCommand = IGdcAdMessageEvent<GdcAdCommandType.Clear, undefined>;

/**
 * Data type of clear command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdClearCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Clear, undefined>;

/**
 * Type-guard checking whether an object is an instance of  {@link AdClearCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdClearCommandData(obj: unknown): obj is AdClearCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.Clear;
}

//
// ClearInsight command
//

/**
 * Triggers the clearInsight action to reset the insight to empty state
 *
 * @public
 */
export type AdClearInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.ClearInsight, undefined>;

/**
 * Data type of clearInsight command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdClearInsightCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.ClearInsight, undefined>;

/**
 * Type-guard checking whether an object is an instance of {@link AdClearInsightCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdClearInsightCommandData(obj: unknown): obj is AdClearInsightCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.ClearInsight;
}

//
// RequestCancellation command
//

/**
 * Triggers the action to request cancellation
 *
 * @public
 */
export type AdRequestCancellationCommand = IGdcAdMessageEvent<
    GdcAdCommandType.RequestCancellation,
    undefined
>;

/**
 * Data type of {@link AdRequestCancellationCommand} command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdRequestCancellationCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.RequestCancellation,
    undefined
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdRequestCancellationCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdRequestCancellationCommandData(obj: unknown): obj is AdRequestCancellationCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.RequestCancellation;
}

//
// Save command
//

/**
 * Save command body sent by outer application
 *
 * @public
 */
export interface IAdSaveCommandBody {
    /**
     * Insight title - use as title of new insight or rename of saved insight
     */
    title: string;
}

/**
 * Saves current insight.
 *
 * Contract:
 *
 * -  if currently edited insight IS NOT eligible for save (empty, in-error), then CommandFailed event
 *    will be posted
 * -  if the specified title is invalid / does not match title validation rules, then CommandFailed event
 *    will be posted
 * -  otherwise insight WILL be saved with the title as specified in the body and the InsightSaved event
 *    will be posted
 * -  the InsightSaved event will be posted even when saving insights that have not changed but are eligible
 *    for saving (not empty, not in-error)
 *
 * Note: sending AdSaveInsightCommand with different title means insight will be saved with that new title.
 *
 * @public
 */
export type AdSaveInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.Save, IAdSaveCommandBody>;

/**
 * Data type of save insight command
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See  {@link IAdSaveCommandBody}
 *
 * @public
 */
export type AdSaveInsightCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Save, IAdSaveCommandBody>;

/**
 * Type-guard checking whether an object is an instance of {@link AdSaveInsightCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdSaveInsightCommandData(obj: unknown): obj is AdSaveInsightCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.Save;
}

//
// Save As command
//

/**
 * Save As command body sent by outer application
 *
 * @public
 */
export interface IAdSaveAsInsightCommandBody {
    /**
     * Insight title - use as title of new insight
     */
    readonly title: string;
}

/**
 * Saves current insight as a new object, with a different title. The title is specified
 *
 * Contract is same as {@link AdSaveInsightCommand}.
 *
 * @public
 */
export type AdSaveAsInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.SaveAs, IAdSaveAsInsightCommandBody>;

/**
 * Data type of save as insight command
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link IAdSaveAsInsightCommandBody}
 *
 * @public
 */
export type AdSaveAsInsightCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.SaveAs,
    IAdSaveAsInsightCommandBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdSaveAsInsightCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdSaveAsInsightCommandData(obj: unknown): obj is AdSaveAsInsightCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.SaveAs;
}

//
// Export command
//

/**
 * Export command body sent by outer application
 *
 * @public
 */
export interface IAdExportInsightCommandBody {
    /**
     * Configuration for exported file.
     *
     * @remarks See IInsightExportConfig for more details about possible configuration options
     *
     * @public
     */
    readonly config: IInsightExportConfig;
}

/**
 * Exports current insight into CSV or XLSX.
 *
 * Contract:
 *
 * -  if the currently edited insight IS eligible for export then it is done and the ExportFinished event will be
 *    posted with `link` to the result.
 * -  if the currently edited insight IS NOT eligible for export (empty, in-error), then {@link AdCommandFailed} event
 *    will be posted.
 * -  if the specified export config is invalid / does not match validation rules, then {@link AdCommandFailed} event
 *    will be posted
 *
 * @public
 */
export type AdExportInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.Export, IAdExportInsightCommandBody>;

/**
 * Data type of export insight command
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link IAdExportInsightCommandBody}
 *
 * @public
 */
export type AdExportInsightCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.Export,
    IAdExportInsightCommandBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdExportInsightCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdExportInsightCommandData(obj: unknown): obj is AdExportInsightCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.Export;
}

//
// Undo
//

/**
 * Triggers the undo action.
 *
 * Contract:
 *
 * -  if it is valid to perform Undo operation, AD will do it and the {@link AdUndoFinished} will be posted once the
 *    undo completes
 *
 * -  if the Undo operation is not available in current state of AD, then {@link AdCommandFailed} will be posted
 *
 * @public
 */
export type AdUndoCommand = IGdcAdMessageEvent<GdcAdCommandType.Undo, undefined>;

/**
 * Data type of undo command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdUndoCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Undo, undefined>;

/**
 * Type-guard checking whether an object is an instance of {@link AdCommandFailed}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdUndoCommandData(obj: unknown): obj is AdUndoCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.Undo;
}

//
// Redo
//

/**
 * Triggers the redo action.
 *
 * Contract:
 *
 * -  if it is valid to perform Redo operation, AD will do it and the {@link AdRedoFinished}  will be posted once the
 *    redo completes
 *
 * -  if the Redo operation is not available in current state of AD, then {@link AdCommandFailed} will be posted
 *
 * @public
 */
export type AdRedoCommand = IGdcAdMessageEvent<GdcAdCommandType.Redo, undefined>;

/**
 * Data type of redo command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdRedoCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Redo, undefined>;

/**
 * Type-guard checking whether an object is an instance of {@link AdRedoCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdRedoCommandData(obj: unknown): obj is AdRedoCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.Redo;
}

/**
 * Data type of {@link AdSetFilterContextCommand} command
 *
 * @public
 */
export type AdSetFilterContextCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.SetFilterContext,
    IFilterContextContent
>;

/**
 * Add or update the filter context
 *
 * Contract:
 * - if filters are same with filters on the AD filter bar, then update the filters on the filter bar
 *   and apply the filters to insight
 * - if filters are new, then add them to the AD filter bar and apply to insight
 * - in-case the AD can not apply the filters, a CommandFailed will be posted. The reason could be
 *   - Filter is not existed in the dataset
 *   - Filter is existed but wrong elements input data
 *   - Exceed the limit number of filter items
 *
 * @public
 */
export type AdSetFilterContextCommand = IGdcAdMessageEvent<
    GdcAdCommandType.SetFilterContext,
    IFilterContextContent
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdSetFilterContextCommand}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdSetFilterContextCommandData(obj: unknown): obj is AdSetFilterContextCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.SetFilterContext;
}

/**
 * Data type of removeFilterContext command
 *
 * @public
 */
export type AdRemoveFilterContextCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.RemoveFilterContext,
    IRemoveFilterContextContent
>;

/**
 * Remove the filter context
 * Contract:
 * - if filters are in the filter bar, then remove the filters on the filter bar and update insight
 * - if filters are not in the filter bar, then a CommandFailed will be posted.
 *
 * @public
 */
export type AdRemoveFilterContextCommand = IGdcAdMessageEvent<
    GdcAdCommandType.RemoveFilterContext,
    IRemoveFilterContextContent
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdRemoveFilterContextCommand}  RemoveFilterContextCommand
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdRemoveFilterContextCommandData(obj: unknown): obj is AdRemoveFilterContextCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.RemoveFilterContext;
}

//
// Events
//

/**
 * List of available commands; this is included in each event sent by AD.
 *
 * @public
 */
export interface IAdAvailableCommands {
    /**
     * Array of available commands types
     */
    availableCommands: GdcAdCommandType[];
}

//
// New Insight Initialized
//

/**
 * It's main content is empty.
 *
 * @public
 */
export type AdNewInsightInitializedBody = IAdAvailableCommands;

/**
 * This event is emitted when AD initializes edit session for a new insight.
 *
 * @public
 */
export type AdNewInsightInitialized = IGdcAdMessageEvent<
    GdcAdEventType.NewInsightInitialized,
    AdNewInsightInitializedBody
>;

/**
 * Data type of event that was emitted when the new insight initialized
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @public
 */
export type AdNewInsightInitializedData = IGdcAdMessageEnvelope<
    GdcAdEventType.NewInsightInitialized,
    undefined
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdNewInsightInitializedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdNewInsightInitializedData(obj: unknown): obj is AdNewInsightInitializedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.NewInsightInitialized;
}

//
// Insight Opened
//

/**
 * Main data of InsightOpened event
 *
 * @public
 */
export type AdInsightOpenedBody = IAdAvailableCommands & {
    /**
     * The minimal opened insight information
     */
    insight: IObjectMeta;

    /**
     * Definition of insight
     */
    definition: IInsightDefinition;
};

/**
 * This event is emitted when AD initializes edit session for an existing insight. Essential detail about
 * the insight is included in the body.
 *
 * @public
 */
export type AdInsightOpened = IGdcAdMessageEvent<GdcAdEventType.InsightOpened, AdInsightOpenedBody>;

/**
 * Data type of event that was emitted when an insight is opened
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link AdInsightOpenedBody}
 *
 * @public
 */
export type AdInsightOpenedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightOpened, AdInsightOpenedBody>;

/**
 * Type-guard checking whether an object is an instance of {@link AdInsightOpenedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdInsightOpenedData(obj: unknown): obj is AdInsightOpenedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.InsightOpened;
}

//
// Insight Rendered
//

/**
 * Main data of {@link AdInsightRendered} event
 *
 * @public
 */
export type AdInsightRenderedBody = IAdAvailableCommands & {
    /**
     * The minimal rendered insight information
     */
    insight: IObjectMeta;

    /**
     * Message about rendering error (if any)
     */
    errorMessage?: string;
};

/**
 * This event is emitted when AD has finished rendering an insight. Essential detail about
 * the insight is included in the body.
 *
 * @public
 */
export type AdInsightRendered = IGdcAdMessageEvent<GdcAdEventType.InsightRendered, AdInsightRenderedBody>;

/**
 * Data type of event that was emitted when an insight is rendered
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See  {@link AdInsightRenderedBody}
 *
 * @public
 */
export type AdInsightRenderedData = IGdcAdMessageEnvelope<
    GdcAdEventType.InsightRendered,
    AdInsightRenderedBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdInsightRenderedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdInsightRenderedData(obj: unknown): obj is AdInsightRenderedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.InsightRendered;
}

//
// clear finished
//

/**
 * This event is emitted when AD successfully performs clear operation.
 *
 * @public
 */
export type AdClearFinished = IGdcAdMessageEvent<GdcAdEventType.ClearFinished, IAdAvailableCommands>;

/**
 * Data type of event that was emitted after finish clear action
 *
 * Note: The main event data was wrapped to application and product data structure
 *
 * @public
 */
export type AdClearFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.ClearFinished, IAdAvailableCommands>;

/**
 * Type-guard checking whether an object is an instance of {@link AdClearFinishedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdClearFinishedData(obj: unknown): obj is AdClearFinishedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.ClearFinished;
}

//
// clearInsight finished
//

/**
 * This event is emitted when AD successfully performs clearInsight operation.
 *
 * @public
 */
export type AdClearInsightFinished = IGdcAdMessageEvent<
    GdcAdEventType.ClearInsightFinished,
    IAdAvailableCommands
>;

/**
 * Data type of event that was emitted after finish clearInsight action
 *
 * Note: The main event data was wrapped to application and product data structure
 *
 * @public
 */
export type AdClearInsightFinishedData = IGdcAdMessageEnvelope<
    GdcAdEventType.ClearInsightFinished,
    IAdAvailableCommands
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdClearInsightFinishedData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdClearInsightFinishedData(obj: unknown): obj is AdClearInsightFinishedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.ClearInsightFinished;
}

//
// Insight Saved
//

/**
 * Main data of  {@link AdInsightSaved}  event
 *
 * Note: `visualizationObject` is kept because of backward compatibility
 *
 * @public
 */
export type AdInsightSavedBody = IAdAvailableCommands &
    IVisualization & {
        /**
         * The minimal saved insight information
         */
        insight: IObjectMeta;
    };

/**
 * This event is emitted when AD saves the currently edited insight.
 *
 * @public
 */
export type AdInsightSaved = IGdcAdMessageEvent<GdcAdEventType.InsightSaved, AdInsightSavedBody>;

/**
 * Data type of event that was emitted when an insight is saved
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link AdInsightSavedBody}
 * @public
 */
export type AdInsightSavedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightSaved, AdInsightSavedBody>;

/**
 * Type-guard checking whether an object is an instance of {@link AdInsightSavedData}
 *
 * @param obj - object to test
 * @public
 */
export function isAdInsightSavedData(obj: unknown): obj is AdInsightSavedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.InsightSaved;
}

//
// Export
//

/**
 * Main data of {@link AdExportFinished} event
 * @public
 */
export type AdExportFinishedBody = IAdAvailableCommands & {
    /**
     * Link to the file containing exported data.
     */
    link: string;
};

/**
 * This event is emitted when AD successfully exports data visualized by the currently edited insight.
 * @public
 */
export type AdExportFinished = IGdcAdMessageEvent<GdcAdEventType.ExportFinished, AdExportFinishedBody>;

/**
 * Data type of event that was emitted after an insight was exported
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link AdExportFinishedBody}
 * @public
 */
export type AdExportFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.ExportFinished, AdExportFinishedBody>;

/**
 * Type-guard checking whether an object is an instance of {@link AdExportFinishedData}
 *
 * @param obj - object to test
 * @public
 */
export function isAdExportFinishedData(obj: unknown): obj is AdExportFinishedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.ExportFinished;
}

//
// Undo finished
//

/**
 * It's main content is empty.
 * @public
 */
export type AdUndoFinishedBody = IAdAvailableCommands;

/**
 * This event is emitted when AD successfully performs Undo operation.
 * @public
 */
export type AdUndoFinished = IGdcAdMessageEvent<GdcAdEventType.UndoFinished, AdUndoFinishedBody>;

/**
 * Data type of event that was emitted after finish undo action
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link AdUndoFinishedBody}
 * @public
 */
export type AdUndoFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.UndoFinished, AdUndoFinishedBody>;

/**
 * Type-guard checking whether an object is an instance of {@link AdUndoFinishedData}
 *
 * @param obj - object to test
 * @public
 */
export function isAdUndoFinishedData(obj: unknown): obj is AdUndoFinishedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.UndoFinished;
}

//
// Redo finished
//

/**
 * It's main content is empty.
 * @public
 */
export type AdRedoFinishedBody = IAdAvailableCommands;

/**
 * This event is emitted when AD successfully performs Undo operation.
 *
 * @public
 */
export type AdRedoFinished = IGdcAdMessageEvent<GdcAdEventType.RedoFinished, AdRedoFinishedBody>;

/**
 * Data type of event that was emitted after finish redo action
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link AdRedoFinishedBody}
 * @public
 */
export type AdRedoFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.RedoFinished, AdRedoFinishedBody>;

/**
 * Type-guard checking whether an object is an instance of  {@link AdRedoFinishedData}
 *
 * @param obj - object to test
 * @public
 */
export function isAdRedoFinishedData(obj: unknown): obj is AdRedoFinishedData {
    return isObject(obj) && getEventType(obj) === GdcAdEventType.RedoFinished;
}

//
// setFilterContext finished
//

/**
 * Data type of event that was emitted after finishing set filter context
 *
 * Note: The main event data was wrapped to application and product data structure
 * @public
 */
export type AdSetFilterContextFinishedData = IGdcAdMessageEnvelope<
    GdcAdEventType.SetFilterContextFinished,
    IAdAvailableCommands
>;

//
// removeFilterContext finished
//

/**
 * Data type of event that was emitted after finishing remove filter context
 *
 * Note: The main event data was wrapped to application and product data structure
 * @public
 */
export type AdRemoveFilterContextFinishedData = IGdcAdMessageEnvelope<
    GdcAdEventType.RemoveFilterContextFinished,
    IAdAvailableCommands
>;

//
// FilterContext changed
//

/**
 * Main data of Filter context changed event
 * @public
 */
export type AdFilterContextChangedBody = IAdAvailableCommands & IFilterContextContent;

/**
 * Data type of event that was emitted after finishing change filter context
 *
 * Note: The main event data was wrapped to application and product data structure
 * @public
 */
export type AdFilterContextChangedData = IGdcAdMessageEnvelope<
    GdcAdEventType.FilterContextChanged,
    AdFilterContextChangedBody
>;

/**
 * @public
 */
export type AdInsightChangedBody = IAdAvailableCommands & {
    definition: IInsightDefinition;
};

/**
 * @public
 */
export type AdInsightChangedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightChanged, AdInsightChangedBody>;

//
// Set API token command
//

/**
 * Set API token command body sent by outer application
 *
 * @public
 */
export interface IAdSetApiTokenBody {
    /**
     * API token value - used to set up SDK backend instance
     */
    token: string;
    /**
     * Type of the API token, default value is "GoodData"
     */
    type?: "gooddata" | "jwt";
    /**
     * Number of seconds before a postMessage event about to be expired JWT is emitted.
     * Used only when type == jwt. Default value is 60 seconds.
     */
    secondsBeforeTokenExpirationToEmitReminder?: number;
}

/**
 * Sets API token.
 *
 * Contract:
 *
 * -  received value is set as API token into the backend instance that will be used by AD for all
 *      the subsequent backend calls. If the token is invalid, the subsequent backend calls will
 *      start to fail.
 *
 * @public
 */
export type AdSetApiTokenCommand = IGdcAdMessageEvent<GdcAdCommandType.SetApiToken, IAdSetApiTokenBody>;

/**
 * Data type of set API token command
 *
 * Note: The main event data was wrapped to application and product data structure
 * @remarks See {@link IAdSetApiTokenBody}
 *
 * @public
 */
export type AdSetApiTokenCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.SetApiToken,
    IAdSetApiTokenBody
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdSetApiTokenCommandData}
 *
 * @param obj - object to test
 *
 * @public
 */
export function isAdSetApiTokenCommandData(obj: unknown): obj is AdSetApiTokenCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.SetApiToken;
}

//
// AttributeHierarchyModified command
//

/**
 * Triggers the attributeHierarchyModified action to reset catalogs.
 *
 * @beta
 */
export type AdAttributeHierarchyModifiedCommand = IGdcAdMessageEvent<
    GdcAdCommandType.AttributeHierarchyModified,
    undefined
>;

/**
 * Data type of attributeHierarchyModified command
 *
 * Note: it has empty content and just wrapped to application and product data structure
 *
 * @beta
 */
export type AdAttributeHierarchyModifiedCommandData = IGdcAdMessageEnvelope<
    GdcAdCommandType.AttributeHierarchyModified,
    undefined
>;

/**
 * Type-guard checking whether an object is an instance of {@link AdAttributeHierarchyModifiedCommandData}
 *
 * @param obj - object to test
 *
 * @beta
 */
export function isAttributeHierarchyModifiedCommandData(
    obj: unknown,
): obj is AdAttributeHierarchyModifiedCommandData {
    return isObject(obj) && getEventType(obj) === GdcAdCommandType.AttributeHierarchyModified;
}
