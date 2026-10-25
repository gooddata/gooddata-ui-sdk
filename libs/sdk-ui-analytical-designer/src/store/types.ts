// (C) 2026 GoodData Corporation

import { type Dispatch, type UnknownAction } from "redux";

import { type IPostMessageContextState } from "../postMessageApi/state/post_message_context_state.js";

import {
    type IAppReadyState,
    type IBootstrapDataState,
    type IColorPaletteState,
    type IErrorsState,
    type IProjectIdState,
} from "./app_context/app_context_state.js";
import { type IApplicationContextState } from "./application_context/application_context_state.js";
import { type IAttributeElementsState } from "./attribute_elements/attribute_elements_types.js";
import { type IBucketNotificationsState } from "./bucket_notifications/bucket_notifications_types.js";
import { type IBucketsMetaState } from "./buckets/buckets_meta_state.js";
import { type IBucketsState } from "./buckets/buckets_state.js";
import { type IPluggableVisualizationState } from "./buckets/pluggable_visualization_state.js";
import { type ICatalogState } from "./catalog/catalog_types.js";
import { type IChartSortState } from "./chart_sort/chart_sort_state.js";
import { type IConfigurationPanelState } from "./configuration_panel/configuration_panel_state.js";
import { type IDataSamplingState } from "./data_sampling/data_sampling_state.js";
import { type IDateDatasetsState } from "./date_datasets/date_datasets_state.js";
import { type IDateDatasetsMetaState } from "./date_datasets_meta/date_datasets_meta_state.js";
import { type IDialogsState } from "./dialogs/dialogs_state.js";
import { type IDragAndDropState } from "./drag_and_drop/dnd_types.js";
import { type IDrillableItemsState } from "./drillable_items/drillable_items_state.js";
import { type IDeviceState, type IThemeState } from "./embedding/embedding_state.js";
import { type IExecutionState } from "./execution/execution_state.js";
import { type IFeatureFlagsState } from "./feature_flags/feature_flags_state.js";
import { type IFilterBarState } from "./filter_bar/filter_bar_state.js";
import { type IFilterBarAutoOpenState } from "./filter_bar_auto_open/filter_bar_auto_open_state.js";
import { type IHighlightingState } from "./highlighting/highlighting_state.js";
import {
    type IInsightLayersOwnerState,
    type IInsightLayersState,
    type IInsightSummaryState,
    type IInsightTagsState,
    type IInsightTitleState,
} from "./insight/insight_state.js";
import { type IInsightAccessState } from "./insight_access/insight_access_state.js";
import { type IInsightUsageState } from "./insight_usage/insight_usage_state.js";
import { type IIntlState } from "./intl/intl_state.js";
import { type IItemCacheState } from "./item_cache/item_cache_state.js";
import { type IMeasureDateDatasetsState } from "./measure_date_datasets/measure_date_datasets_state.js";
import { type IMessagesState } from "./messages/messages_state.js";
import { type IMetricEditorState } from "./metric_editor/metric_editor_types.js";
import { type IWorkspacePermissionsState } from "./permissions/permissions_state.js";
import { type IPropertiesMetaState } from "./properties/properties_meta_state.js";
import { type IPropertiesState } from "./properties/properties_state.js";
import { type IDismissedRecommendationsState } from "./recommendations/recommendations_state.js";
import { type IExtendedReferencePointState } from "./reference_point/extended_reference_point_state.js";
import { type IReferencePointState } from "./reference_point/reference_point_state.js";
import {
    type IReportLastSavedObjectState,
    type IReportLoadingErrorState,
    type IReportNowOpenState,
    type IReportOpeningState,
    type IReportSavingAsNewState,
    type IReportSavingState,
} from "./report/report_state.js";
import { type IRouteState } from "./router/router_state.js";
import { type IPostponedActionState } from "./shortcuts/postponed_action_state.js";
import { type IShortcutDateDatasetsState } from "./shortcuts/shortcut_date_datasets_state.js";
import { type IShortcutDroppedItemState } from "./shortcuts/shortcut_dropped_item_state.js";
import { type ITimezoneOverrideState } from "./timezone_override/timezone_override_state.js";
import {
    type IVisualizationClassState,
    type IVisualizationClassesState,
} from "./visualization_classes/visualization_classes_state.js";

