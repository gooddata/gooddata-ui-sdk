// (C) 2021-2026 GoodData Corporation

import { type IDashboardExportPresentationOptions } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterConfigMode,
    type DashboardDateFilterConfigMode,
    type FilterContextItem,
    type IDashboard,
    type IWorkspacePermissions,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type ISharingApplyPayload } from "@gooddata/sdk-ui-kit";

import { type IDashboardCommand } from "./base.js";
import { type DashboardConfig } from "../types/commonTypes.js";

/**
 * The initial load of the dashboard will use this correlation id.
 *
 * @beta
 */
export const InitialLoadCorrelationId = "initialLoad";

/**
 * Payload of the {@link InitializeDashboard} command.
 * @public
 */
export type InitializeDashboardPayload = {
    readonly config?: DashboardConfig;
    readonly permissions?: IWorkspacePermissions;
    /**
     * @internal
     */
    readonly persistedDashboard?: IDashboard;
    /**
     * Explicitly specify which tab should be opened first. This overrides the dashboard's persisted activeTabId.
     * @alpha
     */
    readonly initialTabId?: string;
};

/**
 * Loads dashboard from analytical backend.
 *
 * @public
 */
export type InitializeDashboard = IDashboardCommand & {
    readonly type: "GDC.DASH/CMD.INITIALIZE";
    readonly payload: InitializeDashboardPayload;
};

/**
 * Creates the InitializeDashboard command.
 *
 * @remarks
 * Dispatching this command will result in the load of all the essential data from the backend and initializing
 * the state of Dashboard to a point where the dashboard can be rendered.
 *
 * Note that the command takes the dashboard to initialize from context - from the properties of the Dashboard
 * component in which it runs:
 *
 * -  If Dashboard component is referencing an existing, persisted dashboard, then the dashboard will be loaded and
 *    rendered.
 *
 * -  If Dashboard component does not reference any dashboard, then the component will initialize for an empty
 *    dashboard with default filter setup.
 *
 * In both cases the essential configuration, permissions and additional metadata gets loaded from the backend.
 *
 * @param config - specify configuration to use for the Dashboard; you MAY provide partial configuration.
 *  During the LoadDashboard processing the Dashboard component will resolve all the missing parts by reading them
 *  from the backend.
 * @param permissions - specify permissions to use when determining whether the user is eligible for some
 *  actions with the dashboard; if you do not specify permissions Dashboard component will load the permissions
 *  from the backend.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @param initialTabId -
 *
 * @public
 */
export function initializeDashboard(
    config?: DashboardConfig,
    permissions?: IWorkspacePermissions,
    correlationId?: string,
    initialTabId?: string,
): InitializeDashboard {
    return {
        type: "GDC.DASH/CMD.INITIALIZE",
        correlationId,
        payload: {
            config,
            permissions,
            initialTabId,
        },
    };
}

/**
 * Creates the InitializeDashboard command with the persisted dashboard overridden.
 *
 * @remarks
 * Dispatching this command will result in the load of all the essential data from the backend and initializing
 * the state of Dashboard to a point where the dashboard can be rendered.
 *
 * Note that the command takes the dashboard to initialize from context - from the properties of the Dashboard
 * component in which it runs:
 *
 * -  If Dashboard component is referencing an existing, persisted dashboard, then the dashboard will be loaded and
 *    rendered.
 *
 * -  If Dashboard component does not reference any dashboard, then the component will initialize for an empty
 *    dashboard with default filter setup.
 *
 * In both cases the essential configuration, permissions and additional metadata gets loaded from the backend.
 *
 * @param config - specify configuration to use for the Dashboard; you MAY provide partial configuration.
 *  During the LoadDashboard processing the Dashboard component will resolve all the missing parts by reading them
 *  from the backend.
 * @param permissions - specify permissions to use when determining whether the user is eligible for some
 *  actions with the dashboard; if you do not specify permissions Dashboard component will load the permissions
 *  from the backend.
 * @param persistedDashboard - dashboard to use for the persisted dashboard state slice in case it needs to be
 *  different from the dashboard param
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @param initialTabId - specify the initial tab to open when the dashboard is loaded
 *
 * @internal
 */
