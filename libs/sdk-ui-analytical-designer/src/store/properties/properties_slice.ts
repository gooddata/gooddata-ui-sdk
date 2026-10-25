// (C) 2026 GoodData Corporation

import { createSlice, current } from "@reduxjs/toolkit";
import { isEqual } from "lodash-es";
import { type Reducer } from "redux";

import { Axis } from "@gooddata/sdk-ui-ext/internal";

import { openReportFinished } from "../../actions/open_actions.js";
import {
    stackMeasures,
    stackToPercent,
    visualizationPropertiesInitialized,
} from "../../actions/properties_actions.js";
import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";
import { dualAxisToggled, extendedReferencePointApplied } from "../buckets/buckets_operation_events.js";

import { getMergedProperties } from "./properties_helpers.js";
import { visualizationPropertiesChanged } from "./properties_operation_events.js";
import { type IPropertiesState, propertiesInitialState } from "./properties_state.js";

const STACK_MEASURES = "stackMeasures";
const STACK_MEASURES_TO_PERCENT = "stackMeasuresToPercent";

const setControl = (properties: IPropertiesState, control: string, value: unknown): IPropertiesState => ({
    ...properties,
    controls: { ...properties.controls, [control]: value },
});

const deleteControl = (properties: IPropertiesState, control: string): IPropertiesState => {
    if (!properties.controls || !(control in properties.controls)) {
        return properties;
    }
    const { [control]: _dropped, ...controls } = properties.controls;
    return { ...properties, controls };
};

// Min/max are per-axis user overrides of the scale; stacking changes what the scale means, so they
// are dropped on every optional-stacking change.
function clearScale(properties: IPropertiesState): IPropertiesState {
    const controls = properties.controls;
    if (!controls) {
        return properties;
    }
    const nextControls: NonNullable<IPropertiesState["controls"]> = { ...controls };
    for (const axis of Object.values(Axis.AXIS_NAME)) {
        const axisControls = nextControls[axis];
        if (axisControls && typeof axisControls === "object" && !Array.isArray(axisControls)) {
            const { min: _min, max: _max, ...rest } = axisControls;
            nextControls[axis] = rest;
        }
    }
    return { ...properties, controls: nextControls };
}

const propertiesSlice = createSlice({
    name: "properties",
    initialState: propertiesInitialState,
    reducers: {},
    extraReducers: (builder) => {
        // Every case COMPUTES the next value and returns it through an explicit
        // `isEqual(current(state), next)` guard — identity is re-established explicitly, never
        // inherited. `current()` because the comparison must not run over the immer draft proxy.
        const guarded = (state: IPropertiesState, next: IPropertiesState): IPropertiesState =>
            isEqual(current(state), next) ? state : next;

        builder
            /**
             * A pluggable visualization's properties push is the `visualizationPropertiesChanged`
             * OPERATION: the trigger (`STORE_VIS_PROPERTIES_CHANGED`) writes nothing, the operation
             * strips the buckets-bound `totals`/`bucketType` riders, applies the isEqual guard and
             * names the result — so one gesture is one store write, like the dual-axis case below.
             */
            .addCase(
                visualizationPropertiesChanged,
                (_state, action): IPropertiesState => action.payload.visualizationProperties,
            )
            .addCase(visualizationPropertiesInitialized, (state, action): IPropertiesState => {
                const { supportedProperties } = action.payload;
                return guarded(state, getMergedProperties(current(state), supportedProperties));
            })
            .addCase(stackMeasures, (state, action): IPropertiesState => {
                const { value } = action.payload;
                const cleared = clearScale(current(state));

                const next = value
                    ? setControl(cleared, STACK_MEASURES, value)
                    : setControl(deleteControl(cleared, STACK_MEASURES_TO_PERCENT), STACK_MEASURES, false);
                return guarded(state, next);
            })
            .addCase(stackToPercent, (state, action): IPropertiesState => {
                const { value } = action.payload;
                const base = current(state);
                // stacking to percent implies stacking; unstacking does not unstack measures
                const stacked = value ? setControl(base, STACK_MEASURES, value) : base;

                return guarded(state, setControl(clearScale(stacked), STACK_MEASURES_TO_PERCENT, value));
            })
            /**
             * DUAL AXIS moved to the buckets family's `dualAxisToggled` event. The trigger
             * `BUCKET_TOGGLE_DUAL_AXIS` writes NOTHING now: it also flips `showOnSecondaryAxis` on the
             * bucket's items, and the two halves have to land together or the control is on while the
             * items are not yet flagged. The RULE is still this domain's
             * (`properties_helpers#setDualAxisControl`) — the operation composes it and names the result.
             */
            .addCase(
                dualAxisToggled,
                (_state, action): IPropertiesState => action.payload.visualizationProperties,
            )
            /**
             * A pluggable visualization's answer carries sort items, and AD mirrors them here.
             *
             * The operation resolves the value: the answer's own sort items when it has them,
             * otherwise the ones already stored — so `sortItems` is written unconditionally and the
             * `guarded` comparison is what keeps an unchanged answer from dirtying the subtree.
             */
            .addCase(extendedReferencePointApplied, (state, action): IPropertiesState => {
                return guarded(state, { ...current(state), sortItems: action.payload.sortItems });
            })
            // opening a report lands the insight's normalized properties — the same
            // value the reference point and the ERP mirror (open_report_operation.ts)
            .addCase(
                openReportFinished,
                (_state, action): IPropertiesState => action.payload.result.visualizationProperties,
            )
            // the application resets (store/app_context/application_reset_events.ts)
            .addMatcher(isInsightContentResetEvent, (): IPropertiesState => propertiesInitialState);
    },
});

export const propertiesSliceReducer: Reducer<IPropertiesState> = propertiesSlice.reducer;
