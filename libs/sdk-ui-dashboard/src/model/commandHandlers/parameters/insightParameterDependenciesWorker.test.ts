// (C) 2026 GoodData Corporation

// @vitest-environment node

import { batchActions } from "redux-batched-actions";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsight, idRef, serializeObjRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { selectCatalogInsightParameters } from "../../store/catalog/catalogSelectors.js";
import { catalogActions } from "../../store/catalog/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsights } from "../../store/insights/insightsSelectors.js";
import { PivotTableWithRowAndColumnAttributes } from "../../tests/Insights.test.helpers.js";

const addedInsightRef = idRef("added-insight", "insight");
const addedInsightKey = serializeObjRef(addedInsightRef);
const addedInsight: IInsight = {
    insight: { ...PivotTableWithRowAndColumnAttributes.insight, ref: addedInsightRef },
};

describe("insightParameterDependenciesWorker", () => {
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
                expect(selectCatalogInsightParameters(Tester.state())).toHaveProperty(addedInsightKey, []),
            );
        });

        it("registers the dependencies of an insight upserted outside a batch", async () => {
            Tester.dispatch(insightsActions.upsertInsight(addedInsight));

            await vi.waitFor(() =>
                expect(selectCatalogInsightParameters(Tester.state())).toHaveProperty(addedInsightKey, []),
            );
        });

        it("replaces the dependencies of an insight that is already in the map on upsert", async () => {
            Tester.dispatch(
                catalogActions.mergeCatalogInsightParameters({
                    [addedInsightKey]: [idRef("old", "parameter")],
                }),
            );

            Tester.dispatch(insightsActions.upsertInsight(addedInsight));

            await vi.waitFor(() =>
                expect(selectCatalogInsightParameters(Tester.state())).toHaveProperty(addedInsightKey, []),
            );
        });

        it("does not merge anything during initialization", () => {
            expect(mergeActions(Tester)).toHaveLength(0);
        });

        it("registers only the unknown insights replaced through setInsights", async () => {
            const knownInsights = selectInsights(Tester.state());

            Tester.dispatch(batchActions([insightsActions.setInsights([...knownInsights, addedInsight])]));

            await vi.waitFor(() => expect(mergeActions(Tester)).toHaveLength(1));
            expect(Object.keys(mergeActions(Tester)[0].payload)).toEqual([addedInsightKey]);
            expect(selectCatalogInsightParameters(Tester.state())).toHaveProperty(addedInsightKey, []);
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

            expect(selectCatalogInsightParameters(Tester.state())).not.toHaveProperty(addedInsightKey);
            expect(mergeActions(Tester)).toHaveLength(0);
        });
    });
});

function mergeActions(tester: DashboardTester) {
    return tester.dispatchedActions().filter(catalogActions.mergeCatalogInsightParameters.match);
}
