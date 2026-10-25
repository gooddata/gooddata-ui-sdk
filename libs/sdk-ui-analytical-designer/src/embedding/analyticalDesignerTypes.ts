// (C) 2026 GoodData Corporation

import { type Ref } from "react";

import {
    type IAnalyticalBackend,
    type IUserSettings,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";
import {
    type AdCommandData,
    type AdExportFinishedBody,
    type AdFilterContextChangedBody,
    type AdInsightChangedBody,
    type AdInsightRenderedBody,
    type AdInsightSavedBody,
    type GdcAdCommandType,
    type IAdAvailableCommands,
    type ICommandFailedBody,
    type IFilterContextContent,
    type IObjectMeta,
} from "@gooddata/sdk-embedding";
import {
    type IColorPalette,
    type IEntitlementDescriptor,
    type IInsight,
    type IInsightDefinition,
    type ILocale,
    type ISeparators,
    type ITheme,
    type IUser,
    type IWorkspacePermissions,
    type ObjRef,
} from "@gooddata/sdk-model";

import { type IAnalyticalDesignerSlots } from "./slots.js";

/**
 * An action of the Analytical Designer header that a host can hide.
 *
 * @alpha
 */
export type AnalyticalDesignerHiddenAction =
    | "open"
    | "clear"
    | "export"
    | "save"
    | "saveAs"
    | "openInAnalyticalDesigner";

/**
 * Callbacks that forward the Analytical Designer telemetry into the host's pipeline.
 *
 * @alpha
 */
export interface IAnalyticalDesignerTelemetryCallbacks {
    /**
     * Tracks an event.
     */
    trackEvent: (
        eventName: string,
        data?: Record<string, unknown>,
        options?: { channel?: "standard" | "ai" },
    ) => void;

    /**
     * Tracks a page view.
     */
    trackPageView: (page: string, data?: Record<string, unknown>) => void;

    /**
     * Tracks a duration.
     */
    trackTiming: (variable: string, label: string, valueMs: number, data?: Record<string, unknown>) => void;
}

/**
 * Configuration of Analytical Designer.
 *
 * @remarks
 * Analytical Designer reads the values that set up the runtime (locale, settings, organization,
 * theme, telemetry and read-only mode) when it mounts. Changes to the route values (`sourceDashboard`,
 * `sourceInsight`, the actions, the tags, the separators, `asOfDate`, `isEmbedded` and
 * `allowDashboardLinks`) navigate Analytical Designer.
 *
 * @alpha
 */
export interface IAnalyticalDesignerConfig {
    /**
     * Locale of the user interface. The default is `en-US`.
     */
    locale?: ILocale;

    /**
     * Locale that formats numbers and dates. The default comes from the settings.
     */
    formatLocale?: string;

    /**
     * Separators of thousands and decimals. The default comes from the settings.
     */
    separators?: ISeparators;

    /**
     * Settings and feature flags. Analytical Designer loads them from the backend when they are not
     * provided.
     */
    settings?: IUserWorkspaceSettings | IUserSettings;

    /**
     * Mapbox token for the geo charts. The default comes from the settings.
     */
    mapboxToken?: string;

    /**
     * AG Grid token for the pivot table. The default comes from the settings.
     */
    agGridToken?: string;

    /**
     * Color palette of the charts. Analytical Designer loads the palette of the workspace when it is
     * not provided.
     */
    colorPalette?: IColorPalette;

    /**
     * White labeling of the Analytical Designer user interface.
     */
    whiteLabeling?: {
        logoUrl?: string;
        isBranded?: boolean;
    };

    /**
     * The current user. Analytical Designer loads it when it is not provided.
     */
    user?: IUser;

    /**
     * The organization. Analytical Designer loads its `id` and `title` when `id` is not provided. The
     * other values are stored in the bootstrap data for hosts that pass them; Analytical Designer
     * itself reads none of them today (the trial dialog that did was removed).
     */
    organization?: {
        id?: string;
        title?: string;
        isAdmin?: boolean;
        expiredDate?: string;
        entitlements?: IEntitlementDescriptor[];
    };

    /**
     * Hides the actions that change the insight: save, save as and create new.
     */
    isReadOnly?: boolean;

    /**
     * Marks Analytical Designer as opened from a dashboard.
     */
    isEmbedded?: boolean;

    /**
     * Header actions to hide.
     */
    hiddenActions?: AnalyticalDesignerHiddenAction[];

    /**
     * Header actions to show that are hidden by default.
     */
    displayedActions?: Array<"cancel">;

    /**
     * Whether the drill-to-dashboard configuration can link dashboards.
     */
    allowDashboardLinks?: boolean;

    /**
     * Date that relative date filters are computed from, in the `YYYY-MM-DD` format.
     */
    asOfDate?: string;

    /**
     * Only the catalog items with one of these tags are shown.
     */
    includeObjectsWithTags?: string[];

    /**
     * The catalog items with one of these tags are hidden.
     */
    excludeObjectsWithTags?: string[];

    /**
     * Dashboard the edited insight comes from. Its presence, not its value, starts the
     * edit-from-dashboard flow: the header offers going back to the dashboard. An empty string means
     * the dashboard is not saved yet.
     */
    sourceDashboard?: string | ObjRef;

    /**
     * Insight to open as an unsaved copy (the explore flow). Saving creates a new insight.
     */
    sourceInsight?: string | ObjRef;

    /**
     * Forwards the Analytical Designer telemetry into the host's pipeline. The default tracks nothing.
     */
    telemetryCallbacks?: IAnalyticalDesignerTelemetryCallbacks;
}

/**
 * An event Analytical Designer emits. `name` and `data` follow the `@gooddata/sdk-embedding`
 * contract of the embedded Analytical Designer.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEvent<TData = unknown> {
    /**
     * Name of the product that emits the event.
     */
    product: string;

    /**
     * Name of the event.
     */
    name: string;

    /**
     * Payload of the event.
     */
    data: TData;

    /**
     * Identifier of the command the event answers, if any.
     */
    contextId?: string;
}

