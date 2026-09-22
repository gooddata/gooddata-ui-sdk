// (C) 2026 GoodData Corporation

// @vitest-environment node

import { type Action } from "@reduxjs/toolkit";
import { batchActions } from "redux-batched-actions";
import { runSaga } from "redux-saga";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IReferencesResult } from "@gooddata/sdk-backend-spi";
import { type FilterContextItem, type IdentifierRef, idRef, serializeObjRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectCatalogFilterParameters } from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import { type DashboardState } from "../../store/types.js";
import { type DashboardContext } from "../../types/commonTypes.js";

import {
    newFilterParameterRootTracker,
    registerFilterParameterDependencies,
} from "./filterParameterDependenciesWorker.js";

const metricRef = idRef("87a053b0-3947-49f3-b0c5-de53fd01f050", "measure");
const metricKey = serializeObjRef(metricRef);
const computedAttributeRef = idRef("shift", "computedAttribute");
const computedAttributeKey = serializeObjRef(computedAttributeRef);
const otherMetricRef = idRef("amount_bop", "measure");

describe("filterParameterDependenciesWorker", () => {
    let Tester: DashboardTester;

    describe("with parameters enabled", () => {
        // captured before preloadedTesterFactory resets the monitors, so it really covers initialization
        let initializationMerges: ReturnType<typeof mergeActions> = [];

        beforeEach(async () => {
            await preloadedTesterFactory(
                function setTester(tester) {
                    Tester = tester;
                    initializationMerges = mergeActions(tester);
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({ settings: { enableParameters: true } }),
                    backendConfig: { useRefType: "id" },
                },
            );
        });

        it("does not merge anything during initialization", () => {
            expect(initializationMerges).toHaveLength(0);
        });

        it("registers the metric of a measure value filter added inside a batched action", async () => {
            Tester.dispatch(
                batchActions([tabsActions.addMeasureValueFilter({ index: 0, measure: metricRef })]),
            );

            await vi.waitFor(() =>
                expect(selectCatalogFilterParameters(Tester.state())).toHaveProperty(metricKey, []),
            );
        });

        it("registers the computed attribute of an attribute filter written outside a batch", async () => {
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: computedAttributeRef,
                    index: 0,
                    localIdentifier: "af-ca",
                }),
            );

            await vi.waitFor(() =>
                expect(selectCatalogFilterParameters(Tester.state())).toHaveProperty(
                    computedAttributeKey,
                    [],
                ),
            );
        });

        it("does not load anything for a filter on a plain label", async () => {
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: idRef("label.f_owner.region_id", "displayForm"),
                    index: 0,
                    localIdentifier: "af-plain",
                }),
            );

            await Tester.wait(50);
            expect(mergeActions(Tester)).toHaveLength(0);
        });

        it("loads a root once even when several filters read it", async () => {
            Tester.dispatch(
                batchActions([
                    tabsActions.addMeasureValueFilter({ index: 0, measure: metricRef }),
                    tabsActions.addMeasureValueFilter({
                        index: 1,
                        measure: metricRef,
                        localIdentifier: "mvf-2",
                    }),
                ]),
            );

            await vi.waitFor(() => expect(mergeActions(Tester)).toHaveLength(1));
            expect(Object.keys(mergeActions(Tester)[0].payload)).toEqual([metricKey]);
        });
    });

    describe("failures and concurrency (saga run directly)", () => {
        const otherMetricKey = serializeObjRef(otherMetricRef);
        const mvf = (measure: IdentifierRef, localIdentifier: string): FilterContextItem => ({
            dashboardMeasureValueFilter: { measure, localIdentifier },
        });

        function makeHarness(getReferencesImpl: (roots: IdentifierRef[]) => Promise<IReferencesResult>) {
            const getReferences = vi.fn(getReferencesImpl);
            const ctx = {
                backend: { workspace: () => ({ references: () => ({ getReferences }) }) } as unknown,
                workspace: "ws-1",
            } as DashboardContext;
            const byRef: Record<string, IdentifierRef[]> = {};
            const filters: FilterContextItem[] = [];
            const dispatched: Action[] = [];
            const state = {
                catalog: { filterParameters: { status: "loaded", byRef } },
                tabs: {
                    tabs: [
                        { localIdentifier: "tab-1", filterContext: { filterContextDefinition: { filters } } },
                    ],
                    activeTabLocalIdentifier: "tab-1",
                },
            } as unknown as DashboardState;
            const tracker = newFilterParameterRootTracker();
            const run = () =>
                runSaga(
                    {
                        dispatch: (action: Action) => {
                            dispatched.push(action);
                            if (catalogActions.mergeCatalogFilterParameters.match(action)) {
                                Object.assign(byRef, action.payload);
                            }
                        },
                        getState: () => state,
                    },
                    registerFilterParameterDependencies,
                    ctx,
                    tracker,
                ).toPromise();
            return { getReferences, byRef, filters, dispatched, run, tracker };
        }

        it("leaves the map untouched when the graph rejects a root and does not request it again", async () => {
            const h = makeHarness(() => Promise.reject(new Error("forbidden")));
            h.filters.push(mvf(metricRef, "mvf-1"));

            await h.run();
            expect(h.getReferences).toHaveBeenCalledTimes(1);
            expect(h.byRef).toEqual({});
            expect(h.dispatched).toEqual([]);

            h.filters.push(mvf(metricRef, "mvf-2"));
            await h.run();
            expect(h.getReferences).toHaveBeenCalledTimes(1);
        });

        it("requests a failed root again once the tracker is reset (the map was initialized again)", async () => {
            const h = makeHarness(() => Promise.reject(new Error("transient")));
            h.filters.push(mvf(metricRef, "mvf-1"));

            await h.run();
            h.tracker.reset();
            await h.run();
            expect(h.getReferences).toHaveBeenCalledTimes(2);
        });

        it("discards a completion from before a tracker reset instead of writing into the new map", async () => {
            const resolvers: Array<(value: IReferencesResult) => void> = [];
            const h = makeHarness(() => new Promise((resolve) => resolvers.push(resolve)));
            h.filters.push(mvf(metricRef, "mvf-1"));

            const stale = h.run();
            h.tracker.reset();
            const fresh = h.run();
            expect(h.getReferences).toHaveBeenCalledTimes(2);

            resolvers[0]({ nodes: [], edges: [] });
            await stale;
            expect(h.dispatched).toEqual([]);
            expect(h.tracker.pending.has(metricKey)).toBe(true);

            resolvers[1]({ nodes: [], edges: [] });
            await fresh;
            expect(h.dispatched).toHaveLength(1);
            expect(h.tracker.pending.size).toBe(0);
        });

        it("does not mark a root as failed when its request from before a reset rejects", async () => {
            const h = makeHarness(() => Promise.reject(new Error("stale")));
            h.filters.push(mvf(metricRef, "mvf-1"));

            const stale = h.run();
            h.tracker.reset();
            await stale;
            expect(h.tracker.failed.size).toBe(0);
        });

        it("requests a root once while its first request is still in flight", async () => {
            let resolveLoad: (value: IReferencesResult) => void = () => {};
            const h = makeHarness(() => new Promise((resolve) => (resolveLoad = resolve)));
            h.filters.push(mvf(metricRef, "mvf-1"));

            const first = h.run();
            h.filters.push(mvf(metricRef, "mvf-2"));
            const second = h.run();
            await second;
            expect(h.getReferences).toHaveBeenCalledTimes(1);

            resolveLoad({ nodes: [], edges: [] });
            await first;
            expect(h.byRef).toEqual({ [metricKey]: [] });
        });

        it("still requests a root that a previous in-flight request did not cover", async () => {
            const resolvers: Array<(value: IReferencesResult) => void> = [];
            const h = makeHarness(() => new Promise((resolve) => resolvers.push(resolve)));
            h.filters.push(mvf(metricRef, "mvf-1"));

            const first = h.run();
            h.filters.push(mvf(otherMetricRef, "mvf-other"));
            const second = h.run();
            expect(h.getReferences).toHaveBeenCalledTimes(2);
            expect(h.getReferences.mock.calls[1][0]).toEqual([otherMetricRef]);

            resolvers.forEach((resolve) => resolve({ nodes: [], edges: [] }));
            await Promise.all([first, second]);
            expect(Object.keys(h.byRef).sort()).toEqual([metricKey, otherMetricKey].sort());
        });
    });

    describe("with parameters disabled", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                function setTester(tester) {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                { backendConfig: { useRefType: "id" } },
            );
        });

        it("does not touch the map", async () => {
            Tester.dispatch(tabsActions.addMeasureValueFilter({ index: 0, measure: metricRef }));

            await Tester.wait(50);
            expect(mergeActions(Tester)).toHaveLength(0);
            expect(selectCatalogFilterParameters(Tester.state())).toEqual({});
        });
    });
});

function mergeActions(tester: DashboardTester) {
    return tester.dispatchedActions().filter(catalogActions.mergeCatalogFilterParameters.match);
}
