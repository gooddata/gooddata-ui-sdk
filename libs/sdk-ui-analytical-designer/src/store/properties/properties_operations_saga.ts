// (C) 2026 GoodData Corporation

import { defineMessage } from "react-intl";
import { type SagaIterator } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";

import { showWarningMessage } from "../../actions/messages_actions.js";
import {
    type IStoreVisualizationPropertiesAction,
    logVisPropertiesTooLong,
    storeVisualizationProperties,
} from "../../actions/properties_actions.js";
import { disableRedo, undo } from "../../actions/time_travel_actions.js";
import { convertFiltersToRefPoint } from "../../services/reference_point_service.js";
import { readBucketsMeta, readIsVisualizationMdObjectValid } from "../buckets/buckets_operation_inputs.js";
import { getBucketsState } from "../buckets/buckets_selectors.js";
import { getFilterBarState } from "../filter_bar/filter_bar_selector.js";
import {
    getExtendedReferencePoint,
    getReferencePoint,
} from "../reference_point/reference_point_selectors.js";
import { type IAppState } from "../types.js";

import {
    type IVisualizationPropertiesChangeDeps,
    type IVisualizationPropertiesChangeInput,
    applyVisualizationProperties,
} from "./properties_operation.js";
import { visualizationPropertiesChanged } from "./properties_operation_events.js";
import { getVisualizationProperties } from "./properties_selectors.js";

/**
 * THE PROPERTIES OPERATION SAGA — same four-step shape and same four rules as
 * `buckets_operations_saga.ts`: select the typed input, select the deps, call the pure operation,
 * put ONE semantic event. The trigger writes nothing; `takeEvery`, because every dispatch applies.
 */

const PROPERTIES_MAX_LENGTH = 65535;

/**
 * The five domain values the properties-change operation reads — the buckets (for the totals
 * rider), the stored properties, the extended reference point, the reference point and the
 * md-object flag. Exported for the saga tests that pin the operation against real state.
 */
export const readVisualizationPropertiesChangeInput = (
    state: IAppState,
): IVisualizationPropertiesChangeInput => ({
    buckets: getBucketsState(state),
    visualizationProperties: getVisualizationProperties(state),
    extendedReferencePoint: getExtendedReferencePoint(state),
    referencePoint: getReferencePoint(state),
    isVisualizationMdObjectValid: readIsVisualizationMdObjectValid(state),
});

/** The operation's one foreign fact: the reference-point filters bucket, converted once. */
export const buildVisualizationPropertiesChangeDeps = (
    state: IAppState,
): IVisualizationPropertiesChangeDeps => ({
    // as a VALUE: this operation rewrites neither source, and the sort items deliberately do NOT
    // come from here — the sync must see the ones the push itself stores (properties_operation.ts)
    refPointFilters: convertFiltersToRefPoint(getFilterBarState(state).items, readBucketsMeta(state)),
});

function* handleStoreVisualizationProperties({ payload }: IStoreVisualizationPropertiesAction): SagaIterator {
    const input: ReturnType<typeof readVisualizationPropertiesChangeInput> = yield select(
        readVisualizationPropertiesChangeInput,
    );
    const deps: ReturnType<typeof buildVisualizationPropertiesChangeDeps> = yield select(
        buildVisualizationPropertiesChangeDeps,
    );

    yield put(visualizationPropertiesChanged(applyVisualizationProperties(input, payload, deps)));

    // THE TOO-LONG TAIL LIVES HERE, not in sagas/properties_sagas.ts, and that placement is
    // load-bearing: the trigger writes nothing, so an `undo()` put from the UI handler would run
    // BEFORE this handler's event and the commit above would land ON TOP of the restored state,
    // silently redoing the change. Ordered after the event in the SAME handler, the sequence is
    // structural: store first ("to keep in sync the ag-grid inner widths with PivotTable props"),
    // then revert.
    if (payload.newCurrentProperties) {
        const propertiesString = JSON.stringify(payload.newCurrentProperties);
        if (propertiesString.length > PROPERTIES_MAX_LENGTH) {
            yield put(showWarningMessage(defineMessage({ id: "messages.propertiesTooLong" }).id));
            yield put(logVisPropertiesTooLong(propertiesString.length));
            yield put(undo());
            yield put(disableRedo());
        }
    }
}

export function* watchPropertiesOperations(): SagaIterator {
    yield takeEvery(storeVisualizationProperties.type, handleStoreVisualizationProperties);
}
