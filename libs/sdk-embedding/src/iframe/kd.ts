// (C) 2020 GoodData Corporation
// (C) 2020 GoodData Corporation
import {
    IGdcMessageEvent,
    getEventType,
    GdcProductName,
    IGdcMessageEnvelope,
    IDrillableItemsCommandBody,
    EmbeddedGdc,
} from "./common";

/**
 * All interface, types, type-guard related to embedded KPI Dashboards
 *
 * @public
 */
export namespace EmbeddedKpiDashboard {
    /**
     * Base type for KD events.
     *
     * @public
     */
    export type IGdcKdMessageEvent<T, TBody> = IGdcMessageEvent<GdcProductName.KPI_DASHBOARD, T, TBody>;

    /**
     * Base type for KD event data.
     *
     * @public
     */
    export type IGdcKdMessageEnvelope<T, TBody> = IGdcMessageEnvelope<GdcProductName.KPI_DASHBOARD, T, TBody>;

    /**
     * All KD command Types.
     *
     * @public
     */
    export enum GdcKdCommandType {
        /**
         * The command save a dashboard.
         */
        Save = "saveDashboard",

        /**
         * The command cancel editing dashboard.
         */
        CancelEdit = "cancelEdit",

        /**
         * The command delete existed dashboard.
         */
        Delete = "deleteDashboard",

        /**
         * The command edit a dashboard.
         */
        SwitchToEdit = "switchToEdit",

        /**
         * The command set drillable items.
         */
        DrillableItems = "drillableItems",

        /**
         * The command set size of dashboard.
         */
        SetSize = "setSize",

        /**
         * The command add widget to dashboard.
         */
        AddWidget = "addWidget",

        /**
         * The command add filter to dashboard.
         */
        AddFilter = "addFilter",

        /**
         * The command export a dashboard.
         */
        ExportToPdf = "exportToPdf",

        /**
         * The command to add or update filter context
         */
        SetFilterContext = "setFilterContext",

        /**
         * The command to remove filter item from current filter context
         */
        RemoveFilterContext = "removeFilterContext",

        /**
         * The command to duplicate a KPI Dashboard
         */
        SaveAsDashboard = "saveAsDashboard",
    }

    /**
     * All KD event types.
     *
     * @public
     */
    export enum GdcKdEventType {
        /**
         * Type represent that the dashboard listening for drilling event.
         */
        ListeningForDrillableItems = "listeningForDrillableItems",

        /**
         * Type represent that the embedded content starts loading.
         */
        LoadingStarted = "loadingStarted",

        /**
         * Type represent that The user does not have permissions to view or edit the content.
         */
        NoPermissions = "noPermissions",

        /**
         * Type represent that an operation increasing the height of the hosting iframe is performed.
         */
        Resized = "resized",

        /**
         * Type represent that the dashboard has been created and saved.
         */
        DashboardCreated = "dashboardCreated",

        /**
         * Type represent that the content is fully loaded,
         * and the user has permissions to access the dashboard.
         */
        DashboardLoaded = "loaded",

        /**
         * Type represent that the existing dashboard has been updated.
         */
        DashboardUpdated = "dashboardUpdated",

        /**
         * Type represent that the dashboard is saved.
         *
         */
        DashboardSaved = "dashboardSaved",

        /**
         * Type represent that the dashboard is deleted.
         *
         */
        DashboardDeleted = "dashboardDeleted",

        /**
         * Type represent that the user cancels the creation of the dashboard.
         */
        DashboardCreationCanceled = "dashboardCreationCanceled",

        /**
         * Type represent that the dashboard is switched to edit mode.
         */
        SwitchedToEdit = "switchedToEdit",

        /**
         * Type represent that the dashboard is switched to view mode.
         */
        SwitchedToView = "switchedToView",

        /**
         * Type represent that the platform is down.
         */
        Platform = "platform",

        /**
         * Type represent that the widget is added to dashboard.
         *
         */
        WidgetAdded = "widgetAdded",

        /**
         * Type represent that the filter is added to dashboard.
         *
         */
        FilterAdded = "filterAdded",

        /**
         * Type represent that the export action is finished.
         */
        ExportedToPdf = "exportedToPdf",