/**
 * THE root state type — one entry per key of the combined root, every one of them a real domain
 * type.
 *
 * - **CLOSED, at every level.** No index signature anywhere, so a read of a key no reducer owns is
 *   a compile error rather than `any`.
 * - **No `any`.** Every branch names the owning domain's state type, so a selector's return type is
 *   inferred from the reducer's own contract instead of being asserted at the read.
 * - **Checked against the reducers.** `reducers/combined_root_reducer.ts` asserts this type and
 *   `ICombinedRootState` (inferred from `combineReducers`) are mutually assignable, so adding a
 *   reducer key without declaring it here — or declaring one nothing owns — fails `build-check`.
 *
 * Values that are genuinely optional hold `null` at rest — redux's strict `combineReducers`
 * rejects `undefined` — and their input selectors convert back to `undefined`.
 */
export interface IAppState {
    appState: {
        appReady: IAppReadyState;
        dialogs: IDialogsState;
        dismissedRecommendations: IDismissedRecommendationsState;
        errors: IErrorsState;
        intl: IIntlState;
        /** the save flow locks redirects; the router saga unlocks */
        locationRedirectLock: boolean;
        messages: IMessagesState;
        /** true while a bucket item's title is being edited in place */
        renamingBucketItem: boolean;
        /** null until the first bootstrap (store/app_context/session_id_reducer.ts) */
        sessionId: string | null;
        meta: {
            device: IDeviceState;
            drillableItems: IDrillableItemsState;
            isEmbedded: boolean;
            isReadOnly: boolean;
            isHostedComponent: boolean;
            /** the postMessage domain's slice state (postMessageApi/state) */
            postMessageContext: IPostMessageContextState;
            theme: IThemeState;
        };
    };
    data: {
        applicationContext: IApplicationContextState;
        attributeElements: IAttributeElementsState;
        bucketNotifications: IBucketNotificationsState;
        buckets: IBucketsState;
        bucketsMeta: IBucketsMetaState;
        catalog: ICatalogState;
        chartSort: IChartSortState;
        configurationPanel: IConfigurationPanelState;
        dateDatasets: IDateDatasetsState;
        dateDatasetsMeta: IDateDatasetsMetaState;
        dragAndDrop: IDragAndDropState;
        /** null until a pluggable visualization answers (store/buckets) */
        extendedReferencePoint: IExtendedReferencePointState | null;
        filterBar: IFilterBarState;
        highlighting: IHighlightingState;
        insightUsagesOnDashboards: IInsightUsageState;
        insightAccessDraft: IInsightAccessState;
        /** the flag every buckets operation produces (store/buckets) */
        isVisualizationMdObjectValid: boolean;
        itemCache: IItemCacheState;
        measuresDateDatasets: IMeasureDateDatasetsState;
        metricEditor: IMetricEditorState;
        /** the queue of derived measures awaiting placement by a plug viz (store/buckets) */
        pluggableVisualization: IPluggableVisualizationState;
        /** the parked shortcut action the replay saga re-puts verbatim; null when none */
        postponedAction: IPostponedActionState | null;
        propertiesMeta: IPropertiesMetaState;
        referencePoint: IReferencePointState;
        shortcut: {
            shortcutDateDatasets: IShortcutDateDatasetsState;
            /** the parked dragged catalog item; null when nothing is parked */
            shortcutDroppedItem: IShortcutDroppedItemState;
        };
        /** the insight domain's mini-branch leaves (store/insight) */
        title: IInsightTitleState;
        tags: IInsightTagsState;
        summary: IInsightSummaryState;
        layers: IInsightLayersState;
        layersOwner: IInsightLayersOwnerState;
        visualizationClass: IVisualizationClassState;
        visualizationClasses: IVisualizationClassesState;
        visualizationProperties: IPropertiesState;
    };
    report: {
        execution: IExecutionState;
        /** the report domain's mini-branch leaves (store/report) */
        saving: IReportSavingState;
        savingAsNew: IReportSavingAsNewState;
        opening: IReportOpeningState;
        nowOpen: IReportNowOpenState;
        loadingError: IReportLoadingErrorState;
        lastSavedObject: IReportLastSavedObjectState;
    };
    bootstrapData: IBootstrapDataState;
    projectId: IProjectIdState;
    colorPalette: IColorPaletteState;
    featureFlags: IFeatureFlagsState;
    workspacePermissions: IWorkspacePermissionsState;
    /** null = not set (the selectors convert back to undefined) */
    dataSamplingPercentage: IDataSamplingState;
    timezoneOverride: ITimezoneOverrideState;
    /** the filter the filter bar opens right after the user added it; null when none is pending */
    filterBarAutoOpen: IFilterBarAutoOpenState;
    /** null until the first LOCATION_CHANGED / SET_ROUTE_PROJECT_ID (see store/router). */
    route: IRouteState | null;
    previousRoute: IRouteState | null;
    /** the undo/redo history (store/_infra/time_travel.ts) */
    timeTravel: ITimeTravelState;
}

