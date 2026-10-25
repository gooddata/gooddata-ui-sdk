// (C) 2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { type ObjRef } from "@gooddata/sdk-model";

import {
    applyMetricOverTimePostponedShortcut,
    applyMetricOverTimeShortcut,
    applyMetricPostponedShortcut,
    applyMetricShortcut,
} from "../../actions/shortcuts_actions.js";
import { MEASURES } from "../../constants/bucket.js";
import { COLUMN } from "../../constants/visualization_types.js";
import { getActiveCalendars } from "../../selectors/feature_flag_selector.js";
import { getDroppedCatalogItem } from "../../selectors/shortcuts_selector.js";
import { DateDatasetsMetaService } from "../../services/date_datasets_meta_service.js";
import { DateDatasetsService } from "../../services/date_datasets_service.js";
import { getLocalVisualizationClass, isColumnSelected } from "../../services/visualization_class_service.js";
import { type ICatalogEntry } from "../../typings/state_objects.js";
import { type DateDatasetByRefResolver } from "../buckets/buckets_date_helpers.js";
import {
    buildAddBucketItemDeps,
    buildBucketItemEditDeps,
    buildReferencePointSyncDeps,
    readAddBucketItemInput,
} from "../buckets/buckets_operation_inputs.js";
import { getBucketsState } from "../buckets/buckets_selectors.js";
import { getDateDatasetsState } from "../date_datasets/date_datasets_selectors.js";
import { type IAppState } from "../types.js";

import { getPostponedAction } from "./postponed_action_selectors.js";
import { getShortcutDateDatasetsState } from "./shortcut_date_datasets_selectors.js";
import {
    metricOverTimeShortcutApplied,
    metricShortcutApplied,
    shortcutPostponed,
} from "./shortcuts_operation_events.js";
import {
    type IShortcutApplyDeps,
    type IShortcutApplyInput,
    applyMetricOverTimeShortcutToBuckets,
    applyMetricShortcutToBuckets,
    buildMetricOverTimePostponedAction,
    buildMetricPostponedAction,
    getTrendBucketLocalIdentifier,
    postponeShortcut,
} from "./shortcuts_operations.js";

/**
 * THE SHORTCUT OPERATION SAGAS, in the `buckets_operations_saga.ts` shape: select the typed input,
 * select the deps, call the pure operation, put ONE semantic event.
 *
 * The BRANCH between apply and postpone lives here, because its deciding facts are boundary reads: a
 * drop on a column chart applies directly; on any other chart it parks the replay action and switches
 * to the workspace's column class; and with NO column class in the workspace the gesture commits
 * nothing at all.
 */

const readShortcutApplyInput = (state: IAppState): IShortcutApplyInput => ({
    ...readAddBucketItemInput(state),
    dateDatasets: getDateDatasetsState(state),
    shortcutDroppedItem: getDroppedCatalogItem(state),
    postponedAction: getPostponedAction(state),
});

const buildShortcutApplyDeps = (state: IAppState): IShortcutApplyDeps => {
    const shortcutDateDatasets = getShortcutDateDatasetsState(state);
    // the mid-flight lookups resolve against the COPIED lists, never the (stale) entry
    // `data.dateDatasets` — see the operation's module note
    const shortcutDateDatasetByRef: DateDatasetByRefResolver = (ref: ObjRef) =>
        DateDatasetsService.getDateDatasetByRefFromItems(
            shortcutDateDatasets.available,
            ref,
            DateDatasetsMetaService.getDateDatasetsMeta(state),
        );
    const activeCalendars = getActiveCalendars(state);

    return {
        ...buildReferencePointSyncDeps(state),
        addToMeasures: buildAddBucketItemDeps(state, MEASURES),
        addToTrendBucket: buildAddBucketItemDeps(
            state,
            getTrendBucketLocalIdentifier(getBucketsState(state)),
        ),
        edit: { ...buildBucketItemEditDeps(state), dateDatasetByRef: shortcutDateDatasetByRef },
        shortcutDateDatasetByRef,
        shortcutDateDatasets,
        useFiscalDefaults: activeCalendars?.fiscal === true && activeCalendars?.default === "FISCAL",
    };
};

