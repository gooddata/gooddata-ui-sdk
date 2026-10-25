// (C) 2007-2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import {
    stackMeasures,
    stackToPercent,
    storeVisualizationProperties,
    toggleDualAxis,
    visualizationPropertiesInitialized,
    visualizationPropertiesMetaChanged,
} from "../../actions/properties_actions.js";
import { SECONDARY_MEASURES } from "../../constants/bucket.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { dispatchBucketsTrigger } from "../../tests/dispatch_buckets_trigger.test.utils.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import { dualAxisToggled } from "../buckets/buckets_operation_events.js";
import { type IAppState } from "../types.js";

import { setDualAxisControl } from "./properties_helpers.js";
import { getPropertiesMetaState, getVisualizationProperties } from "./properties_selectors.js";
import { propertiesInitialState } from "./properties_state.js";

/**
 * The domain mount driven with the whole root state, the way the root chain calls it (the cases
 * that also write the extended reference point / buckets live in the apply reducer and are
 * covered by reducers/test/properties_characterization.test.ts through the full chain).
 */
describe("store/properties mount", () => {
    const reduce = (state: IAppState, action: UnknownAction) => combinedRootReducer(state, action);

    describe("self-initialization", () => {
        it("seeds the subtree from the slice (the combined root self-initializes it)", () => {
            const result = reduce(initialState, { type: "@@INIT" });

            expect(result.data.visualizationProperties).toEqual({
                controls: {},
                sortItems: [],
            });
            expect(result.data.propertiesMeta).toEqual({});
        });

        it("returns the root by reference when nothing changed", () => {
            const initialized = reduce(initialState, { type: "@@INIT" });

            expect(reduce(initialized, { type: "SOME_OTHER_ACTION" })).toBe(initialized);
        });
    });

    // Driven through the REAL saga: the trigger writes nothing by itself — the
    // visualizationPropertiesChanged operation computes the strip/guard and the slice consumes
    // its event, so these specs run trigger → saga → event → mount.
    describe("STORE_VIS_PROPERTIES_CHANGED", () => {
        it("stores the merged properties without totals and bucketType", () => {
            const properties = {
                controls: { foo: "bar" },
                totals: [{ type: "sum" }],
                bucketType: "attribute",
            };

            const result = dispatchBucketsTrigger(
                initialState,
                storeVisualizationProperties(properties, properties),
            );

            expect(getVisualizationProperties(result)).toEqual({ controls: { foo: "bar" } });
        });

        it("keeps the stored properties when the action carries none", () => {
            const seeded = withData(initialState, { visualizationProperties: { zoo: "ostrich" } });

            const result = dispatchBucketsTrigger(seeded, storeVisualizationProperties(undefined, undefined));

            // by reference: the slice returned the same value, so the mount did not touch the root
            // (the meta mount still self-initializes on this dispatch, so the ROOT does change)
            expect(result.data.visualizationProperties).toBe(seeded.data.visualizationProperties);
        });

        it("keeps the stored properties BY REFERENCE when the merged value is identical", () => {
            // identity is re-established explicitly, never inherited: the case guards with
            // isEqual, so an equal re-dispatch cannot dirty the subtree (the 4.7 freeze class)
            const properties = { controls: { foo: "bar" } };
            const first = dispatchBucketsTrigger(
                initialState,
                storeVisualizationProperties(properties, properties),
            );

            const again = dispatchBucketsTrigger(
                first,
                storeVisualizationProperties({ controls: { foo: "bar" } }, { controls: { foo: "bar" } }),
            );

            expect(again.data.visualizationProperties).toBe(first.data.visualizationProperties);
        });
    });

    describe("VIS_PROPERTIES_INITIALIZED", () => {
        it("deep-merges controls and replaces every other key", () => {
            const seeded = withData(initialState, {
                visualizationProperties: {
                    controls: { zoo: "ostrich" },
                    another: "property",
                },
            });

            const result = reduce(
                seeded,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { mammal: "elephant" }, another: "replaced" },
                }),
            );

            expect(getVisualizationProperties(result)).toEqual({
                controls: { zoo: "ostrich", mammal: "elephant" },
                another: "replaced",
            });
        });

        it("merges into the slice's own initial state when the subtree is absent", () => {
            const result = reduce(
                initialState,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { mammal: "elephant" } },
                }),
            );

            expect(getVisualizationProperties(result)).toEqual({
                controls: { mammal: "elephant" },
                sortItems: [],
            });
        });
    });

    describe("optional stacking", () => {
        // initialize the mount first, the way production always sees it: the slice materializes
        // its own initial value before any leaf write reaches the subtree
        const withScale = withData(reduce(initialState, { type: "@@INIT" }), {
            visualizationProperties: {
                ...reduce(initialState, { type: "@@INIT" }).data.visualizationProperties,
                controls: {
                    xaxis: { min: 0, max: 1 },
                    secondary_yaxis: { rotation: "30", min: 10, max: 20 },
                },
            },
        });

        it.each([[true], [false]])("sets stackMeasures to %s and clears the scale", (value: boolean) => {
            const result = reduce(withScale, stackMeasures(value));

            expect(result.data.visualizationProperties.controls).toEqual({
                xaxis: {},
                secondary_yaxis: { rotation: "30" },
                stackMeasures: value,
            });
        });

        it("removes stackMeasuresToPercent when unstacking", () => {
            const stacked = reduce(initialState, stackToPercent(true));

            const result = reduce(stacked, stackMeasures(false));

            expect(result.data.visualizationProperties.controls["stackMeasures"]).toBe(false);
            expect(result.data.visualizationProperties.controls["stackMeasuresToPercent"]).toBeUndefined();
        });

        it("stacking to percent implies stacking measures", () => {
            const result = reduce(initialState, stackToPercent(true));

            expect(result.data.visualizationProperties.controls["stackMeasures"]).toBe(true);
            expect(result.data.visualizationProperties.controls["stackMeasuresToPercent"]).toBe(true);
        });

        it("does not touch the state when the toggle is already stored (identity)", () => {
            const stacked = reduce(initialState, stackMeasures(true));

            const again = reduce(stacked, stackMeasures(true));

            expect(again.data.visualizationProperties).toBe(stacked.data.visualizationProperties);
        });
    });

    describe("BUCKET_TOGGLE_DUAL_AXIS", () => {
        /**
         * The TRIGGER writes nothing here — dual axis decides the `dualAxis` control AND
         * every item's `showOnSecondaryAxis`, so it is one buckets operation committing one event, and
         * this slice consumes that event. The RULE is still this domain's
         * (`properties_helpers#setDualAxisControl`); what moved is who calls it.
         *
         * The whole gesture, trigger included, is characterized in
         * `reducers/test/properties_characterization.test.ts`.
         */
        it.each([[true], [false]])("sets controls.dualAxis to %s from the event", (value: boolean) => {
            const properties = setDualAxisControl(getVisualizationProperties(initialState), value);

            const result = reduce(
                initialState,
                dualAxisToggled({
                    buckets: [],
                    visualizationProperties: properties,
                    referencePoint: undefined,
                    isVisualizationMdObjectValid: false,
                }),
            );

            expect(getVisualizationProperties(result).controls?.["dualAxis"]).toBe(value);
        });

        it("ignores the trigger: the operation owns the whole gesture", () => {
            const result = reduce(initialState, toggleDualAxis(SECONDARY_MEASURES, true));

            expect(result.data.visualizationProperties).toBe(initialState.data.visualizationProperties);
        });
    });

    describe("VIS_PROPERTIES_META_CHANGED", () => {
        it("shallow-merges into the subtree", () => {
            const result = reduce(
                initialState,
                visualizationPropertiesMetaChanged({ stackToPercentDisabledByNegativeValues: true }),
            );

            const meta = getPropertiesMetaState(result);
            expect(meta).toEqual({ stackToPercentDisabledByNegativeValues: true });
        });

        it("keeps the keys the payload does not mention", () => {
            const first = reduce(initialState, visualizationPropertiesMetaChanged({ undoApplied: true }));

            const result = reduce(
                first,
                visualizationPropertiesMetaChanged({ isFilteringRecommended: true }),
            );

            expect(getPropertiesMetaState(result)).toEqual({
                undoApplied: true,
                isFilteringRecommended: true,
            });
        });

        it("does not touch the state when every pushed value is already stored", () => {
            const first = reduce(initialState, visualizationPropertiesMetaChanged({ undoApplied: true }));

            const result = reduce(first, visualizationPropertiesMetaChanged({ undoApplied: true }));

            expect(result).toBe(first);
        });
    });

    describe("selectors on the pristine state", () => {
        it("fall back to the slice initial state", () => {
            expect(getVisualizationProperties(initialState)).toBe(propertiesInitialState);
            expect(getPropertiesMetaState(initialState)).toEqual({});
        });
    });
});