export function initializeDashboardWithPersistedDashboard(
    config?: DashboardConfig,
    permissions?: IWorkspacePermissions,
    persistedDashboard?: IDashboard,
    correlationId?: string,
    initialTabId?: string,
): InitializeDashboard {
    return {
        type: "GDC.DASH/CMD.INITIALIZE",
        correlationId,
        payload: {
            config,
            permissions,
            persistedDashboard,
            initialTabId,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ISaveDashboard} command.
 * @beta
 */
export interface ISaveDashboardPayload {
    /**
     * Specify new title for the dashboard that will be created during the Save operation. If not specified,
     * the current dashboard title will be used.
     */
    readonly title?: string;
}

/**
 * @beta
 */
export interface ISaveDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SAVE";
    readonly payload: ISaveDashboardPayload;
}

/**
 * Creates the SaveDashboard command. Dispatching this command will result in persisting all the accumulated
 * dashboard modification to backend.
 *
 * The command will not have any effect if dashboard is not initialized or is empty.
 *
 * @param title - new title for the dashboard; if not specified, the current title of the dashboard will be used
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function saveDashboard(title?: string, correlationId?: string): ISaveDashboard {
    return {
        type: "GDC.DASH/CMD.SAVE",
        correlationId,
        payload: {
            title,
        },
    };
}

//
//
//

/**
 * Payload of the {@link SaveDashboardAs} command.
 * @public
 */
export type SaveDashboardAsPayload = {
    /**
     * Specify new title for the dashboard that will be created during the Save As operation.
     */
    readonly title?: string;

    /**
     * Indicate whether the dashboard component should switch to the copy of the dashboard or whether
     * it should stay on the current dashboard.
     */
    readonly switchToCopy?: boolean;

    /**
     * Indicates whether new dashboard should use the original filter context or whether to use the one
     * with current filter selection.
     */
    readonly useOriginalFilterContext?: boolean;
};

/**
 * @public
 */
export type SaveDashboardAs = IDashboardCommand & {
    readonly type: "GDC.DASH/CMD.SAVEAS";
    readonly payload: SaveDashboardAsPayload;
};

/**
 * Creates the SaveDashboardAs command.
 *
 * @remarks
 * Dispatching this command will result in creation of a copy of the
 * current dashboard. The copy will reflect the current state of the dashboard including any modifications done
 * on top of the original dashboard.
 *
 * Upon success, a copy of the dashboard will be persisted on the backend. The context of the dashboard component
 * that processed the command is unchanged - it still works with the original dashboard.
 *
 * @param title - new title for the dashboard; if not specified, the title of original dashboard will be used
 * @param switchToCopy - indicate whether the dashboard component should switch to the dashboard that will
 *  be created during save-as; the default is false
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *  @param useOriginalFilterContext - indicate whether new dashboard should use original filter context
 *  or the one with current filter selection.
 * @public
 */
export function saveDashboardAs(
    title?: string,
    switchToCopy?: boolean,
    useOriginalFilterContext?: boolean,
    correlationId?: string,
): SaveDashboardAs {
    return {
        type: "GDC.DASH/CMD.SAVEAS",
        correlationId,
        payload: {
            title,
            switchToCopy,
            useOriginalFilterContext,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRenameDashboard} command.
 * @beta
 */
export interface IRenameDashboardPayload {
    /**
     * New title to use for the dashboard.
     */
    readonly newTitle: string;
}

/**
 * @beta
 */
export interface IRenameDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RENAME";
    readonly payload: IRenameDashboardPayload;
}

/**
 * Creates the RenameDashboard command. Dispatching this command will result in rename of the dashboard. The changes
 * will be done only in-memory and have to be flushed to backend using the SaveDashboard command.
 *
 * @param newTitle - new dashboard title
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function renameDashboard(newTitle: string, correlationId?: string): IRenameDashboard {
    return {
        type: "GDC.DASH/CMD.RENAME",
        correlationId,
        payload: {
            newTitle,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IChangeSharing} command.
 * @beta
 */
export interface IChangeSharingPayload {
    /**
     * New sharing-related properties to use.
     */
    readonly newSharingProperties: ISharingApplyPayload;
}

/**
 * @beta
 */
export interface IChangeSharing extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SHARING.CHANGE";
    readonly payload: IChangeSharingPayload;
}

/**
 * Creates the ChangeSharing command. Dispatching this command will result in change of sharing status of dashboard. The changes
 * will be done in-memory and also propagated to the backend.
 *
 * @param newSharingProperties - new dashboard sharing properties
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 * @beta
 */
export function changeSharing(
    newSharingProperties: ISharingApplyPayload,
    correlationId?: string,
): IChangeSharing {
    return {
        type: "GDC.DASH/CMD.SHARING.CHANGE",
        correlationId,
        payload: {
            newSharingProperties,
        },
    };
}

//
//
//

/**
 * @beta
 */
export interface IResetDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.RESET";
}