/**
 * Handles the Analytical Designer events that it accepts.
 *
 * @alpha
 */
export interface IAnalyticalDesignerEventHandler {
    /**
     * Returns true for the events the handler accepts.
     */
    eval: (event: IAnalyticalDesignerEvent) => boolean;

    /**
     * Called with each accepted event.
     */
    handler: (event: IAnalyticalDesignerEvent) => void;
}

/**
 * Payload of the event Analytical Designer emits when it opens an insight.
 *
 * @alpha
 */
export interface IAnalyticalDesignerInsightOpenedData {
    /**
     * Commands Analytical Designer accepts for the open insight.
     */
    availableCommands: GdcAdCommandType[];

    /**
     * Definition of the open insight.
     */
    definition: IInsightDefinition;

    /**
     * Metadata of the open insight.
     */
    insight: IObjectMeta;
}

/**
 * Commands a host sends to Analytical Designer.
 *
 * @alpha
 */
export interface IAnalyticalDesignerApi {
    /**
     * Clears the insight.
     */
    clear(): void;

    /**
     * Asks Analytical Designer to cancel the editing. Analytical Designer confirms unsaved changes
     * first.
     */
    requestCancellation(): void;

    /**
     * Merges a dashboard filter context into the filters of the open insight.
     */
    setFilterContext(data: IFilterContextContent, contextId?: string): void;

    /**
     * Sends any command of the `@gooddata/sdk-embedding` contract.
     */
    sendCommand(command: AdCommandData): void;
}

/**
 * Resets the caches of a caching backend that the host shares with Analytical Designer. The
 * `CacheControl` of `withCaching` from `@gooddata/sdk-backend-base` fits it.
 *
 * @alpha
 */
export interface IAnalyticalDesignerCacheReset {
    /**
     * Resets all caches. Analytical Designer calls it when the user refreshes the catalog or edits a
     * metric.
     */
    resetAll?: () => void;

    /**
     * Resets the catalog cache. Analytical Designer calls it before it loads the attribute
     * hierarchies.
     */
    resetCatalogs?: () => void;
}

/**
 * Props of the Analytical Designer component.
 *
 * @alpha
 */