        /**
         * Type represent that the drill performed
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
         * Type that represents started drill to URL. The event does not contain an URL. The event can be used as
         * notification to display a loading indicator as the URL resolving takes some time. The URL is sent in
         * DrillToUrlResolved event which is posted after the URL is resolved. The event also contains an ID that can
         * be matched with ID in subsequently posted DrillToUrlResolved event.
         */
        DrillToUrlStarted = "drillToUrlStarted",

        /**
         * Type that represents resolved drill to URL. The event is sent after DrillToUrlStarted event was posted and
         * it contains the resolved URL. The event also contains an ID which can be matched with ID from
         * DrillToUrlStarted event.
         */
        DrillToUrlResolved = "drillToUrlResolved",
    }

    /**
     * List of available commands. This is included in each event sent by KD.
     *
     * @public
     */
    export interface IKdAvailableCommands {
        /**
         * Array of available commands types.
         */
        availableCommands: GdcKdCommandType[];
    }

    /**
     * Save command body sent by outer application
     *
     * @public
     */
    export interface IKdSaveCommandBody {
        /**
         * Dashboard title - use as title of new dashboard or rename of saved dashboard
         */
        title: string;
    }

    /**
     * Saves current dashboard.
     *
     * Contract:
     *
     * -  if currently edited dashboard IS NOT eligible for save (empty, in-error), then CommandFailed event
     *    will be posted
     * -  if the specified title is invalid / does not match title validation rules, then CommandFailed event
     *    will be posted
     * -  otherwise dashboard WILL be saved with the title as specified in the body and the DashboardSaved event
     *    will be posted
     * -  the DashboardSaved event will be posted even when saving dashboard that has not changed but would
     *    otherwise be eligible for saving (not empty, not in-error)
     *
     * Note: sending Save command with different title means dashboard will be saved with that new title.
     *
     * @public
     */
    export type SaveDashboardCommand = IGdcKdMessageEvent<GdcKdCommandType.Save, IKdSaveCommandBody>;