/**
 * Creates the ResetDashboard command. Dispatching this command will result in dropping all in-memory modifications
 * of the dashboard and reverting to a state that is persisted on the backend. In other words reset will get
 * dashboard to a state after the last save.
 *
 * Note: if a dashboard is not saved on a backend, then reset will clear the dashboard to an empty state.
 *
 * Limitation: reset command will have no impact on alerts or scheduled emails. These entites are persisted outside
 * the dashboard and have their own lifecycle.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function resetDashboard(correlationId?: string): IResetDashboard {
    return {
        type: "GDC.DASH/CMD.RESET",
        correlationId,
    };
}

//
//
//

/**
 * @beta
 */
export interface IDeleteDashboard extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DELETE";
}

/**
 * Creates the DeleteDashboard command. Dispatching this command will result in removal of the currently
 * rendered dashboard from analytical backend and reverting the dashboard component to an 'empty' state where
 * it is initialized to create a new dashboard.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function deleteDashboard(correlationId?: string): IDeleteDashboard {
    return {
        type: "GDC.DASH/CMD.DELETE",
        correlationId,
    };
}

//
//
//

/**
 * @beta
 */
export interface IExportDashboardToPdf extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.PDF";
}

/**
 * Creates the {@link IExportDashboardToPdf} command. Dispatching this command will result in a request to export
 * the dashboard to a PDF file. If successful, an instance of {@link IDashboardExportToPdfResolved} will be emitted
 * with the URL of the resulting file.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function exportDashboardToPdf(correlationId?: string): IExportDashboardToPdf {
    return {
        type: "GDC.DASH/CMD.EXPORT.PDF",
        correlationId,
    };
}

/**
 * @beta
 */
export interface IExportDashboardToExcel extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.EXCEL";
    readonly payload: IExportDashboardToExcelPayload;
}

/**
 * @beta
 */
export type PdfConfiguration = {
    pageSize?: "A3" | "A4" | "LETTER";
    pageOrientation?: "PORTRAIT" | "LANDSCAPE";
    showInfoPage?: boolean;
};

/**
 * @beta
 */
export interface IExportDashboardToExcelPayload {
    mergeHeaders: boolean;
    exportInfo: boolean;
    widgetIds?: string[];
    fileName?: string;
    format?: "XLSX" | "PDF";
    pdfConfiguration?: PdfConfiguration;
}

/**
 * Creates the {@link IExportDashboardToExcel} command. Dispatching this command will result in a request to export
 * the dashboard to a EXCEL file. If successful, an instance of {@link IDashboardExportToExcelResolved} will be emitted
 * with the URL of the resulting file.
 *
 * @param mergeHeaders - if true, the headers will be merged into a single row
 * @param exportInfo - if true, the export info will be included in the EXCEL file
 * @param widgetIds - if provided, the widgets with the given ids will be exported
 * @param fileName - if provided, the file will be saved with the given name
 * @param format -
 * @param pdfConfiguration -
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function exportDashboardToExcel(
    mergeHeaders: boolean,
    exportInfo: boolean,
    widgetIds?: string[],
    fileName?: string,
    format?: "XLSX" | "PDF",
    pdfConfiguration?: PdfConfiguration,
    correlationId?: string,
): IExportDashboardToExcel {
    return {
        type: "GDC.DASH/CMD.EXPORT.EXCEL",
        correlationId,
        payload: {
            mergeHeaders,
            exportInfo,
            widgetIds,
            fileName,
            format,
            pdfConfiguration,
        },
    };
}

/**
 * @beta
 */