/** The shared apply half of the two metric triggers. */
function* applyMetric(item: ICatalogEntry): SagaIterator {
    const input: ReturnType<typeof readShortcutApplyInput> = yield select(readShortcutApplyInput);
    const deps: ReturnType<typeof buildShortcutApplyDeps> = yield select(buildShortcutApplyDeps);

    const result: ReturnType<typeof applyMetricShortcutToBuckets> = yield call(
        applyMetricShortcutToBuckets,
        input,
        item,
        deps,
    );

    yield put(metricShortcutApplied(result));
}

/** The shared apply half of the two metric-over-time triggers. */
function* applyMetricOverTime(item: ICatalogEntry): SagaIterator {
    const input: ReturnType<typeof readShortcutApplyInput> = yield select(readShortcutApplyInput);
    const deps: ReturnType<typeof buildShortcutApplyDeps> = yield select(buildShortcutApplyDeps);

    const result: ReturnType<typeof applyMetricOverTimeShortcutToBuckets> = yield call(
        applyMetricOverTimeShortcutToBuckets,
        input,
        item,
        deps,
    );

    yield put(metricOverTimeShortcutApplied(result));
}

/** The shared postpone half — parks the ready-made replay action and switches the chart type. */
function* postpone(
    parkedAction: Parameters<typeof postponeShortcut>[1],
    clearDroppedItem: boolean,
): SagaIterator {
    const columnVisualizationClass: ReturnType<typeof getLocalVisualizationClass> = yield select(
        getLocalVisualizationClass,
        COLUMN,
    );
    // rule 4: a workspace without a column class — the gesture commits nothing at all
    if (!columnVisualizationClass) {
        return;
    }

    const shortcutDroppedItem: ReturnType<typeof getDroppedCatalogItem> = yield select(getDroppedCatalogItem);

    yield put(
        shortcutPostponed(
            postponeShortcut({ shortcutDroppedItem }, parkedAction, {
                columnVisualizationClass,
                clearDroppedItem,
            }),
        ),
    );
}

function* handleApplyMetricShortcut({ payload }: ReturnType<typeof applyMetricShortcut>): SagaIterator {
    const currentIsColumn: ReturnType<typeof isColumnSelected> = yield select(isColumnSelected);

    if (currentIsColumn) {
        yield call(applyMetric, payload);
        return;
    }

    // postpone adding the item to the buckets, switch to a column chart: the turnover to
    // react-components has to happen first, so the item is parked and applied when the pluggable
    // visualization answers
    yield call(postpone, buildMetricPostponedAction(payload), false);
}

function* handleApplyMetricPostponedShortcut({
    payload,
}: ReturnType<typeof applyMetricPostponedShortcut>): SagaIterator {
    yield call(applyMetric, payload);
}

function* handleApplyMetricOverTimeShortcut({
    payload,
}: ReturnType<typeof applyMetricOverTimeShortcut>): SagaIterator {
    const currentIsColumn: ReturnType<typeof isColumnSelected> = yield select(isColumnSelected);

    if (currentIsColumn) {
        yield call(applyMetricOverTime, payload);
        return;
    }

    // the over-time postpone also clears the dropped item; the plain metric postpone does not
    yield call(postpone, buildMetricOverTimePostponedAction(payload), true);
}

function* handleApplyMetricOverTimePostponedShortcut({
    payload,
}: ReturnType<typeof applyMetricOverTimePostponedShortcut>): SagaIterator {
    yield call(applyMetricOverTime, payload);
}

/**
 * Watches the four shortcut triggers — `SHORTCUT_APPLY_METRIC`, `SHORTCUT_APPLY_METRIC_POSTPONED`,
 * `SHORTCUT_APPLY_METRIC_OVER_TIME` and `SHORTCUT_APPLY_METRIC_OVER_TIME_POSTPONED`. `takeEvery`,
 * because every dispatch applies.
 */
export function* watchShortcutOperations(): SagaIterator {
    yield takeEvery(applyMetricShortcut.type, handleApplyMetricShortcut);
    yield takeEvery(applyMetricPostponedShortcut.type, handleApplyMetricPostponedShortcut);
    yield takeEvery(applyMetricOverTimeShortcut.type, handleApplyMetricOverTimeShortcut);
    yield takeEvery(applyMetricOverTimePostponedShortcut.type, handleApplyMetricOverTimePostponedShortcut);
}
