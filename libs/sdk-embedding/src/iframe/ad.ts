// (C) 2020-2022 GoodData Corporation
import isObject from "lodash/isObject";
import {
    CommandFailed,
    IObjectMeta,
    IGdcMessageEvent,
    IGdcMessageEnvelope,
    CommandFailedData,
    isCommandFailedData,
    GdcProductName,
    getEventType,
    IDrillableItemsCommandBody,
    EmbeddedGdc,
} from "./common";
import { IInsightDefinition } from "@gooddata/sdk-model";
import { GdcExport, GdcVisualizationObject } from "@gooddata/api-model-bear";

/**
 * All interface, types, type-guard related to embedded Analytical Designer
 *
 * @public
 */
export namespace EmbeddedAnalyticalDesigner {
    /**
     * Insight Export configuration
     *
     * Note: AFM is omitted on purpose; it should be added by AD itself; create new type using Omit\<\>
     *
     * @public
     */
    export interface IInsightExportConfig extends GdcExport.IBaseExportConfig {
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
         * Set auth data
         * @internal
         */
        SetAuth = "setAuth",
    }

    /**
     * All event types on AD
     *
     * @public
     */
    export enum GdcAdEventType {
        /**
         * Type represent that Insight is saved
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
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.AdCommandFailedData}
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
    export type DrillableItemsCommand = IGdcAdMessageEvent<
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
    export type DrillableItemsCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.DrillableItems,
        IDrillableItemsCommandBody
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.DrillableItemsCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isDrillableItemsCommandData(obj: unknown): obj is DrillableItemsCommandData {
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
    export interface IOpenInsightCommandBody {
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
     * - after the insight is opened, then InsightOpened event will be posted
     *
     * Note: if insightId isn't provided, the empty insight editor will be opened
     *
     * @public
     */
    export type OpenInsightCommand = IGdcAdMessageEvent<
        GdcAdCommandType.OpenInsight,
        IOpenInsightCommandBody
    >;