export interface IAnalyticalDesignerProps {
    /**
     * Insight to open: an identifier, a reference or the insight. Undefined opens a new insight.
     */
    insight?: string | ObjRef | IInsight;

    /**
     * Backend to work with. The default comes from the `BackendProvider`. It is read at mount: to
     * switch the backend, remount the component with a new `key`.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work in. The default comes from the `WorkspaceProvider`. It is read at mount: to
     * switch the workspace, remount the component with a new `key`.
     */
    workspace?: string;

    /**
     * Resets the caches of the backend when Analytical Designer needs fresh data, for example when
     * the user refreshes the catalog. Pass it when the backend caches; the latest value is used.
     */
    cacheReset?: IAnalyticalDesignerCacheReset;

    /**
     * Configuration of Analytical Designer.
     */
    config?: IAnalyticalDesignerConfig;

    /**
     * Permissions of the current user in the workspace. Analytical Designer loads them when they are
     * not provided.
     */
    permissions?: IWorkspacePermissions;

    /**
     * Theme to apply. Analytical Designer loads the theme of the workspace when it is not provided.
     */
    theme?: ITheme;

    /**
     * Skips loading the theme of the workspace.
     */
    disableThemeLoading?: boolean;

    /**
     * Changes the theme before Analytical Designer applies it.
     */
    themeModifier?: (theme: ITheme) => ITheme;

    /**
     * Regions of Analytical Designer that the host replaces or wraps.
     */
    slots?: IAnalyticalDesignerSlots;

    /**
     * Called when the user or a `save` command saves the insight. `contextId` identifies the command.
     */
    onInsightSaved?: (data: AdInsightSavedBody, contextId?: string) => void;

    /**
     * Called when the user cancels the editing.
     */
    onInsightEditingCancelled?: () => void;

    /**
     * Called when Analytical Designer opens an insight.
     */
    onInsightOpened?: (data: IAnalyticalDesignerInsightOpenedData) => void;

    /**
     * Called when the insight renders.
     */
    onInsightRendered?: (data: AdInsightRenderedBody) => void;

    /**
     * Called when the insight definition changes and its execution starts.
     */
    onInsightChanged?: (data: AdInsightChangedBody) => void;

    /**
     * Called when a `clear` command finishes. `contextId` identifies the command.
     */
    onClearFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when a `clearInsight` command finishes. `contextId` identifies the command.
     */
    onClearInsightFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when an `undo` command finishes. `contextId` identifies the command.
     */
    onUndoFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when a `redo` command finishes. `contextId` identifies the command.
     */
    onRedoFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when an `exportInsight` command finishes, with the link to the exported file.
     * `contextId` identifies the command.
     */
    onExportFinished?: (data: AdExportFinishedBody, contextId?: string) => void;

    /**
     * Called when the user changes a filter of the insight.
     */
    onFilterContextChanged?: (data: AdFilterContextChangedBody) => void;

    /**
     * Called when a `setFilterContext` command finishes. `contextId` identifies the command.
     */
    onSetFilterContextFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when a `removeFilterContext` command finishes. `contextId` identifies the command.
     */
    onRemoveFilterContextFinished?: (data: IAdAvailableCommands, contextId?: string) => void;

    /**
     * Called when the user saves or deletes a metric. A host that shares a caching backend with
     * Analytical Designer resets its caches here.
     */
    onMetricsChanged?: () => void;

    /**
     * Called when the user creates, changes or deletes an attribute hierarchy.
     */
    onAttributeHierarchyModified?: () => void;

    /**
     * Called when a command the host sent fails. `contextId` identifies the command.
     */
    onCommandFailed?: (data: ICommandFailedBody, contextId?: string) => void;

    /**
     * Called when Analytical Designer cannot start.
     */
    onError?: (error: unknown) => void;

    /**
     * Called with every event, before the typed callback.
     */
    onEvent?: (event: IAnalyticalDesignerEvent) => void;

    /**
     * Handlers called with the events they accept.
     */
    eventHandlers?: IAnalyticalDesignerEventHandler[];

    /**
     * Receives the commands the host sends to Analytical Designer.
     */
    apiRef?: Ref<IAnalyticalDesignerApi>;
}
