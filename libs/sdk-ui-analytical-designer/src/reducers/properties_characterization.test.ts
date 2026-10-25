// (C) 2026 GoodData Corporation

import { type UnknownAction } from "redux";
import { describe, expect, it } from "vitest";

import { type IVisualizationProperties } from "@gooddata/sdk-ui-ext/internal";

import {
    openAsReportToggled,
    stackMeasures,
    stackToPercent,
    storeVisualizationProperties,
    toggleDualAxis,
    visualizationPropertiesChanged as uiVisualizationPropertiesChanged,
    visualizationPropertiesInitialized,
    visualizationPropertiesMetaChanged,
} from "../actions/properties_actions.js";
import { resetForPluggableMount } from "../actions/reset_for_pluggable_mount_actions.js";
import { redo, undo } from "../actions/time_travel_actions.js";
import { SECONDARY_MEASURES } from "../constants/bucket.js";
import { watchProperties } from "../sagas/properties_sagas.js";
import { VisualizationPropertiesSelectors } from "../selectors/visualization_properties_selector.js";
import { insightContentCleared } from "../store/app_context/application_reset_events.js";
import { type IAppState } from "../store/types.js";
import {
    countStoreWrites,
    dispatchBucketsTrigger,
    runBucketsTrigger,
} from "../tests/dispatch_buckets_trigger.test.utils.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type IStoredVisualizationProperties } from "../typings/properties.js";

import { rootReducer } from "./root_reducer.js";

/**
 * Characterization suite for the properties domain: `data.visualizationProperties` and
 * `data.propertiesMeta`, plus the extended-reference-point and bucket-totals writes the same actions
 * carry. Every test drives the FULL root chain (rootReducer), so if an assertion has to be edited,
 * that edit IS a behavior change.
 */
