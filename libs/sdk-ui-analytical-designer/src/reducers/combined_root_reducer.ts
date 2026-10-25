// (C) 2026 GoodData Corporation

import { combineReducers } from "redux";

import { postMessageContextSliceReducer } from "../postMessageApi/state/post_message_context_slice.js";
import { nullableLeaf } from "../store/_infra/nullable_leaf.js";
import { timeTravelLeafReducer } from "../store/_infra/time_travel_state.js";
import {
    appReadySliceReducer,
    bootstrapDataSliceReducer,
    colorPaletteSliceReducer,
    errorsSliceReducer,
    projectIdSliceReducer,
} from "../store/app_context/app_context_slices.js";
import { sessionIdLeafReducer } from "../store/app_context/session_id_reducer.js";
import { applicationContextReducer } from "../store/application_context/app_context_reducer.js";
import { attributeElementsReducer } from "../store/attribute_elements/attribute_elements_reducer.js";
import { bucketNotificationsLeafReducer } from "../store/bucket_notifications/buckets_notifications_reducer.js";
import { bucketsMetaSliceReducer } from "../store/buckets/buckets_meta_slice.js";
import {
    extendedReferencePointLeafReducer,
    isVisualizationMdObjectValidLeafReducer,
    pluggableVisualizationLeafReducer,
} from "../store/buckets/buckets_operation_leaves.js";
import { bucketsSliceReducer } from "../store/buckets/buckets_slice.js";
import { renamingBucketItemSliceReducer } from "../store/buckets/renaming_bucket_item_slice.js";
import { catalogReducer } from "../store/catalog/catalog_reducer.js";
import { chartSortReducer } from "../store/chart_sort/chart_sort_reducer.js";
import { configurationPanelSliceReducer } from "../store/configuration_panel/configuration_panel_slice.js";
import { dataSamplingSliceReducer } from "../store/data_sampling/data_sampling_slice.js";
import { dateDatasetsSliceReducer } from "../store/date_datasets/date_datasets_slice.js";
import { dateDatasetsMetaSliceReducer } from "../store/date_datasets_meta/date_datasets_meta_slice.js";
import { dialogsSliceReducer } from "../store/dialogs/dialogs_slice.js";
import { dndLeafReducer } from "../store/drag_and_drop/dnd_reducer.js";
import { drillableItemsSliceReducer } from "../store/drillable_items/drillable_items_slice.js";
import {
    deviceSliceReducer,
    isEmbeddedSliceReducer,
    isHostedComponentSliceReducer,
    isReadOnlySliceReducer,
    themeSliceReducer,
} from "../store/embedding/embedding_slices.js";
import { executionSliceReducer } from "../store/execution/execution_slice.js";
import { featureFlagsSliceReducer } from "../store/feature_flags/feature_flags_slice.js";
import { filterBarReducer } from "../store/filter_bar/filter_bar_reducer.js";
import { filterBarAutoOpenSliceReducer } from "../store/filter_bar_auto_open/filter_bar_auto_open_slice.js";
import { highlightingSliceReducer } from "../store/highlighting/highlighting_slice.js";
import {
    insightLayersOwnerSliceReducer,
    insightLayersSliceReducer,
    insightSummarySliceReducer,
    insightTagsSliceReducer,
    insightTitleSliceReducer,
} from "../store/insight/insight_slices.js";
import { insightAccessSliceReducer } from "../store/insight_access/insight_access_slice.js";
import { insightUsageSliceReducer } from "../store/insight_usage/insight_usage_slice.js";
import { intlSliceReducer } from "../store/intl/intl_slice.js";
import { itemCacheSliceReducer } from "../store/item_cache/item_cache_slice.js";
import { measureDateDatasetsSliceReducer } from "../store/measure_date_datasets/measure_date_datasets_slice.js";
import { messagesSliceReducer } from "../store/messages/messages_slice.js";
import { metricEditorReducer } from "../store/metric_editor/metric_editor_reducer.js";
import { permissionsSliceReducer } from "../store/permissions/permissions_slice.js";
import { propertiesMetaSliceReducer } from "../store/properties/properties_meta_slice.js";
import { propertiesSliceReducer } from "../store/properties/properties_slice.js";
import { recommendationsSliceReducer } from "../store/recommendations/recommendations_slice.js";
import { referencePointSliceReducer } from "../store/reference_point/reference_point_slice.js";
import {
    reportLastSavedObjectSliceReducer,
    reportLoadingErrorSliceReducer,
    reportNowOpenSliceReducer,
    reportOpeningSliceReducer,
    reportSavingAsNewSliceReducer,
    reportSavingSliceReducer,
} from "../store/report/report_slices.js";
import { locationRedirectLockSliceReducer } from "../store/router/location_redirect_lock_slice.js";
import { previousRouteLeafReducer, routeLeafReducer } from "../store/router/route_leaf_reducers.js";
import { postponedActionLeafReducer } from "../store/shortcuts/postponed_action_reducer.js";
import { shortcutDateDatasetsSliceReducer } from "../store/shortcuts/shortcut_date_datasets_slice.js";
import { shortcutDroppedItemLeafReducer } from "../store/shortcuts/shortcut_dropped_item_reducer.js";
import { timezoneOverrideSliceReducer } from "../store/timezone_override/timezone_override_slice.js";
import { type IAppState } from "../store/types.js";
import {
    visualizationClassSliceReducer,
    visualizationClassesSliceReducer,
} from "../store/visualization_classes/visualization_classes_slices.js";