export interface IExportDashboardToPresentationPayload {
    /**
     * Overrides current filter context filters with provided custom filters
     */
    filters?: FilterContextItem[];

    /**
     * Overrides export options with custom options.
     */
    options?: IDashboardExportPresentationOptions;
}

/**
 * @beta
 */
export interface IExportDashboardToPdfPresentation extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.PDF_PRESENTATION";
    readonly payload?: IExportDashboardToPresentationPayload;
}

/**
 * Creates the {@link IExportDashboardToPdfPresentation} command. Dispatching this command will result in a request to export
 * the dashboard to a PDF presentation file. If successful, an instance of {@link IDashboardExportToPdfPresentationResolved} will be emitted
 * with the URL of the resulting file.
 *
 * @param payload - payload to override the dashboard export options. If not provided, the dashboard will be exported with the current filter context and options.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function exportDashboardToPdfPresentation(
    payload?: IExportDashboardToPresentationPayload,
    correlationId?: string,
): IExportDashboardToPdfPresentation {
    return {
        type: "GDC.DASH/CMD.EXPORT.PDF_PRESENTATION",
        correlationId,
        payload,
    };
}

/**
 * @beta
 */
export interface IExportDashboardToPptPresentation extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.EXPORT.PPT_PRESENTATION";
    readonly payload?: IExportDashboardToPresentationPayload;
}

/**
 * Creates the {@link IExportDashboardToPptPresentation} command. Dispatching this command will result in a request to export
 * the dashboard to a Ppt presentation file. If successful, an instance of {@link IDashboardExportToPptPresentationResolved} will be emitted
 * with the URL of the resulting file.
 *
 * @param payload - payload to override the dashboard export options. If not provided, the dashboard will be exported with the current filter context and options.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function exportDashboardToPptPresentation(
    payload?: IExportDashboardToPresentationPayload,
    correlationId?: string,
): IExportDashboardToPptPresentation {
    return {
        type: "GDC.DASH/CMD.EXPORT.PPT_PRESENTATION",
        correlationId,
        payload,
    };
}

//
//
//

/**
 * Payload of the {@link ISetDashboardDateFilterConfigMode} command.
 * @alpha
 */
export interface ISetDashboardDateFilterConfigModePayload {
    mode: DashboardDateFilterConfigMode;
}

/**
 * A command that set the mode of a date filter configuration in a dashboard.
 *
 * @alpha
 */
export interface ISetDashboardDateFilterConfigMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_MODE";
    readonly payload: ISetDashboardDateFilterConfigModePayload;
}

/**
 * Creates the {@link ISetDashboardDateFilterConfigMode} command.
 *
 * @remarks
 * Dispatching this command will set the visibility mode of the dashboard date filter to the provided value.
 *
 * @alpha
 * @param mode - The visibility mode to set.
 * @returns set dashboard date filter config mode command
 */
export function setDashboardDateFilterConfigMode(
    mode: DashboardDateFilterConfigMode,
): ISetDashboardDateFilterConfigMode {
    return {
        type: "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_MODE",
        payload: {
            mode,
        },
    };
}

/**
 * Payload of the {@link ISetDashboardAttributeFilterConfigMode} command.
 * @alpha
 */
export interface ISetDashboardAttributeFilterConfigModePayload {
    /**
     * Local identifier of the filter to change mode.
     */
    localIdentifier: string;
    /**
     * Mode of the attribute filter.
     */
    mode?: DashboardAttributeFilterConfigMode;
}