describe("properties characterization", () => {
    const state = getInitializedState();

    const dispatch = (initial: IAppState, ...actions: UnknownAction[]): IAppState =>
        actions.reduce((acc, action) => rootReducer(acc, action), initial);

    const withExtendedReferencePoint = (
        initial: IAppState,
        properties: IStoredVisualizationProperties = {},
    ) => withData(initial, { extendedReferencePoint: { properties } });

    // Driven through the REAL saga: STORE_VIS_PROPERTIES_CHANGED is the
    // visualizationPropertiesChanged operation, so the trigger writes nothing by itself and a bare
    // rootReducer dispatch would pass these specs vacuously.
    describe("STORE_VIS_PROPERTIES_CHANGED", () => {
        it("replaces data.visualizationProperties with the merged properties", () => {
            const merged: IVisualizationProperties = { controls: { foo: "bar" }, sortItems: [] };

            const result = dispatchBucketsTrigger(state, storeVisualizationProperties({}, merged));

            expect(result.data.visualizationProperties).toEqual({
                controls: { foo: "bar" },
                sortItems: [],
            });
        });

        it("strips totals and bucketType from what it stores", () => {
            const properties = {
                controls: { foo: "bar" },
                totals: [{ type: "sum", attributeIdentifier: "a1" }],
                bucketType: "attribute",
            };

            const result = dispatchBucketsTrigger(
                withExtendedReferencePoint(state),
                storeVisualizationProperties(properties, properties),
            );

            expect(result.data.visualizationProperties).toEqual({ controls: { foo: "bar" } });
            expect(result.data.extendedReferencePoint.properties).toEqual({
                controls: { foo: "bar" },
            });
        });

        it("leaves the extended reference point alone while no plug viz has answered (null at rest)", () => {
            const properties = { controls: { foo: "bar" } };

            const result = dispatchBucketsTrigger(
                state,
                storeVisualizationProperties(properties, properties),
            );

            expect(result.data.extendedReferencePoint).toBeNull();
        });

        /**
         * The guard on `state.data.extendedReferencePoint` must be an EXISTENCE check, not an
         * emptiness one: `isEmpty({})` is TRUE and would silently stop the write for an extended
         * reference point that exists and holds nothing. This spec is what proves it.
         */
        it("writes the extended reference point once the subtree exists, even when it is EMPTY", () => {
            const properties = { controls: { foo: "bar" } };
            const emptyExtendedReferencePoint = withData(state, { extendedReferencePoint: {} });

            const result = dispatchBucketsTrigger(
                emptyExtendedReferencePoint,
                storeVisualizationProperties(properties, properties),
            );

            expect(result.data.extendedReferencePoint.properties).toEqual({ controls: { foo: "bar" } });
        });

        it("still leaves it alone when the subtree holds the cleared shape", () => {
            // the resets clear the value, and the guard must treat that as "no plug viz has
            // answered" — the one case `isEmpty` and an explicit `!= null` check agree on
            const properties = { controls: { foo: "bar" } };
            const cleared = withData(state, { extendedReferencePoint: undefined });

            const result = dispatchBucketsTrigger(
                cleared,
                storeVisualizationProperties(properties, properties),
            );

            expect(result.data.extendedReferencePoint).toBeNull();
        });

        it("stores nothing when the merged properties are missing", () => {
            const seeded = withData(state, { visualizationProperties: { zoo: "ostrich" } });

            const result = dispatchBucketsTrigger(seeded, storeVisualizationProperties(undefined, undefined));

            expect(result.data.visualizationProperties).toEqual({ zoo: "ostrich" });
        });

        it("appends the totals of the merged properties to the addressed bucket", () => {
            const totals = [{ type: "sum", attributeIdentifier: "a1" }];
            const withBuckets = withData(state, {
                buckets: [
                    { localIdentifier: "measures", items: [] },
                    { localIdentifier: "attribute", items: [] },
                ],
            });
            const properties = { controls: {}, totals, bucketType: "attribute" };

            const result = dispatchBucketsTrigger(
                withBuckets,
                storeVisualizationProperties(properties, properties),
            );

            expect(result.data.buckets[1].totals).toEqual(totals);
            expect(result.data.buckets[0].totals).toBeUndefined();
        });

        it("one gesture is one store write, totals rider or not (the [P] gate)", () => {
            const withBuckets = withData(withExtendedReferencePoint(state), {
                buckets: [{ localIdentifier: "attribute", items: [] }],
            });
            const totalsRider = {
                controls: { foo: "bar" },
                totals: [{ type: "sum", attributeIdentifier: "a1" }],
                bucketType: "attribute",
            };
            const plainPush = { controls: { foo: "bar" } };

            expect(
                countStoreWrites(withBuckets, storeVisualizationProperties(totalsRider, totalsRider)),
            ).toBe(1);
            expect(countStoreWrites(withBuckets, storeVisualizationProperties(plainPush, plainPush))).toBe(1);
        });

        /**
         * THE PUT-TRIGGER-THEN-UNDO HAZARD. The trigger writes nothing, so an `undo()` put from the
         * UI handler would run BEFORE the operation's event and the commit would land ON TOP of the
         * restored state, silently redoing the change. The undo therefore lives INSIDE the operation
         * handler, and this spec drives the WHOLE chain (UI trigger → merge saga → store trigger →
         * operation → event → undo) to prove the store-first-then-revert order.
         */
        it("stores an over-long push and THEN reverts it — the undo lands after the event", () => {
            const prePush = { controls: { zoo: "ostrich" } };
            const seeded = withData(withExtendedReferencePoint(state), { visualizationProperties: prePush });

            const tooLong = { controls: { foo: "x".repeat(70000) } };
            const { state: result, dispatched } = runBucketsTrigger(
                seeded,
                uiVisualizationPropertiesChanged(tooLong, false),
                [watchProperties],
            );

            const types = dispatched.map((action: { type: string }) => action.type);
            const eventIndex = types.indexOf("STORE/PROPERTIES/VISUALIZATION_PROPERTIES_CHANGED");
            const undoIndex = types.indexOf(undo().type);
            expect(eventIndex).toBeGreaterThan(-1);
            expect(undoIndex).toBeGreaterThan(eventIndex);

            // the UI trigger snapshotted the pre-push state, so the undo restores it — the push
            // was stored (the ag-grid width contract) and then reverted, not the other way round
            expect(result.data.visualizationProperties).toEqual(prePush);
        });

        it("a push under the length cap is stored and NOT reverted", () => {
            const seeded = withExtendedReferencePoint(state);

            const push = { controls: { foo: "bar" } };
            const { state: result, dispatched } = runBucketsTrigger(
                seeded,
                uiVisualizationPropertiesChanged(push, false),
                [watchProperties],
            );

            expect(dispatched.map((action: { type: string }) => action.type)).not.toContain(undo().type);
            // toMatchObject: the merge keeps keys the seeded state already had (sortItems)
            expect(result.data.visualizationProperties).toMatchObject(push);
        });
    });

    describe("VIS_PROPERTIES_INITIALIZED", () => {
        it("deep-merges the supported controls into the stored properties", () => {
            const seeded = withData(state, {
                visualizationProperties: {
                    controls: { zoo: "ostrich" },
                    sortItems: [],
                },
            });

            const result = dispatch(
                seeded,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { mammal: "elephant" } },
                }),
            );

            expect(result.data.visualizationProperties).toEqual({
                controls: { zoo: "ostrich", mammal: "elephant" },
                sortItems: [],
            });
        });

        it("replaces the extended reference point properties with the supported ones", () => {
            const seeded = withExtendedReferencePoint(state, { fish: "tuna" });

            const result = dispatch(
                seeded,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { mammal: "elephant" } },
                }),
            );

            expect(result.data.extendedReferencePoint.properties).toEqual({
                controls: { mammal: "elephant" },
            });
        });

        it("deletes the extended reference point properties when only empty controls are supported", () => {
            const seeded = withExtendedReferencePoint(state, { fish: "tuna" });

            const result = dispatch(
                seeded,
                visualizationPropertiesInitialized({ supportedProperties: { controls: {} } }),
            );

            expect(result.data.extendedReferencePoint.properties).toBeUndefined();
        });

        /**
         * The three `sanitizeProperties` branches. The emptiness test must only fire on a PRESENT
         * AND EMPTY value: `isEmpty(undefined)` is true, so a naive `isEmpty` would drop the key
         * from properties that never had it.
         */
        it("keeps properties that carry no controls key at all", () => {
            const seeded = withExtendedReferencePoint(state, { fish: "tuna" });

            const result = dispatch(
                seeded,
                visualizationPropertiesInitialized({ supportedProperties: { fish: "salmon" } }),
            );

            expect(result.data.extendedReferencePoint.properties).toEqual({ fish: "salmon" });
        });

        it("drops an EMPTY controls bag but keeps the rest of the properties", () => {
            const seeded = withExtendedReferencePoint(state, { fish: "tuna" });

            const result = dispatch(
                seeded,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: {}, fish: "salmon" },
                }),
            );

            expect(result.data.extendedReferencePoint.properties).toEqual({ fish: "salmon" });
        });

        it("creates the extended reference point subtree when there is something to put in it", () => {
            const result = dispatch(
                state,
                visualizationPropertiesInitialized({
                    supportedProperties: { controls: { mammal: "elephant" } },
                }),
            );

            expect(result.data.extendedReferencePoint.properties).toEqual({
                controls: { mammal: "elephant" },
            });
        });
    });

    describe("optional stacking", () => {
        const withScale = () =>
            withData(state, {
                visualizationProperties: {
                    ...state.data.visualizationProperties,
                    controls: {
                        xaxis: { min: 0, max: 1 },
                        yaxis: { min: 0, max: 100 },
                        secondary_xaxis: { min: 10, max: 100 },
                        secondary_yaxis: { rotation: "30", min: 10, max: 20 },
                    },
                },
            });

        it.each([[true], [false]])("clears every axis min/max when stackMeasures is %s", (value) => {
            const result = dispatch(withScale(), stackMeasures(value));

            expect(result.data.visualizationProperties.controls).toEqual({
                xaxis: {},
                yaxis: {},
                secondary_xaxis: {},
                secondary_yaxis: { rotation: "30" },
                stackMeasures: value,
            });
        });

        it("drops stackMeasuresToPercent when measures stop being stacked", () => {
            const stacked = dispatch(state, stackToPercent(true));
            expect(stacked.data.visualizationProperties.controls["stackMeasuresToPercent"]).toBe(true);

            const result = dispatch(stacked, stackMeasures(false));

            expect(result.data.visualizationProperties.controls["stackMeasures"]).toBe(false);
            expect(result.data.visualizationProperties.controls["stackMeasuresToPercent"]).toBeUndefined();
        });

        it.each([[true], [false]])(
            "sets stackMeasuresToPercent to %s and clears the scale",
            (value: boolean) => {
                const result = dispatch(withScale(), stackToPercent(value));

                expect(result.data.visualizationProperties.controls).toEqual({
                    xaxis: {},
                    yaxis: {},
                    secondary_xaxis: {},
                    secondary_yaxis: { rotation: "30" },
                    stackMeasuresToPercent: value,
                    // stacking to percent implies stacking, but unstacking does not unstack measures
                    ...(value ? { stackMeasures: true } : {}),
                });
            },
        );
    });

    describe("BUCKET_TOGGLE_DUAL_AXIS", () => {
        // buckets_reducer handles the same action (it flips showOnSecondaryAxis on the bucket's
        // items) and reads the bucket unguarded, so the addressed bucket has to exist.
        const withSecondaryMeasures = () =>
            withData(state, {
                buckets: [{ localIdentifier: SECONDARY_MEASURES, items: [{ localIdentifier: "m1" }] }],
            });

        it.each([[true], [false]])("sets controls.dualAxis to %s", (value: boolean) => {
            // through the operation saga: dual axis writes the control AND the bucket
            // items' showOnSecondaryAxis, and the two land in ONE event so the control can never be on
            // while the items are not yet flagged
            const result = dispatchBucketsTrigger(
                withSecondaryMeasures(),
                toggleDualAxis(SECONDARY_MEASURES, value),
            );

            expect(result.data.visualizationProperties.controls["dualAxis"]).toBe(value);
        });

        it("flips showOnSecondaryAxis on the bucket's items in the SAME store write", () => {
            const writes = countStoreWrites(
                withSecondaryMeasures(),
                toggleDualAxis(SECONDARY_MEASURES, true),
            );
            const result = dispatchBucketsTrigger(
                withSecondaryMeasures(),
                toggleDualAxis(SECONDARY_MEASURES, true),
            );

            expect(result.data.buckets[0].items[0].showOnSecondaryAxis).toBe(true);
            expect(result.data.visualizationProperties.controls["dualAxis"]).toBe(true);
            expect(writes).toBe(1);
        });
    });

    describe("OPEN_AS_REPORT_TOGGLED", () => {
        it("writes the open-as-report flags into the extended reference point uiConfig", () => {
            const result = dispatch(
                state,
                openAsReportToggled({ supported: true, warningMessage: "too complex" }),
            );

            expect(result.data.extendedReferencePoint.uiConfig.openAsReport.supported).toBe(true);
            expect(result.data.extendedReferencePoint.uiConfig.openAsReport.warningMessage).toBe(
                "too complex",
            );
        });
    });

    describe("VIS_PROPERTIES_META_CHANGED", () => {
        it("shallow-merges the pushed meta and keeps the keys it does not mention", () => {
            const result = dispatch(
                state,
                visualizationPropertiesMetaChanged({ stackToPercentDisabledByNegativeValues: true }),
                visualizationPropertiesMetaChanged({ isFilteringRecommended: true }),
            );

            expect(result.data.propertiesMeta.stackToPercentDisabledByNegativeValues).toBe(true);
            expect(result.data.propertiesMeta.isFilteringRecommended).toBe(true);
        });

        it("is readable through the domain selector", () => {
            const result = dispatch(state, visualizationPropertiesMetaChanged({ undoApplied: true }));

            expect(VisualizationPropertiesSelectors.getPropertiesMeta(result)?.undoApplied).toBe(true);
        });
    });

    describe("propertiesMeta.undoApplied (written by time travel, read by the pluggable vis)", () => {
        it("is set on undo and cleared on redo", () => {
            // The path is load-bearing outside redux: it reaches the SDK's MinMaxControl as
            // insightPropertiesMeta.undoApplied, which is why 4.6 keeps it exactly where it is.
            const changed = dispatch(state, stackMeasures(true));

            const undone = dispatch(changed, undo());
            expect(undone.data.propertiesMeta.undoApplied).toBe(true);

            const redone = dispatch(undone, redo());
            expect(redone.data.propertiesMeta.undoApplied).toBe(false);
        });
    });

    describe("resets", () => {
        it("CLEAR_INSIGHT_CONTENT restores both subtrees to their initial value", () => {
            const dirty = dispatch(
                state,
                storeVisualizationProperties({ controls: { foo: "bar" } }, { controls: { foo: "bar" } }),
                visualizationPropertiesMetaChanged({ undoApplied: true }),
            );

            const result = dispatch(
                dirty,
                // the reset is a semantic EVENT (application_reset_events.ts)
                insightContentCleared({ reset: { sessionId: "fresh" } }),
            );

            expect(result.data.visualizationProperties).toEqual({ controls: {}, sortItems: [] });
            expect(result.data.propertiesMeta.undoApplied).toBeUndefined();
        });

        it("RESET_FOR_PLUGGABLE_MOUNT drops every stored property", () => {
            const dirty = dispatch(
                state,
                storeVisualizationProperties({ controls: { foo: "bar" } }, { controls: { foo: "bar" } }),
                visualizationPropertiesMetaChanged({ undoApplied: true }),
            );

            const result = dispatch(dirty, resetForPluggableMount());

            expect(VisualizationPropertiesSelectors.getProperties(result)).toEqual({
                controls: {},
                sortItems: [],
            });
            expect(result.data.propertiesMeta.undoApplied).toBeUndefined();
        });
    });
});
