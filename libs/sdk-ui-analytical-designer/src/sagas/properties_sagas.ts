// (C) 2020-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { call, put, select, takeEvery } from "redux-saga/effects";

import { logBucketTotals } from "../actions/buckets_actions.js";
import {
    type IVisualizationPropertiesChangedAction,
    storeVisualizationProperties,
} from "../actions/properties_actions.js";
import { ActionTypeKeys } from "../constants/actions.js";
import { logAggregationsTotal } from "../services/telemetry/tracking_events.js";
import { getMergedProperties, getReplacedProperties } from "../store/properties/properties_helpers.js";
import { getVisualizationProperties } from "../store/properties/properties_selectors.js";
import { getExtendedReferencePointProperties } from "../store/reference_point/extended_reference_point_selectors.js";
import { type IAppState } from "../store/types.js";
import { areSameVisualizationProperties } from "../utils/visualization_properties.js";

// annotated so declaration emit does not have to name the store action's payload type, whose
// IDefaultControlProperties default sdk-ui-ext does not re-export (TS2742 — see properties_actions)
export function* onPropertiesChanged(action: IVisualizationPropertiesChangedAction): SagaIterator<void> {
    const { properties } = action.payload;
    const state: IAppState = yield select();
    if (properties) {
        const currentMergedProperties = getVisualizationProperties(state);
        const newMergedProperties = getMergedProperties(currentMergedProperties, properties);
        // the `|| {}` stays because the extended reference point is ABSENT until a plug viz
        // reports one
        const currentVisualizationProperties = getExtendedReferencePointProperties(state) || {};
        const newCurrentProperties = getReplacedProperties(currentVisualizationProperties, properties);

        if (!areSameVisualizationProperties(currentVisualizationProperties, newCurrentProperties)) {
            if (properties?.["totals"]) {
                const { totals, bucketType = "attribute", sortItems } = properties;

                // we log only when totals were manually configured, not when they come together
                // with sort items which means they were influenced by changing sorts
                if (!sortItems) {
                    yield put(logBucketTotals(bucketType, totals));
                    yield call(logAggregationsTotal, state, bucketType, totals);
                }
            }
            // store action needs to be put even it is then "reverted" by undo
            // to keep in sync the ag-grid inner widths with PivotTable props.
            // THE TOO-LONG GUARD (warn + undo) MOVED with the trigger's write into
            // store/properties/properties_operations_saga.ts: an undo put from HERE
            // would now run before the operation's event and be silently overwritten by it.
            yield put(storeVisualizationProperties(newCurrentProperties, newMergedProperties));
        }
    } else {
        yield put(storeVisualizationProperties(undefined, undefined));
    }
}

export function* watchProperties() {
    yield takeEvery(ActionTypeKeys.UI_VIS_PROPERTIES_CHANGED, onPropertiesChanged);
}