/**
 * Command for changing attribute filter mode.
 * @alpha
 */
export interface ISetDashboardAttributeFilterConfigMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_MODE";
    readonly payload: ISetDashboardAttributeFilterConfigModePayload;
}

/**
 * Creates the {@link ISetDashboardAttributeFilterConfigMode} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided the mode as a mode for the attribute filter.
 *
 *
 * @alpha
 * @param localIdentifier - local identifier of the filter the display form is changed for
 * @param mode - newly added mode
 * @returns change filter mode command
 */
export function setDashboardAttributeFilterConfigMode(
    localIdentifier: string,
    mode?: DashboardAttributeFilterConfigMode,
): ISetDashboardAttributeFilterConfigMode {
    return {
        type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_MODE",
        payload: {
            localIdentifier,
            mode,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ISetAttributeFilterLimitingItems} command.
 * @alpha
 */
export interface ISetAttributeFilterLimitingItemsPayload {
    /**
     * Local identifier of the filter to change mode.
     */
    localIdentifier: string;
    /**
     * Limiting items applied on attribute filter elements.
     */
    limitingItems: ObjRef[];
}

/**
 * Command for changing of attribute filter limiting items.
 * @alpha
 */
export interface ISetAttributeFilterLimitingItems extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_LIMITING_ITEMS";
    readonly payload: ISetAttributeFilterLimitingItemsPayload;
}

/**
 * Creates the {@link ISetAttributeFilterLimitingItems} command.
 *
 * @remarks
 * Dispatching the commands will result into setting of provided limiting items to a defined attribute filter.
 *
 *
 * @alpha
 * @param localIdentifier - local identifier of the filter the limiting items are changed for
 * @param limitingItems - limiting items set to the specified attribute filter.
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change limiting items command
 */
export function setAttributeFilterLimitingItems(
    localIdentifier: string,
    limitingItems: ObjRef[],
    correlationId?: string,
): ISetAttributeFilterLimitingItems {
    return {
        type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_LIMITING_ITEMS",
        correlationId,
        payload: {
            localIdentifier,
            limitingItems,
        },
    };
}

/**
 * Payload of the {@link ISetDashboardAttributeFilterConfigDisplayAsLabel} command.
 * @alpha
 */
export interface ISetDashboardAttributeFilterConfigDisplayAsLabelPayload {
    /**
     * Local identifier of the filter to change display as label (= display form).
     */
    localIdentifier: string;
    /**
     *  Display as label of the attribute filter. Used to present filter in UI
     */
    displayAsLabel: ObjRef | undefined;
    /**
     * Optional tab local identifier to target a specific tab.
     * If not provided, the active tab will be used.
     *
     * @internal
     */
    tabLocalIdentifier?: string;
}

/**
 * Command for changing attribute filter mode.
 * @alpha
 */
export interface ISetDashboardAttributeFilterConfigDisplayAsLabel extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_DISPLAY_AS_LABEL";
    readonly payload: ISetDashboardAttributeFilterConfigDisplayAsLabelPayload;
}

/**
 * Creates the {@link ISetDashboardAttributeFilterConfigDisplayAsLabel} command.
 *
 * @remarks
 * Dispatching the command will result into setting provided label as new label (= display form) used for the displaying attribute filter elements.
 *
 *
 * @alpha
 * @param localIdentifier - local identifier of the filter the label is changed for
 * @param displayAsLabel - newly used display as label
 * @returns change filter mode command
 */