/**
 * The undo/redo history state. The mechanics live in store/_infra/time_travel.ts; the types live
 * here because they are a projection OF the root shape — putting them in the time-travel module
 * would close a cycle with this one.
 *
 * Keeping the stacks in the store is what makes the wrapper a pure reducer: they travel with the
 * state, a pluggable remount gets a fresh history for free, and the redux devtools can see them.
 */

/**
 * ONE undo step: the undoable projection of the root state as it was BEFORE `actionType` applied,
 * captured BY REFERENCE (see `captureSnapshot`).
 */
export interface ITimeTravelEntry {
    readonly state: IUndoableState;
    /**
     * The action that produced the state this entry was captured against. Not read by the
     * mechanics — kept because it is what makes a history entry legible in the devtools and in a
     * failing test.
     */
    readonly actionType: string;
}

export interface ITimeTravelState {
    readonly past: readonly ITimeTravelEntry[];
    readonly future: readonly ITimeTravelEntry[];
}

/**
 * The undoable projection of the root state.
 *
 * A DENY-list, not an allow-list: undo restores the whole root, so anything left out is a
 * deliberate exclusion and a root key added later is undoable by default — the safe direction (an
 * accidentally-included key restores a value that never changes; an accidentally EXCLUDED one
 * silently drops a user edit on undo). `time_travel.test.ts` pins the exact key set so a new root
 * key forces the decision to be made consciously.
 *
 * The exclusions are the branches that are not user edits:
 *
 * - `report` — `lastSavedObject`, plus the in-flight `execution` that undoing onto a snapshot must
 *   not resurrect.
 * - `timezoneOverride` — session UI.
 * - `filterBarAutoOpen` — a one-shot UI hand-over; a redo must not reopen a picker.
 * - `appState.messages` — toasts outlive an undo.
 * - `timeTravel` — the history must not contain itself.
 *
 * The two fixups that are NOT expressible as an exclusion (collapsed-buckets meta, dropped
 * shortcut item) stay in `restoreSnapshot`.
 */
export type IUndoableState = Omit<
    IAppState,
    "report" | "timezoneOverride" | "filterBarAutoOpen" | "timeTravel" | "appState"
> & {
    /**
     * `appState` minus the toasts, expressed in the TYPE and not only in `captureSnapshot`, so the
     * compiler holds `restoreSnapshot` to the same omission.
     */
    appState: Omit<IAppState["appState"], "messages">;
};

/**
 * THE store's dispatch type, and the only one in the package.
 *
 * It is `Dispatch<UnknownAction>` because that is what `configureStore` infers here: `thunk` is
 * off and redux-saga's middleware adds no dispatch overload, so nothing widens the signature.
 * `create_store.test.ts` pins that mutually — a middleware that DOES extend dispatch (a thunk, a
 * listener) has to be reflected here or the build fails, instead of this type quietly lying.
 */
export type AppDispatch = Dispatch<UnknownAction>;