    /**
     * Data type of open insight command
     *
     * Note: The main event data was wrapped to application and product data structure
     *
     * @remarks See {@link EmbeddedAnalyticalDesigner.IOpenInsightCommandBody}
     *
     * @public
     */
    export type OpenInsightCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.OpenInsight,
        IOpenInsightCommandBody
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.OpenInsightCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isOpenInsightCommandData(obj: unknown): obj is OpenInsightCommandData {
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
    export type ClearCommand = IGdcAdMessageEvent<GdcAdCommandType.Clear, undefined>;

    /**
     * Data type of clear command
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type ClearCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Clear, undefined>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ClearCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isClearCommandData(obj: unknown): obj is ClearCommandData {
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
    export type ClearInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.ClearInsight, undefined>;

    /**
     * Data type of clearInsight command
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type ClearInsightCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.ClearInsight, undefined>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ClearInsightCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isClearInsightCommandData(obj: unknown): obj is ClearInsightCommandData {
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
    export type RequestCancellationCommand = IGdcAdMessageEvent<
        GdcAdCommandType.RequestCancellation,
        undefined
    >;

    /**
     * Data type of RequestCancellation command
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type RequestCancellationCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.RequestCancellation,
        undefined
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.RequestCancellationCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isRequestCancellationCommandData(obj: unknown): obj is RequestCancellationCommandData {
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
    export interface ISaveCommandBody {
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
     * Note: sending SaveInsightCommand with different title means insight will be saved with that new title.
     *
     * @public
     */
    export type SaveInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.Save, ISaveCommandBody>;

    /**
     * Data type of save insight command
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.ISaveCommandBody}
     *
     * @public
     */
    export type SaveInsightCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Save, ISaveCommandBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.SaveInsightCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isSaveInsightCommandData(obj: unknown): obj is SaveInsightCommandData {
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
    export interface ISaveAsInsightCommandBody {
        /**
         * Insight title - use as title of new insight
         */
        readonly title: string;
    }

    /**
     * Saves current insight as a new object, with a different title. The title is specified
     *
     * Contract is same as {@link EmbeddedAnalyticalDesigner.SaveInsightCommand}.
     *
     * @public
     */
    export type SaveAsInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.SaveAs, ISaveAsInsightCommandBody>;

    /**
     * Data type of save as insight command
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.ISaveAsInsightCommandBody}
     *
     * @public
     */
    export type SaveAsInsightCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.SaveAs,
        ISaveAsInsightCommandBody
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.SaveAsInsightCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isSaveAsInsightCommandData(obj: unknown): obj is SaveAsInsightCommandData {
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
    export interface IExportInsightCommandBody {
        /**
         * Configuration for exported file.
         *
         * @remarks See {@link EmbeddedAnalyticalDesigner.IInsightExportConfig} for more details about possible configuration options
         *
         * @public
         */
        readonly config: IInsightExportConfig;
    }

    /**
     * Exports current insight into CSV or XLSX. The export configuration matches that of the exportResult
     * function already available in `api-model-bear`. Please consult {@link @gooddata/api-model-bear#GdcExport.IBaseExportConfig} for more
     * detail about possible export configuration options.
     *
     * Contract:
     *
     * -  if the currently edited insight IS eligible for export then it is done and the ExportFinished event will be
     *    posted with `link` to the result.
     * -  if the currently edited insight IS NOT eligible for export (empty, in-error), then CommandFailed event
     *    will be posted.
     * -  if the specified export config is invalid / does not match validation rules, then CommandFailed event
     *    will be posted
     *
     * @public
     */
    export type ExportInsightCommand = IGdcAdMessageEvent<GdcAdCommandType.Export, IExportInsightCommandBody>;

    /**
     * Data type of export insight command
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.IExportInsightCommandBody}
     *
     * @public
     */
    export type ExportInsightCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.Export,
        IExportInsightCommandBody
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ExportInsightCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isExportInsightCommandData(obj: unknown): obj is ExportInsightCommandData {
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
     * -  if it is valid to perform Undo operation, AD will do it and the UndoFinished will be posted once the
     *    undo completes
     *
     * -  if the Undo operation is not available in current state of AD, then CommandFailed will be posted
     *
     * @public
     */
    export type UndoCommand = IGdcAdMessageEvent<GdcAdCommandType.Undo, undefined>;

    /**
     * Data type of undo command
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type UndoCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Undo, undefined>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.UndoCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isUndoCommandData(obj: unknown): obj is UndoCommandData {
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
     * -  if it is valid to perform Redo operation, AD will do it and the RedoFinished will be posted once the
     *    redo completes
     *
     * -  if the Redo operation is not available in current state of AD, then CommandFailed will be posted
     *
     * @public
     */
    export type RedoCommand = IGdcAdMessageEvent<GdcAdCommandType.Redo, undefined>;

    /**
     * Data type of redo command
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type RedoCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.Redo, undefined>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.RedoCommandData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isRedoCommandData(obj: unknown): obj is RedoCommandData {
        return isObject(obj) && getEventType(obj) === GdcAdCommandType.Redo;
    }

    /**
     * Data type of SetFilterContext command
     *
     * @public
     */
    export type SetFilterContextCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.SetFilterContext,
        EmbeddedGdc.IFilterContextContent
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
    export type SetFilterContextCommand = IGdcAdMessageEvent<
        GdcAdCommandType.SetFilterContext,
        EmbeddedGdc.IFilterContextContent
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.SetFilterContextCommand}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isSetFilterContextCommandData(obj: unknown): obj is SetFilterContextCommandData {
        return isObject(obj) && getEventType(obj) === GdcAdCommandType.SetFilterContext;
    }

    /**
     * Data type of removeFilterContext command
     *
     * @public
     */
    export type RemoveFilterContextCommandData = IGdcAdMessageEnvelope<
        GdcAdCommandType.RemoveFilterContext,
        EmbeddedGdc.IRemoveFilterContextContent
    >;

    /**
     * Remove the filter context
     * Contract:
     * - if filters are in the filter bar, then remove the filters on the filter bar and update insight
     * - if filters are not in the filter bar, then a CommandFailed will be posted.
     *
     * @public
     */
    export type RemoveFilterContextCommand = IGdcAdMessageEvent<
        GdcAdCommandType.RemoveFilterContext,
        EmbeddedGdc.IRemoveFilterContextContent
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.RemoveFilterContextCommand}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isRemoveFilterContextCommandData(obj: unknown): obj is RemoveFilterContextCommandData {
        return isObject(obj) && getEventType(obj) === GdcAdCommandType.RemoveFilterContext;
    }

    /**
     * @internal
     */
    export type SetAuthCommandData = IGdcAdMessageEnvelope<GdcAdCommandType.SetAuth, { auth: string }>;

    /**
     * @internal
     */
    export type SetAuthCommand = IGdcAdMessageEvent<GdcAdCommandType.RemoveFilterContext, { auth: string }>;

    /**
     * @internal
     */
    export function isSetAuthCommandData(obj: unknown): obj is SetAuthCommandData {
        return isObject(obj) && getEventType(obj) === GdcAdCommandType.SetAuth;
    }

    //
    // Events
    //

    /**
     * List of available commands; this is included in each event sent by AD.
     *
     * @public
     */
    export interface IAvailableCommands {
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
    export type NewInsightInitializedBody = IAvailableCommands;

    /**
     * This event is emitted when AD initializes edit session for a new insight.
     *
     * @public
     */
    export type NewInsightInitialized = IGdcAdMessageEvent<
        GdcAdEventType.NewInsightInitialized,
        NewInsightInitializedBody
    >;

    /**
     * Data type of event that was emitted when the new insight initialized
     *
     * Note: it has empty content and just wrapped to application and product data structure
     *
     * @public
     */
    export type NewInsightInitializedData = IGdcAdMessageEnvelope<
        GdcAdEventType.NewInsightInitialized,
        undefined
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.NewInsightInitializedData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isNewInsightInitializedData(obj: unknown): obj is NewInsightInitializedData {
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
    export type InsightOpenedBody = IAvailableCommands & {
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
    export type InsightOpened = IGdcAdMessageEvent<GdcAdEventType.InsightOpened, InsightOpenedBody>;

    /**
     * Data type of event that was emitted when an insight is opened
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.InsightOpenedBody}
     *
     * @public
     */
    export type InsightOpenedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightOpened, InsightOpenedBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.InsightOpenedData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isInsightOpenedData(obj: unknown): obj is InsightOpenedData {
        return isObject(obj) && getEventType(obj) === GdcAdEventType.InsightOpened;
    }

    //
    // Insight Rendered
    //

    /**
     * Main data of InsightRendered event
     *
     * @public
     */
    export type InsightRenderedBody = IAvailableCommands & {
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
    export type InsightRendered = IGdcAdMessageEvent<GdcAdEventType.InsightRendered, InsightRenderedBody>;

    /**
     * Data type of event that was emitted when an insight is rendered
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.InsightRenderedBody}
     *
     * @public
     */
    export type InsightRenderedData = IGdcAdMessageEnvelope<
        GdcAdEventType.InsightRendered,
        InsightRenderedBody
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.InsightRenderedData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isInsightRenderedData(obj: unknown): obj is InsightRenderedData {
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
    export type ClearFinished = IGdcAdMessageEvent<GdcAdEventType.ClearFinished, IAvailableCommands>;

    /**
     * Data type of event that was emitted after finish clear action
     *
     * Note: The main event data was wrapped to application and product data structure
     *
     * @public
     */
    export type ClearFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.ClearFinished, IAvailableCommands>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ClearFinishedData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isClearFinishedData(obj: unknown): obj is ClearFinishedData {
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
    export type ClearInsightFinished = IGdcAdMessageEvent<
        GdcAdEventType.ClearInsightFinished,
        IAvailableCommands
    >;

    /**
     * Data type of event that was emitted after finish clearInsight action
     *
     * Note: The main event data was wrapped to application and product data structure
     *
     * @public
     */
    export type ClearInsightFinishedData = IGdcAdMessageEnvelope<
        GdcAdEventType.ClearInsightFinished,
        IAvailableCommands
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ClearInsightFinishedData}
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isClearInsightFinishedData(obj: unknown): obj is ClearInsightFinishedData {
        return isObject(obj) && getEventType(obj) === GdcAdEventType.ClearInsightFinished;
    }

    //
    // Insight Saved
    //

    /**
     * Main data of InsightSaved event
     *
     * Note: `visualizationObject` is kept because of backward compatibility
     *
     * @public
     */
    export type InsightSavedBody = IAvailableCommands &
        GdcVisualizationObject.IVisualization & {
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
    export type InsightSaved = IGdcAdMessageEvent<GdcAdEventType.InsightSaved, InsightSavedBody>;

    /**
     * Data type of event that was emitted when an insight is saved
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.InsightSavedBody}
     * @public
     */
    export type InsightSavedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightSaved, InsightSavedBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.InsightSavedData}
     *
     * @param obj - object to test
     * @public
     */
    export function isInsightSavedData(obj: unknown): obj is InsightSavedData {
        return isObject(obj) && getEventType(obj) === GdcAdEventType.InsightSaved;
    }

    //
    // Export
    //

    /**
     * Main data of ExportFinished event
     * @public
     */
    export type ExportFinishedBody = IAvailableCommands & {
        /**
         * Link to the file containing exported data.
         */
        link: string;
    };

    /**
     * This event is emitted when AD successfully exports data visualized by the currently edited insight.
     * @public
     */
    export type ExportFinished = IGdcAdMessageEvent<GdcAdEventType.ExportFinished, ExportFinishedBody>;

    /**
     * Data type of event that was emitted after an insight was exported
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.ExportFinishedBody}
     * @public
     */
    export type ExportFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.ExportFinished, ExportFinishedBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.ExportFinishedData}
     *
     * @param obj - object to test
     * @public
     */
    export function isExportFinishedData(obj: unknown): obj is ExportFinishedData {
        return isObject(obj) && getEventType(obj) === GdcAdEventType.ExportFinished;
    }

    //
    // Undo finished
    //

    /**
     * It's main content is empty.
     * @public
     */
    export type UndoFinishedBody = IAvailableCommands;

    /**
     * This event is emitted when AD successfully performs Undo operation.
     * @public
     */
    export type UndoFinished = IGdcAdMessageEvent<GdcAdEventType.UndoFinished, UndoFinishedBody>;

    /**
     * Data type of event that was emitted after finish undo action
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.UndoFinishedBody}
     * @public
     */
    export type UndoFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.UndoFinished, UndoFinishedBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.UndoFinishedData}
     *
     * @param obj - object to test
     * @public
     */
    export function isUndoFinishedData(obj: unknown): obj is UndoFinishedData {
        return isObject(obj) && getEventType(obj) === GdcAdEventType.UndoFinished;
    }

    //
    // Redo finished
    //

    /**
     * It's main content is empty.
     * @public
     */
    export type RedoFinishedBody = IAvailableCommands;

    /**
     * This event is emitted when AD successfully performs Undo operation.
     *
     * @public
     */
    export type RedoFinished = IGdcAdMessageEvent<GdcAdEventType.RedoFinished, RedoFinishedBody>;

    /**
     * Data type of event that was emitted after finish redo action
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link EmbeddedAnalyticalDesigner.RedoFinishedBody}
     * @public
     */
    export type RedoFinishedData = IGdcAdMessageEnvelope<GdcAdEventType.RedoFinished, RedoFinishedBody>;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedAnalyticalDesigner.RedoFinishedData}
     *
     * @param obj - object to test
     * @public
     */
    export function isRedoFinishedData(obj: unknown): obj is RedoFinishedData {
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
    export type SetFilterContextFinishedData = IGdcAdMessageEnvelope<
        GdcAdEventType.SetFilterContextFinished,
        IAvailableCommands
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
    export type RemoveFilterContextFinishedData = IGdcAdMessageEnvelope<
        GdcAdEventType.RemoveFilterContextFinished,
        IAvailableCommands
    >;

    //
    // FilterContext changed
    //

    /**
     * Main data of Filter context changed event
     * @public
     */
    export type FilterContextChangedBody = IAvailableCommands & EmbeddedGdc.IFilterContextContent;

    /**
     * Data type of event that was emitted after finishing change filter context
     *
     * Note: The main event data was wrapped to application and product data structure
     * @public
     */
    export type FilterContextChangedData = IGdcAdMessageEnvelope<
        GdcAdEventType.FilterContextChanged,
        FilterContextChangedBody
    >;

    /**
     * @public
     */
    export type InsightChangedBody = IAvailableCommands & {
        definition: IInsightDefinition;
    };

    /**
     * @public
     */
    export type InsightChangedData = IGdcAdMessageEnvelope<GdcAdEventType.InsightChanged, InsightChangedBody>;
}