/**
 * THE COMBINED ROOT: redux's strict `combineReducers`, nested per branch. Every key has exactly one
 * owning reducer, and THIS module is the mount table. The strictness is the contract:
 *
 * - a key nobody owns does not exist — an unknown key in an incoming state is dropped (redux
 *   warns in development), so ownership disputes are impossible by construction;
 * - `undefined` is not a value — redux throws on an `undefined` reducer return. Values that are
 *   genuinely optional (the route before the first navigation, a parked item, the extended
 *   reference point before a pluggable visualization answers) hold `null` at rest via
 *   {@link nullableLeaf}, and their input selectors convert back to `undefined`;
 * - identity short-circuit — when no child changed, the SAME branch object comes back, so store
 *   subscriptions and memoized selectors stay quiet.
 *
 * The pristine state IS the reducer's own default build: every leaf self-initializes from its
 * own initial state on the first dispatch (and on RESET_FOR_PLUGGABLE_MOUNT, which
 * root_reducer.ts short-circuits to a fresh build). There is no separate hand-maintained
 * pristine literal to drift from it.
 */

// appState.meta: the shared embedded-context container — the embedding mini-slices plus the
// drillableItems and postMessage slices
const metaReducer = combineReducers({
    device: deviceSliceReducer,
    theme: themeSliceReducer,
    isEmbedded: isEmbeddedSliceReducer,
    isReadOnly: isReadOnlySliceReducer,
    isHostedComponent: isHostedComponentSliceReducer,
    drillableItems: drillableItemsSliceReducer,
    postMessageContext: postMessageContextSliceReducer,
});

const appStateReducer = combineReducers({
    // fresh session ids are generated at the dispatch boundary and arrive ON the actions
    // (bootstrap/refresh prepare, the reset carriers), so the reducer is pure; null until the
    // first bootstrap — store/app_context/session_id_reducer.ts
    sessionId: nullableLeaf(sessionIdLeafReducer),
    errors: errorsSliceReducer,
    appReady: appReadySliceReducer,
    // there are no undo/redo flags: both are derived from the in-store history at `timeTravel`
    // below, so they cannot drift out of sync with the stacks
    renamingBucketItem: renamingBucketItemSliceReducer,
    // the save flow locks redirects; the router saga unlocks
    locationRedirectLock: locationRedirectLockSliceReducer,
    intl: intlSliceReducer,
    messages: messagesSliceReducer,
    dialogs: dialogsSliceReducer,
    dismissedRecommendations: recommendationsSliceReducer,
    meta: metaReducer,
});

// data.shortcut: the slice-owned date datasets + the parked dropped item (null when nothing is
// parked; the time-travel restore fixup still writes it through the root, which stays
// infrastructure)
const shortcutReducer = combineReducers({
    shortcutDateDatasets: shortcutDateDatasetsSliceReducer,
    shortcutDroppedItem: nullableLeaf(shortcutDroppedItemLeafReducer),
});

