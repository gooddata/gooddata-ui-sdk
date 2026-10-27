// (C) 2007-2026 GoodData Corporation

import { all, call, fork, put } from "redux-saga/effects";

import { type BootstrapError, bootstrapError } from "../actions/app_context_actions.js";
import { watchCancelEditFromKD } from "../postMessageApi/sagas/cancel_edit_from_kd_saga.js";
import { deliverHostCommands } from "../postMessageApi/sagas/host_command_delivery_saga.js";
import { watchIncomingCommands } from "../postMessageApi/sagas/incoming_command_sagas.js";
import { watchArithmeticMeasureOperations } from "../store/arithmetic_measures/arithmetic_measures_operations_saga.js";
import { watchArithmeticMeasures } from "../store/arithmetic_measures/arithmetic_measures_saga.js";
import { watchBucketFilterOperations } from "../store/bucket_filters/bucket_filters_operations_saga.js";
import { watchBucketFilters } from "../store/bucket_filters/bucket_filters_sagas.js";
import { watchBucketFiltersTelemetry } from "../store/bucket_filters/bucket_filters_telemetry_sagas.js";
import { watchBucketsOperations } from "../store/buckets/buckets_operations_saga.js";
import { watchExecutionCoordination } from "../store/execution/execution_coordination_saga.js";
import { watchMetricEditor } from "../store/metric_editor/metric_editor_sagas.js";
import { watchPropertiesOperations } from "../store/properties/properties_operations_saga.js";
import { watchRecommendationOperations } from "../store/recommendations/recommendations_operations_saga.js";
import { watchRecommendations } from "../store/recommendations/recommendations_sagas.js";
import { watchDispatchPostponedAction } from "../store/shortcuts/postponed_action_sagas.js";
import { watchShortcutOperations } from "../store/shortcuts/shortcuts_operations_saga.js";

import { loadIntlMessages, watchApplicationContext } from "./application_context/application_context_saga.js";
import { watchApplicationInitialization } from "./application_initialization_tracking_sagas.js";
import { watchApplicationRedirect } from "./application_redirect_sagas.js";
import { waitForBackendInitialization } from "./backend_sagas.js";
import { watchErrorBootstrap } from "./bootstrap_error_sagas.js";
import { watchBuckets } from "./bucket_saga.js";
import { watchBucketsToSetNotifications } from "./buckets_notifications/buckets_notifications_saga.js";
import { watchCatalog } from "./catalog/catalog_saga.js";
import { watchChartSort } from "./chart_sort/chart_sort_saga.js";
import { watchDraggedCatalogItems } from "./config_panel/config_panel_saga.js";
import { confirmUnsavedChangesWatcher } from "./confirm_unsaved_changes_sagas.js";
import { watchDataSampling } from "./data_sample_sagas.js";
import { watchDateDatasets } from "./date_datasets/date_datasets_sagas.js";
import { watchDeleteReport } from "./delete_report_sagas.js";
import { watchDescriptionTooltip } from "./description_tooltip/description_tooltip_saga.js";
import { dragAndDropWatcher } from "./drag_and_drop/drag_and_drop_saga.js";
import { drillWatcher } from "./drill_sagas.js";
import { watchDrillableItems } from "./drillable_items_sagas.js";
import { watchEmbedDialogSaga } from "./embed_dialog_sagas.js";
import { watchExecuteReport } from "./execute_report_sagas.js";
import { watchExportReport } from "./export_report_sagas.js";
import { watchFeatureFlags } from "./featureFlags_sagas.js";
import { watchFilterBar } from "./filter_bar/filter_bar_saga.js";
import { highlightingWatcher } from "./highlighting/highlighting_saga.js";
import { watchInsightAccess } from "./insight_access_sagas.js";
import { messagesWatcher } from "./messages_sagas.js";
import { watchOpenReport } from "./open_report_sagas.js";
import { watchPermissions } from "./permissions_saga.js";
import { watchPoweredByGDC } from "./powered_by_gdc/powered_by_gdc_saga.js";
import { watchProperties } from "./properties_sagas.js";
import { watchReset } from "./reset_sagas.js";
import { watchRouter } from "./router_sagas.js";
import { watchSaveReport } from "./save_report_sagas.js";
import { watchSelectVisualizationType } from "./select_visualization_type_sagas.js";
import { watchShortcuts } from "./shortcut_sagas.js";
import { watchTelemetryInitialized } from "./tracking/telemetry_initialized_saga.js";
import { watchUiExtendedReferencePointChanged } from "./ui_extended_reference_point_changed_sagas.js";

export function* root() {
    yield call(loadIntlMessages, "en-US");
    yield fork(watchApplicationContext);
    yield call(waitForBackendInitialization);

    try {
        yield all([
            // FIRST, and the position is deliberate. The buckets family's 24 triggers → ~15 operations →
            // one semantic event each; it replaced `bucketsApplyReducer`, so without it the
            // triggers write nothing at all. That reducer ran BEFORE any saga observed a trigger, so the
            // buckets write always landed ahead of every other reaction to the same trigger. Registering
            // this watcher first is what keeps that true: takers run in registration order, so its event
            // is the first dispatch the trigger produces.
            //
            // It is a DEFAULT, not a guarantee any other saga may lean on — a `put` only reaches the
            // reducer after the current scheduler flush, so a watcher that needs the committed value has
            // to wait for the event itself (`store/shortcuts/postponed_action_sagas.ts` is the one that
            // does, and the shortcut it replays was dropped on the floor until it did).
            watchBucketsOperations(),
            // these operation watchers sit right behind the buckets family's, for the same
            // reason it is registered first: their event should be the trigger's first reaction
            watchPropertiesOperations(),
            watchArithmeticMeasureOperations(),
            watchRecommendationOperations(),
            watchShortcutOperations(),
            // the bucket-filters family — same slot, same reasoning
            watchBucketFilterOperations(),
            // REPORT_EXECUTION_FINISHED → the current-execution coordination event that
            // closes report.nowOpen — same slot, same reasoning
            watchExecutionCoordination(),
            watchErrorBootstrap(),
            watchDateDatasets(),
            watchReset(),
            watchExecuteReport(),
            watchExportReport(),
            watchShortcuts(),
            watchOpenReport(),
            watchSaveReport(),
            watchInsightAccess(),
            watchCancelEditFromKD(),
            watchDeleteReport(),
            watchRouter(),
            watchDrillableItems(),
            watchIncomingCommands(),
            watchDispatchPostponedAction(),
            watchCatalog(),
            watchFilterBar(),
            watchFeatureFlags(),
            watchArithmeticMeasures(),
            watchRecommendations(),
            watchBucketFilters(),
            watchBucketFiltersTelemetry(),
            highlightingWatcher(),
            watchDraggedCatalogItems(),
            watchBucketsToSetNotifications(),
            watchBuckets(),
            watchDataSampling(),
            dragAndDropWatcher(),
            drillWatcher(),
            watchProperties(),
            watchPermissions(),
            confirmUnsavedChangesWatcher(),
            watchApplicationRedirect(),
            messagesWatcher(),
            watchMetricEditor(),
            watchChartSort(),
            watchSelectVisualizationType(),
            watchUiExtendedReferencePointChanged(),
            watchEmbedDialogSaga(),
            watchApplicationInitialization(),
            watchPoweredByGDC(),
            watchDescriptionTooltip(),
            watchTelemetryInitialized(),
            // LAST: it delivers the in-process host commands, so every watcher above listens first.
            deliverHostCommands(),
        ]);
    } catch (e) {
        console.error(e);
        yield put(bootstrapError("", e as BootstrapError));
    }
}
