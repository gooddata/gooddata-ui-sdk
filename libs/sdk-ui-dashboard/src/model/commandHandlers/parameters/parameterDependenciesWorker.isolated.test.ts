// (C) 2026 GoodData Corporation

// @vitest-environment node

import { BATCH, batchActions } from "redux-batched-actions";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsight, type IdentifierRef, idRef, serializeObjRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import {
    selectCatalogParameterDependencies,
    selectCatalogRequestedParameterRoots,
} from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsights } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { PivotTableWithRowAndColumnAttributes } from "../../tests/Insights.test.helpers.js";

import { insightRoots, loadParameterDependencies } from "./loadParameterDependencies.js";
import { requestParameterDependencies } from "./parameterDependenciesWorker.js";

// The recorded backend always resolves its references call, so controlled outcomes are injected here.
vi.mock("./loadParameterDependencies.js", { spy: true });

const metricRef = idRef("some-metric", "measure");
const metricKey = serializeObjRef(metricRef);
const otherMetricRef = idRef("other-metric", "measure");
const otherMetricKey = serializeObjRef(otherMetricRef);
const addedInsightRef = idRef("added-insight", "insight");
const addedInsightKey = serializeObjRef(addedInsightRef);
const addedInsight: IInsight = {
    insight: { ...PivotTableWithRowAndColumnAttributes.insight, ref: addedInsightRef },
};
type LoadedParameterDependencies = Awaited<ReturnType<typeof loadParameterDependencies>>;