const dataReducer = combineReducers({
    catalog: catalogReducer,
    filterBar: filterBarReducer,
    attributeElements: attributeElementsReducer,
    chartSort: chartSortReducer,
    metricEditor: metricEditorReducer,
    applicationContext: applicationContextReducer,
    insightUsagesOnDashboards: insightUsageSliceReducer,
    insightAccessDraft: insightAccessSliceReducer,
    itemCache: itemCacheSliceReducer,
    dateDatasetsMeta: dateDatasetsMetaSliceReducer,
    dateDatasets: dateDatasetsSliceReducer,
    configurationPanel: configurationPanelSliceReducer,
    visualizationClasses: visualizationClassesSliceReducer,
    visualizationClass: visualizationClassSliceReducer,
    dragAndDrop: dndLeafReducer,
    buckets: bucketsSliceReducer,
    title: insightTitleSliceReducer,
    tags: insightTagsSliceReducer,
    summary: insightSummarySliceReducer,
    layers: insightLayersSliceReducer,
    layersOwner: insightLayersOwnerSliceReducer,
    visualizationProperties: propertiesSliceReducer,
    propertiesMeta: propertiesMetaSliceReducer,
    highlighting: highlightingSliceReducer,
    bucketNotifications: bucketNotificationsLeafReducer,
    shortcut: shortcutReducer,
    // the parked shortcut action the replay saga re-puts verbatim; hand-written so the re-put
    // action is not frozen by immer — store/shortcuts/postponed_action_reducer.ts
    postponedAction: nullableLeaf(postponedActionLeafReducer),
    measuresDateDatasets: measureDateDatasetsSliceReducer,
    referencePoint: referencePointSliceReducer,
    // null until a pluggable visualization reports one — the readers distinguish "a plug viz
    // has answered" from "it has not". Hand-written rather than a slice because its value goes
    // straight back to a pluggable visualization, so it must not be drafted (and therefore
    // frozen) by immer — store/buckets/buckets_operation_leaves.ts
    extendedReferencePoint: nullableLeaf(extendedReferencePointLeafReducer),
    bucketsMeta: bucketsMetaSliceReducer,
    pluggableVisualization: pluggableVisualizationLeafReducer,
    isVisualizationMdObjectValid: isVisualizationMdObjectValidLeafReducer,
});

const reportReducer = combineReducers({
    saving: reportSavingSliceReducer,
    savingAsNew: reportSavingAsNewSliceReducer,
    opening: reportOpeningSliceReducer,
    nowOpen: reportNowOpenSliceReducer,
    loadingError: reportLoadingErrorSliceReducer,
    lastSavedObject: reportLastSavedObjectSliceReducer,
    execution: executionSliceReducer,
});

const strictRootReducer = combineReducers({
    appState: appStateReducer,
    data: dataReducer,
    report: reportReducer,
    bootstrapData: bootstrapDataSliceReducer,
    projectId: projectIdSliceReducer,
    colorPalette: colorPaletteSliceReducer,
    featureFlags: featureFlagsSliceReducer,
    workspacePermissions: permissionsSliceReducer,
    // both store null rather than a present-undefined key
    // (createSlice cannot self-initialize from undefined) — the selector boundaries convert
    // back to undefined
    dataSamplingPercentage: dataSamplingSliceReducer,
    timezoneOverride: timezoneOverrideSliceReducer,
    // the one-shot "open the filter the user just added" hand-over; null when none is pending
    filterBarAutoOpen: filterBarAutoOpenSliceReducer,
    // the undo/redo history; self-initializes empty, and the withTimeTravel wrapper is its only
    // writer — store/_infra/time_travel_state.ts
    timeTravel: timeTravelLeafReducer,
    // independent leaves: the `routeChanged` event carries BOTH values (the router saga reads the
    // pre-navigation route before dispatching), so neither leaf cross-reads the other; null until
    // the first navigation — store/router/route_leaf_reducers.ts
    route: nullableLeaf(routeLeafReducer),
    previousRoute: nullableLeaf(previousRouteLeafReducer),
});

/**
 * The strictly-typed root shape, inferred from the reducers themselves — one owner per key is
 * the compiler's business now (a second writer of a key simply has nowhere to plug in).
 */
export type ICombinedRootState = ReturnType<typeof strictRootReducer>;

/**
 * THE DRIFT GATE. `ICombinedRootState` is inferred from the mount table above; `IAppState`
 * (store/types.ts) is the hand-written root every selector and saga names. These two assertions are
 * what keeps them the same shape — each direction fails `build-check` on the spot:
 *
 * - a reducer key with no declaration in `IAppState` breaks the first line;
 * - a declared key no reducer owns breaks the second.
 */
type AssertAssignable<TSource extends TTarget, TTarget> = [TSource, TTarget];

export type IRootShapeMatchesReducers = [
    AssertAssignable<ICombinedRootState, IAppState>,
    AssertAssignable<IAppState, ICombinedRootState>,
];

/**
 * The one deliberate cast, and it is only about ACTIONS: the leaves keep their own narrow action
 * unions (each no-ops every action it does not know, so calling them with a wider action type is
 * safe at runtime). The STATE side is no longer a cast — `IAppState` and the inferred
 * `ICombinedRootState` are the same shape, asserted right above.
 */
export const combinedRootReducer = strictRootReducer as unknown as (
    state: IAppState | undefined,
    action: { type: string },
) => IAppState;