export function setDashboardAttributeFilterConfigDisplayAsLabel(
    localIdentifier: string,
    displayAsLabel: ObjRef,
): ISetDashboardAttributeFilterConfigDisplayAsLabel {
    return {
        type: "GDC.DASH/CMD.ATTRIBUTE_FILTER_CONFIG.SET_DISPLAY_AS_LABEL",
        payload: {
            localIdentifier,
            displayAsLabel,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ISetDashboardDateFilterConfigMode} command.
 * @alpha
 */
export interface ISetDashboardDateFilterWithDimensionConfigModePayload {
    /**
     * Date data set ref of the filter to change mode.
     */
    dataSet: ObjRef;
    /**
     * Mode of the date filter.
     */
    mode?: DashboardDateFilterConfigMode;
}

/**
 * Command for changing date filter mode.
 * @alpha
 */
export interface ISetDashboardDateFilterWithDimensionConfigMode extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DATE_FILTER_WITH_DIMENSION_CONFIG.SET_MODE";
    readonly payload: ISetDashboardDateFilterWithDimensionConfigModePayload;
}

/**
 * Creates the {@link ISetDashboardDateFilterWithDimensionConfigMode} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided the mode as a mode for the date filter.
 *
 *
 * @alpha
 * @param dataSet - dataSet of the filter the mode is changed for
 * @param mode - newly added mode
 * @returns change filter mode command
 */
export function setDashboardDateFilterWithDimensionConfigMode(
    dataSet: ObjRef,
    mode?: DashboardDateFilterConfigMode,
): ISetDashboardDateFilterWithDimensionConfigMode {
    return {
        type: "GDC.DASH/CMD.DATE_FILTER_WITH_DIMENSION_CONFIG.SET_MODE",
        payload: {
            dataSet,
            mode,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ISetDateFilterConfigTitle} command.
 * @beta
 */
export interface ISetDateFilterConfigTitlePayload {
    /**
     * Date data set ref of the filter to rename.
     * If not provided title is set to common date filter.
     */
    dataSet?: ObjRef;
    /**
     * Title of the filter.
     */
    title?: string;
}

/**
 * Command for changing date filter title.
 * @beta
 */
export interface ISetDateFilterConfigTitle extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_TITLE";
    readonly payload: ISetDateFilterConfigTitlePayload;
}

/**
 * Creates the {@link ISetDateFilterConfigTitle} command.
 *
 * @remarks
 * Dispatching the commands will result into setting provided title as a selected
 * title for the date filter.
 *
 *
 * @beta
 * @param dataSet - date data set ref of the filter the display form is changed for
 * @param title - newly added title
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change filter title command
 */
export function setDateFilterConfigTitle(
    dataSet?: ObjRef,
    title?: string,
    correlationId?: string,
): ISetDateFilterConfigTitle {
    return {
        type: "GDC.DASH/CMD.DATE_FILTER_CONFIG.SET_TITLE",
        correlationId,
        payload: {
            dataSet,
            title,
        },
    };
}

/**
 * Payload of the {@link IChangeIgnoreExecutionTimestamp} command.
 * @alpha
 */
export interface IChangeIgnoreExecutionTimestampPayload {
    /**
     * New ignore execution timestamp value.
     */
    ignoreExecutionTimestamp: boolean;
}

/**
 * Command for changing the ignore logic of execution timestamp.
 *
 * When executionTimestamp is provided to the dashboard, each execution is using this timestamp. This command instructs the
 * application to change the ignore flag for the execution timestamp in all following executions.
 *
 * @alpha
 */
export interface IChangeIgnoreExecutionTimestamp extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.CHANGE_IGNORE_EXECUTION_TIMESTAMP";
    readonly payload: IChangeIgnoreExecutionTimestampPayload;
}

/**
 * Creates the {@link IChangeIgnoreExecutionTimestamp} command.
 *
 * @remarks
 * Dispatching the commands will result into setting state to ignore execution timestamp.
 *
 * @alpha
 * @param ignoreExecutionTimestamp -
 * @param correlationId - specify correlation id. It will be included in all events that will be emitted during the command processing.
 * @returns change ignore execution timestamp command
 */
export function changeIgnoreExecutionTimestamp(
    ignoreExecutionTimestamp: boolean,
    correlationId?: string,
): IChangeIgnoreExecutionTimestamp {
    return {
        type: "GDC.DASH/CMD.CHANGE_IGNORE_EXECUTION_TIMESTAMP",
        correlationId,
        payload: { ignoreExecutionTimestamp },
    };
}