    /**
     * @public
     */
    export type SaveDashboardCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.Save, IKdSaveCommandBody>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.SaveDashboardCommandData}.
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isSaveDashboardCommandData(obj: unknown): obj is SaveDashboardCommandData {
        return getEventType(obj) === GdcKdCommandType.Save;
    }

    /**
     * Creates a new dashboard from an existing dashboard
     *
     * Contract:
     *
     * -  if KD saves as new an existing dashboard in view mode, the DashboardSaved event will be posted,
     * the new duplicated dashboard doesn't apply changes from the filter bar.
     *
     * -  if KD saves as new an existing dashboard in edit mode, the DashboardSaved event will be posted,
     * the new duplicated dashboard applies all changes from the existing dashboard like
     * title, filter context, insight widgets, layout...
     *
     * -  if KD saves as new an existing dashboard in the locked dashboard but the user can create new dashboard,
     * the DashboardSaved event will be posted, the new duplicated dashboard won't be locked.
     *
     * -  if KD doesn't have an existing dashboard, no permission to create dashboard or the title is empty,
     * CommandFailed is posted
     *
     * @public
     */
    export type SaveAsDashboardCommand = IGdcKdMessageEvent<
        GdcKdCommandType.SaveAsDashboard,
        IKdSaveCommandBody
    >;

    /**
     * @public
     */
    export type SaveAsDashboardCommandData = IGdcKdMessageEnvelope<
        GdcKdCommandType.SaveAsDashboard,
        IKdSaveCommandBody
    >;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.SaveAsDashboardCommandData}.
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isSaveAsDashboardCommandData(obj: unknown): obj is SaveAsDashboardCommandData {
        return getEventType(obj) === GdcKdCommandType.SaveAsDashboard;
    }

    /**
     * Cancels editing and switches dashboard to view mode.
     *
     * Contract:
     *
     * -  if KD is currently editing dashboard, this will trigger switch to view mode, without popping up the
     *    dialog asking to discard unsaved changes. On success SwitchedToView will be posted
     * -  if KD is currently viewing dashboard, SwitchedToView will be posted back immediately
     * -  if KD is not currently showing any dashboard, CommandFailed is posted
     *
     * @public
     */
    export type CancelEditCommand = IGdcKdMessageEvent<GdcKdCommandType.CancelEdit, null>;

    /**
     * @public
     */
    export type CancelEditCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.CancelEdit, null>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.CancelEditCommandData}.
     *
     * @param obj - object to test
     *
     * @public
     */
    export function isCancelEditCommandData(obj: unknown): obj is CancelEditCommandData {
        return getEventType(obj) === GdcKdCommandType.CancelEdit;
    }

    /**
     * Deleted currently edited dashboard.
     *
     * Contract:
     *
     * -  if KD is currently editing dashboard, this will trigger delete without popping up the dialog
     *    asking for permission. On success DashboardDeleted will be posted
     *
     * -  if KD is currently viewing dashboard or not not showing any dashboard, CommandFailed will
     *    be posted
     *
     * @public
     */
    export type DeleteDashboardCommand = IGdcKdMessageEvent<GdcKdCommandType.Delete, null>;

    /**
     * @public
     */
    export type DeleteDashboardCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.Delete, null>;

    /**
     * Switches current dashboard to edit mode.
     *
     * Contract:
     *
     * -  if KD shows dashboard in view mode, will switch to edit mode and post SwitchedToEdit once ready for
     *    editing
     * -  if KD shows dashboard in edit mode, will keep edit mode and post SwitchedToEdit as if just switched
     *    from view mode
     * -  if no dashboard currently displayed, posts CommandFailed
     *
     * @public
     */
    export type SwitchToEditCommand = IGdcKdMessageEvent<GdcKdCommandType.SwitchToEdit, null>;

    /**
     * @public
     */
    export type SwitchToEditCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.SwitchToEdit, null>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.SwitchToEditCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isSwitchToEditCommandData(obj: unknown): obj is SwitchToEditCommandData {
        return getEventType(obj) === GdcKdCommandType.SwitchToEdit;
    }

    /**
     * Set drillable items.
     *
     * Contract:
     *
     * - Drillable items can be set by uris or identifiers of dashboard's measures/attributes
     * @public
     */
    export type DrillableItemsCommand = IGdcKdMessageEvent<
        GdcKdCommandType.DrillableItems,
        IDrillableItemsCommandBody
    >;

    /**
     * Data type of drillable items command
     *
     * Note: The main event data was wrapped to application and product data structure
     * @remarks See {@link IDrillableItemsCommandBody}
     * @public
     */
    export type DrillableItemsCommandData = IGdcKdMessageEnvelope<
        GdcKdCommandType.DrillableItems,
        IDrillableItemsCommandBody
    >;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.DrillableItemsCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isDrillableItemsCommandData(obj: unknown): obj is DrillableItemsCommandData {
        return getEventType(obj) === GdcKdCommandType.DrillableItems;
    }

    /**
     * @public
     */
    export interface ISetSizeCommandBody {
        /**
         * the height of the hosting iframe
         */
        height: number;
    }

    /**
     * @public
     */
    export type SetSizeCommand = IGdcKdMessageEvent<GdcKdCommandType.SetSize, ISetSizeCommandBody>;

    /**
     * @public
     */
    export type SetSizeCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.SetSize, ISetSizeCommandBody>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.SetSizeCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isSetSizeCommandData(obj: unknown): obj is SetSizeCommandData {
        return getEventType(obj) === GdcKdCommandType.SetSize;
    }

    /**
     * Data type of SetFilterContext command
     *
     * @public
     */
    export type SetFilterContextCommandData = IGdcKdMessageEnvelope<
        GdcKdCommandType.SetFilterContext,
        EmbeddedGdc.IFilterContextContent
    >;

    /**
     * Add or update the filter context
     *
     * Contract:
     * - If filters are same with filters on the KD filter bar, then update the filters on the filter bar
     *   and apply the filters to dashboard
     * - In edit mode, if filters are new and then add them to the KD filter bar and apply to dashboard
     * - In-case the KD can not apply the filters, a CommandFailed will be posted. The reason could be:
     *   - Add new filter in view mode
     *   - Filter is not existed in the dataset
     *   - Filter is existed but wrong elements input data
     *   - Exceed the limit number of filter items
     *
     * @public
     */
    export type SetFilterContextCommand = IGdcKdMessageEvent<
        GdcKdCommandType.SetFilterContext,
        EmbeddedGdc.IFilterContextContent
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedKpiDashboard.SetFilterContextCommand}
     *
     * @param obj - object to test
     * @public
     */
    export function isSetFilterContextCommandData(obj: unknown): obj is SetFilterContextCommandData {
        return getEventType(obj) === GdcKdCommandType.SetFilterContext;
    }

    /**
     * Data type of removeFilterContext command
     *
     * @public
     */
    export type RemoveFilterContextCommandData = IGdcKdMessageEnvelope<
        GdcKdCommandType.RemoveFilterContext,
        EmbeddedGdc.IRemoveFilterContextContent
    >;

    /**
     * Remove the filter context
     * Contract:
     * - if filters are in the filter bar, then remove the filters on the filter bar and update insight
     * - if filters are not in the filter bar and then a CommandFailed will be posted.
     *
     * @public
     */
    export type RemoveFilterContextCommand = IGdcKdMessageEvent<
        GdcKdCommandType.RemoveFilterContext,
        EmbeddedGdc.IRemoveFilterContextContent
    >;

    /**
     * Type-guard checking whether an object is an instance of {@link EmbeddedKpiDashboard.RemoveFilterContextCommand}
     *
     * @param obj - object to test
     * @public
     */
    export function isRemoveFilterContextCommandData(obj: unknown): obj is RemoveFilterContextCommandData {
        return getEventType(obj) === GdcKdCommandType.RemoveFilterContext;
    }

    //
    // Add widget command
    //

    /**
     * @public
     */
    export interface IKpiWidget {
        type: "kpi";
    }

    /**
     * @public
     */
    export interface IIdentifierInsightRef {
        identifier: string;
    }

    /**
     * @public
     */
    export interface IUriInsightRef {
        uri: string;
    }

    /**
     * @public
     */
    export interface IInsightWidget {
        type: "insight";
        ref: IIdentifierInsightRef | IUriInsightRef;
    }

    /**
     * @public
     */
    export interface IAddWidgetBody {
        widget: IKpiWidget | IInsightWidget;
    }

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.IIdentifierInsightRef}.
     *
     * @param obj - object to test
     * @public
     */
    export function isIdentifierInsight(obj: unknown): obj is IIdentifierInsightRef {
        return (obj as IIdentifierInsightRef).identifier !== undefined;
    }

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.IUriInsightRef}.
     *
     * @param obj - object to test
     * @public
     */
    export function isUriInsight(obj: unknown): obj is IUriInsightRef {
        return (obj as IUriInsightRef).uri !== undefined;
    }

    /**
     * Adds new widget onto dashboard. New row will be created on top of the dashboard, the widget
     * will be placed into its first column.
     *
     * It is currently possible to add either a KPI or an Insight. When adding either of these, KD will
     * scroll to top so that the newly added widget is visible.
     *
     * For KPI, the KD will start the KPI customization flow right after the KPI is placed.
     * Insights are placed without need for further customization
     *
     * Contract:
     *
     * -  if KD is currently editing a dashboard, then depending on widget type:
     *    -  KPI is added to dashboard, customization flow is started, WidgetAdded will be posted
     *    -  Insight is added to dashboard, WidgetAdded will be posted
     *
     * -  if insight reference included in command payload does not refer to a valid insight, CommandFailed
     *    will be posted
     *
     * -  if KD is in view mode or not showing any dashboard, then CommandFailed will be posted
     *
     * @public
     */
    export type AddWidgetCommand = IGdcKdMessageEvent<GdcKdCommandType.AddWidget, IAddWidgetBody>;

    export type AddWidgetCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.AddWidget, IAddWidgetBody>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.AddWidgetCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isAddWidgetCommandData(obj: unknown): obj is AddWidgetCommandData {
        return getEventType(obj) === GdcKdCommandType.AddWidget;
    }

    /**
     * Adds new attribute filter to filter bar and starts the filter customization flow.
     *
     * Contract:
     *
     * -  if KD is currently editing a dashboard, adds new attribute filter, starts customization flow; FilterAdded
     *    will be posted right after customization starts
     *
     * -  if KD is currently in view mode or does not show any dashboard, will post CommandFailed
     *
     * @public
     */
    export type AddFilterCommand = IGdcKdMessageEvent<GdcKdCommandType.AddFilter, null>;

    export type AddFilterCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.AddFilter, null>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.AddFilterCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isAddFilterCommandData(obj: unknown): obj is AddFilterCommandData {
        return getEventType(obj) === GdcKdCommandType.AddFilter;
    }

    /**
     * Exports dashboard to PDF.
     *
     * Contract:
     *
     * -  if KD shows dashboard in view mode, will export dashboard to PDF and post ExportFinished once ready for
     *    exporting
     * -  if KD shows dashboard in edit mode or not not showing any dashboard, CommandFailed will
     *    be posted
     * @public
     */
    export type ExportToPdfCommand = IGdcKdMessageEvent<GdcKdCommandType.ExportToPdf, null>;

    /**
     * @public
     */
    export type ExportToPdfCommandData = IGdcKdMessageEnvelope<GdcKdCommandType.ExportToPdf, null>;

    /**
     * Type-guard checking whether object is an instance of {@link EmbeddedKpiDashboard.ExportToPdfCommandData}.
     *
     * @param obj - object to test
     * @public
     */
    export function isExportToPdfCommandData(obj: unknown): obj is ExportToPdfCommandData {
        return getEventType(obj) === GdcKdCommandType.ExportToPdf;
    }

    /**
     * @public
     */
    export interface INoPermissionsBody {
        /**
         * the 'data' section contains information about whether view or edit permissions are missing
         */
        reason: string;
    }

    /**
     * This event is emitted When User does not have permissions to view or edit the content
     * @public
     */
    export type NoPermissionsEventData = IGdcKdMessageEnvelope<
        GdcKdEventType.NoPermissions,
        INoPermissionsBody
    >;

    /**
     * @public
     */
    export interface IResizedBody {
        height: number;
    }

    /**
     * This event is emitted when the content is fully loaded
     */
    export type ResizedEventData = IGdcKdMessageEnvelope<GdcKdEventType.Resized, IResizedBody>;

    /**
     * @public
     */
    export interface IDashboardObjectMeta {
        /**
         * Client id - Each client has an identifier unique within the domain
         *
         * Note: use the combination of the data product ID and client ID instead of the project ID
         */
        client?: string;

        /**
         * object id
         */
        dashboardId: string;
        /**
         * Project id
         */
        project: string;
        /**
         * dashboard identifier
         */
        dashboard: string;

        /**
         * dashboard title - this is what users see in KD top bar (if visible)
         */
        title: string;
    }

    /**
     * @public
     */
    export type IDashboardBody = IKdAvailableCommands & IDashboardObjectMeta;

    /**
     * Data type of event that was emitted when a dashboard has been created and saved.
     */
    export type IDashboardCreatedData = IGdcKdMessageEnvelope<
        GdcKdEventType.DashboardCreated,
        IDashboardBody
    >;

    /**
     * Data type of event that was emitted when the content is fully loaded,
     * and the user has permissions to access the dashboard.
     */
    export type IDashboardLoadedData = IGdcKdMessageEnvelope<GdcKdEventType.DashboardLoaded, IDashboardBody>;

    /**
     * Data type of event that was emitted when the existing dashboard has been updated.
     */
    export type IDashboardUpdatedData = IGdcKdMessageEnvelope<
        GdcKdEventType.DashboardUpdated,
        IDashboardBody
    >;

    /**
     * Data type of event that was emitted when the dashboard has been saved.
     */
    export type IDashboardSavedData = IGdcKdMessageEnvelope<GdcKdEventType.DashboardSaved, IDashboardBody>;

    /**
     * Data type of event that was emitted when the dashboard has been deleted.
     */
    export type IDashboardDeletedData = IGdcKdMessageEnvelope<
        GdcKdEventType.DashboardDeleted,
        IDashboardBody
    >;

    /**
     * This event is emitted after KD switched a dashboard from view mode to edit mode.
     */
    export type SwitchedToEditData = IGdcKdMessageEnvelope<GdcKdEventType.SwitchedToEdit, IDashboardBody>;

    /**
     * This event is emitted after KD switched a dashboard from edit mode to view mode.
     */
    export type SwitchedToViewData = IGdcKdMessageEnvelope<GdcKdEventType.SwitchedToView, IDashboardBody>;

    export interface IPlaformBody {
        status?: string;
        errorCode?: number;
        description?: string;
    }

    /**
     * @public
     */
    export type PlaformData = IGdcKdMessageEnvelope<GdcKdEventType.Platform, IPlaformBody>;

    /**
     * @public
     */
    export interface IInsightWidgetBody {
        widgetCategory: "kpi" | "visualization";
        identifier?: string;
        uri?: string;
        title?: string;
    }

    /**
     * @public
     */
    export interface IAddedWidgetBody {
        insight?: IInsightWidgetBody;
    }

    /**
     * This event is emitted after KD added a new widget to a dashboard. If the widget is
     * an insight, then meta information about the insight will be returned.
     *
     * Note: when this event is added for a KPI widget, it means the customization flow for the KPI has
     * started. The user may still 'just' click somewhere outside of the KPI configuration and the KPI will
     * be discarded.
     *
     * @public
     */
    export type WidgetAddedData = IGdcKdMessageEnvelope<GdcKdEventType.WidgetAdded, IAddedWidgetBody>;

    /**
     * @public
     */
    export type FilterAddedBody = IKdAvailableCommands;

    /**
     * This event is emitted after KD added a new filter to dashboard's filter bar and started its
     * customization flow.
     *
     * Note: users can still cancel the filter customization flow meaning no new attribute filter
     * will end on the filter bar.
     */
    export type FilterAddedData = IGdcKdMessageEnvelope<GdcKdEventType.FilterAdded, FilterAddedBody>;

    /**
     * @public
     */
    export type ExportToPdfFinishedBody = IKdAvailableCommands & {
        /**
         * Link to the file containing exported data.
         */
        link: string;
    };

    /**
     * This event is emitted after dashboard has been exported to PDF
     * @public
     */
    export type ExportToPdfFinishedData = IGdcKdMessageEnvelope<
        GdcKdEventType.ExportedToPdf,
        ExportToPdfFinishedBody
    >;

    //
    // setFilterContext finished
    //

    /**
     * Data type of event that was emitted after finishing set filter context
     *
     * Note: The main event data was wrapped to application and product data structure
     * @public
     */
    export type SetFilterContextFinishedData = IGdcKdMessageEnvelope<
        GdcKdEventType.SetFilterContextFinished,
        IKdAvailableCommands
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
    export type RemoveFilterContextFinishedData = IGdcKdMessageEnvelope<
        GdcKdEventType.RemoveFilterContextFinished,
        IKdAvailableCommands
    >;

    //
    // FilterContext changed
    //

    /**
     * Main data of Filter context changed event
     * @public
     */
    export type FilterContextChangedBody = IKdAvailableCommands & EmbeddedGdc.IFilterContextContent;

    /**
     * Data type of event that was emitted after finishing change filter context
     *
     * Note: The main event data was wrapped to application and product data structure
     * @public
     */
    export type FilterContextChangedData = IGdcKdMessageEnvelope<
        GdcKdEventType.FilterContextChanged,
        FilterContextChangedBody
    >;

    /**
     * @public
     */
    export type DrillToUrlFilters = Array<
        EmbeddedGdc.DashboardDateFilter | EmbeddedGdc.IDashboardAttributeFilter
    >;

    /**
     * @public
     */
    export interface IDrillToUrlStartedDataBody {
        id: string;

        /**
         * Contains date filter and attribute filters set in the dashboard.
         *
         * Note: You can use the type guards defined in EmbeddedGdc namespace to test the type of the filter.
         * For instance, you can call data.filters.find(isDashboardDateFilter) to get the date filter.
         */
        filters: DrillToUrlFilters;
    }

    /**
     * @public
     */
    export interface IDrillToUrlResolvedDataBody {
        id: string;
        url: string;

        /**
         * Contains date filter and attribute filters set in the dashboard.
         *
         * Note: You can use the type guards defined in EmbeddedGdc namespace to test the type of the filter.
         * For instance, you can call data.filters.find(isDashboardDateFilter) to get the date filter.
         */
        filters: DrillToUrlFilters;
    }

    /**
     * @public
     */
    export type DrillToUrlStartedData = IGdcKdMessageEnvelope<
        GdcKdEventType.DrillToUrlStarted,
        IDrillToUrlStartedDataBody
    >;

    /**
     * @public
     */
    export type DrillToUrlResolvedData = IGdcKdMessageEnvelope<
        GdcKdEventType.DrillToUrlResolved,
        IDrillToUrlResolvedDataBody
    >;
}