describe("parameterDependenciesWorker", () => {
    let Tester: DashboardTester;

    describe("with parameters enabled", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                function setTester(tester) {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({ settings: { enableParameters: true } }),
                    backendConfig: { useRefType: "id" },
                },
            );
        });

        it("registers the dependencies of insights added inside a batched action", async () => {
            Tester.dispatch(batchActions([insightsActions.addInsights([addedInsight])]));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(
                    addedInsightKey,
                    [],
                ),
            );
        });

        it("registers the dependencies of an insight upserted outside a batch", async () => {
            Tester.dispatch(insightsActions.upsertInsight(addedInsight));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(
                    addedInsightKey,
                    [],
                ),
            );
        });

        it("replaces the dependencies of an insight that is already in the map on upsert", async () => {
            Tester.dispatch(
                catalogActions.mergeCatalogParameterDependencies({
                    [addedInsightKey]: [idRef("old", "parameter")],
                }),
            );

            Tester.dispatch(insightsActions.upsertInsight(addedInsight));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(
                    addedInsightKey,
                    [],
                ),
            );
        });

        it("does not merge anything during initialization", () => {
            expect(mergeActions(Tester)).toHaveLength(0);
        });

        it("does not retry failed insight roots from an initialization batch", async () => {
            const knownInsights = selectInsights(Tester.state());
            const failedInsightRoots = Object.fromEntries(
                insightRoots(knownInsights).map((root) => [serializeObjRef(root), "failed" as const]),
            );
            const callsBeforeReset = vi.mocked(loadParameterDependencies).mock.calls.length;

            Tester.dispatch(
                batchActions([
                    catalogActions.setCatalogParameterDependencies({
                        status: "loaded",
                        byRoot: {},
                        requestedRoots: failedInsightRoots,
                    }),
                    insightsActions.setInsights(knownInsights),
                ]),
            );
            await Tester.wait(50);

            expect(vi.mocked(loadParameterDependencies).mock.calls).toHaveLength(callsBeforeReset);
        });

        it("registers only the unknown insights replaced through setInsights", async () => {
            const knownInsights = selectInsights(Tester.state());

            Tester.dispatch(batchActions([insightsActions.setInsights([...knownInsights, addedInsight])]));

            await vi.waitFor(() => expect(mergeActions(Tester)).toHaveLength(1));
            expect(Object.keys(mergeActions(Tester)[0].payload)).toEqual([addedInsightKey]);
            expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(addedInsightKey, []);
        });

        it("loads the roots a text asks for", async () => {
            Tester.dispatch(requestParameterDependencies([metricRef]));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []),
            );
        });

        it("loads the metric root of a measure value filter", async () => {
            Tester.dispatch(tabsActions.addMeasureValueFilter({ index: 0, measure: metricRef }));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []),
            );
        });

        it("shares one pending request between text and filter roots", async () => {
            let finishRequest: (value: LoadedParameterDependencies) => void = () => {};
            vi.mocked(loadParameterDependencies).mockReturnValueOnce(
                new Promise((resolve) => {
                    finishRequest = resolve;
                }),
            );
            const callsBeforeRequest = vi.mocked(loadParameterDependencies).mock.calls.length;

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "pending",
                ),
            );
            Tester.dispatch(tabsActions.addMeasureValueFilter({ index: 0, measure: metricRef }));
            await Tester.wait(50);

            expect(vi.mocked(loadParameterDependencies).mock.calls).toHaveLength(callsBeforeRequest + 1);
            finishRequest({ byRoot: { [metricKey]: [] }, failedRoots: [] });
            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []),
            );
        });

        it("asks once when two texts request the same root", async () => {
            Tester.dispatch(requestParameterDependencies([metricRef]));
            Tester.dispatch(requestParameterDependencies([metricRef]));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []),
            );
            await Tester.wait(50);
            expect(mergeActions(Tester)).toHaveLength(1);
        });

        it("marks a root whose load failed and never asks for it again", async () => {
            vi.mocked(loadParameterDependencies).mockResolvedValueOnce({
                byRoot: {},
                failedRoots: [metricRef],
            });

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "failed",
                ),
            );

            const callsAfterFailure = vi.mocked(loadParameterDependencies).mock.calls.length;
            Tester.dispatch(requestParameterDependencies([metricRef]));
            await Tester.wait(50);

            expect(selectCatalogParameterDependencies(Tester.state())).not.toHaveProperty(metricKey);
            expect(vi.mocked(loadParameterDependencies).mock.calls).toHaveLength(callsAfterFailure);
        });

        it("loads an unrelated root after another root failed", async () => {
            vi.mocked(loadParameterDependencies).mockResolvedValueOnce({
                byRoot: {},
                failedRoots: [metricRef],
            });

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "failed",
                ),
            );
            Tester.dispatch(requestParameterDependencies([otherMetricRef]));

            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(otherMetricKey, []),
            );
        });

        it("applies successful and failed roots from one request", async () => {
            vi.mocked(loadParameterDependencies).mockResolvedValueOnce({
                byRoot: { [metricKey]: [] },
                failedRoots: [otherMetricRef],
            });

            Tester.dispatch(requestParameterDependencies([metricRef, otherMetricRef]));

            await vi.waitFor(() => {
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []);
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    otherMetricKey,
                    "failed",
                );
            });
        });

        it("marks a root pending until its request is merged", async () => {
            let finishRequest: (byRoot: Record<string, IdentifierRef[]>) => void = () => {};
            vi.mocked(loadParameterDependencies).mockReturnValueOnce(
                new Promise((resolve) => {
                    finishRequest = (byRoot) => resolve({ byRoot, failedRoots: [] });
                }),
            );

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "pending",
                ),
            );

            finishRequest({ [metricKey]: [] });
            await vi.waitFor(() =>
                expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, []),
            );
            expect(selectCatalogRequestedParameterRoots(Tester.state())).not.toHaveProperty(metricKey);
        });

        it("discards a successful response from before a batched map reset", async () => {
            let finishRequest: (value: LoadedParameterDependencies) => void = () => {};
            vi.mocked(loadParameterDependencies).mockReturnValueOnce(
                new Promise((resolve) => {
                    finishRequest = resolve;
                }),
            );

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "pending",
                ),
            );
            Tester.dispatch(
                batchActions([
                    catalogActions.setCatalogParameterDependencies({
                        status: "loaded",
                        byRoot: { [addedInsightKey]: [] },
                        requestedRoots: {},
                    }),
                ]),
            );
            finishRequest({ byRoot: { [metricKey]: [] }, failedRoots: [] });
            await Tester.wait(50);

            expect(selectCatalogParameterDependencies(Tester.state())).toEqual({ [addedInsightKey]: [] });
            expect(selectCatalogRequestedParameterRoots(Tester.state())).toEqual({});
        });

        it("discards a failed response from before a batched map reset", async () => {
            let finishRequest: (value: LoadedParameterDependencies) => void = () => {};
            vi.mocked(loadParameterDependencies).mockReturnValueOnce(
                new Promise((resolve) => {
                    finishRequest = resolve;
                }),
            );

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "pending",
                ),
            );
            Tester.dispatch(
                batchActions([
                    catalogActions.setCatalogParameterDependencies({
                        status: "loaded",
                        byRoot: {},
                        requestedRoots: {},
                    }),
                ]),
            );
            finishRequest({ byRoot: {}, failedRoots: [metricRef] });
            await Tester.wait(50);

            expect(selectCatalogParameterDependencies(Tester.state())).toEqual({});
            expect(selectCatalogRequestedParameterRoots(Tester.state())).toEqual({});
        });

        it("ignores a root the map already holds", async () => {
            Tester.dispatch(
                catalogActions.mergeCatalogParameterDependencies({
                    [metricKey]: [idRef("topN", "parameter")],
                }),
            );

            Tester.dispatch(requestParameterDependencies([metricRef]));
            await Tester.wait(50);

            expect(mergeActions(Tester)).toHaveLength(1);
            expect(selectCatalogParameterDependencies(Tester.state())).toHaveProperty(metricKey, [
                idRef("topN", "parameter"),
            ]);
        });

        it("does not merge anything when setInsights carries only known insights", async () => {
            Tester.dispatch(batchActions([insightsActions.setInsights(selectInsights(Tester.state()))]));
            await Tester.wait(50);

            expect(mergeActions(Tester)).toHaveLength(0);
        });
    });

    describe("with parameters disabled", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                function setTester(tester) {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({ settings: { enableParameters: false } }),
                    backendConfig: { useRefType: "id" },
                },
            );
        });

        it("does not register anything while the dependency map is not loaded", async () => {
            Tester.dispatch(insightsActions.upsertInsight(addedInsight));
            await Tester.wait(50);

            expect(selectCatalogParameterDependencies(Tester.state())).not.toHaveProperty(addedInsightKey);
            expect(mergeActions(Tester)).toHaveLength(0);
        });

        it("marks a requested root failed, so the text that waits for it stops waiting", async () => {
            Tester.dispatch(requestParameterDependencies([metricRef]));
            await vi.waitFor(() =>
                expect(selectCatalogRequestedParameterRoots(Tester.state())).toHaveProperty(
                    metricKey,
                    "failed",
                ),
            );

            expect(mergeActions(Tester)).toHaveLength(0);
        });
    });
});

function mergeActions(tester: DashboardTester) {
    return tester
        .dispatchedActions()
        .flatMap((action) => (action.type === BATCH ? action.payload : [action]))
        .filter(catalogActions.mergeCatalogParameterDependencies.match);
}
