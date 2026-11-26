// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardParameter,
    type IDrillToCustomUrl,
    type IInsight,
    type IScalarParameterMetadataObject,
    type ObjRef,
    idRef,
    insightRef,
    isInsightWidget,
    localIdRef,
} from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
    drillToAttributeUrlWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { addDrillTargets } from "../../commands/drillTargets.js";
import { changeInsightWidgetInsight, refreshInsightWidget } from "../../commands/insight.js";
import { undoLayoutChanges } from "../../commands/layout.js";
import { addParameters, removeParameters } from "../../commands/parameters.js";
import { changeRenderMode } from "../../commands/renderMode.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { catalogActions } from "../../store/catalog/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectAnalyticalWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { selectInvalidUrlDrillParameterWidgetRefs } from "../../store/ui/uiSelectors.js";
import { PivotTableWithRowAndColumnAttributes } from "../../tests/Insights.test.helpers.js";

describe("parameter placeholders in custom URL drill validation", () => {
    const topNParameter: IDashboardParameter = {
        ref: idRef("topN", "parameter"),
        parameterType: "NUMBER",
        mode: "active",
    };
    const topNCatalogParameter: IScalarParameterMetadataObject = {
        type: "parameter",
        id: "topN",
        uri: "/topN",
        ref: topNParameter.ref,
        title: "Top N",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 5 },
    };

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory(
            function setTester(tester) {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            { initCommand: initializeDashboard({ settings: { enableParameters: true } }) },
        );
        Tester.dispatch(
            catalogActions.setCatalogParameters({
                status: "loaded",
                dateRangeParametersStatus: "gated-off",
                dateRangeParameters: [],
                parameters: [topNCatalogParameter],
            }),
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
    });

    it("marks the widget when a parameter is not on the dashboard", async () => {
        await loadDrillInEditMode("https://example.com/?n={parameter(unknown)}");

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);
    });

    it("does not mark the widget when the parameter is on the dashboard", async () => {
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);
    });

    it("does not mark the widget when the parameter is saved only on its insight", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        saveTopNOnInsight();

        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);
    });

    it("marks the widget when its parameter is removed from the dashboard", async () => {
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");

        await Tester.dispatchAndWaitFor(
            removeParameters([topNParameter.ref], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.REMOVED",
        );

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);
    });

    it("clears the mark when the missing parameter is added to the dashboard", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);

        await Tester.dispatchAndWaitFor(
            addParameters([topNParameter.ref], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.ADDED",
        );

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);
    });

    it("clears only the repaired widget while another widget stays invalid", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        await loadDrillsInEditMode([
            { ref: SimpleSortedTableWidgetRef, url: "https://example.com/?n={parameter(topN)}" },
            { ref: drillToAttributeUrlWidgetRef, url: "https://example.com/?n={parameter(unknown)}" },
        ]);
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([
            SimpleSortedTableWidgetRef,
            drillToAttributeUrlWidgetRef,
        ]);

        await Tester.dispatchAndWaitFor(
            addParameters([topNParameter.ref], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.ADDED",
        );

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([
            drillToAttributeUrlWidgetRef,
        ]);
    });

    it("clears the mark when the missing parameter is saved on the insight", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);
        const insightsService = Tester.ctx.backend.workspace(Tester.ctx.workspace).insights();
        vi.spyOn(
            Object.getPrototypeOf(insightsService) as typeof insightsService,
            "getInsight",
        ).mockResolvedValueOnce(insightWithSavedTopN());

        await Tester.dispatchAndWaitFor(
            refreshInsightWidget(SimpleSortedTableWidgetRef),
            "GDC.DASH/EVT.INSIGHT_WIDGET.REFRESHED",
        );

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);
    });

    it("clears the mark when the change of the widget insight is undone", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        saveTopNOnInsight();
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);

        await Tester.dispatchAndWaitFor(
            changeInsightWidgetInsight(
                SimpleSortedTableWidgetRef,
                insightRef(PivotTableWithRowAndColumnAttributes),
            ),
            "GDC.DASH/EVT.INSIGHT_WIDGET.INSIGHT_SWITCHED",
        );
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);

        await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");

        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]);
    });

    function activeTab(): string {
        return selectActiveOrDefaultTabLocalIdentifier(Tester.state());
    }

    function saveTopNOnInsight() {
        Tester.dispatch(insightsActions.upsertInsight(insightWithSavedTopN()));
    }

    function insightWithSavedTopN(): IInsight {
        const widget = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());
        const insight = isInsightWidget(widget)
            ? selectInsightByRef(widget.insight)(Tester.state())
            : undefined;
        if (!insight) {
            throw new Error("The widget has no insight.");
        }
        return {
            ...insight,
            insight: { ...insight.insight, parameters: [{ ref: topNParameter.ref, value: 7 }] },
        };
    }

    function loadDrillInEditMode(url: string) {
        return loadDrillsInEditMode([{ ref: SimpleSortedTableWidgetRef, url }]);
    }

    async function loadDrillsInEditMode(drills: { ref: ObjRef; url: string }[]) {
        for (const { ref, url } of drills) {
            const drill: IDrillToCustomUrl = {
                type: "drillToCustomUrl",
                transition: "new-window",
                origin: { type: "drillFromMeasure", measure: localIdRef("m1") },
                target: { url },
                localIdentifier: "url-drill",
            };
            Tester.dispatch(tabsActions.replaceWidgetDrillWithoutUndo({ ref, drillDefinitions: [drill] }));
        }
        await Tester.dispatchAndWaitFor(
            changeRenderMode("edit", { resetDashboard: false }),
            "GDC.DASH/EVT.RENDER_MODE.CHANGED",
        );
        for (const { ref } of drills) {
            await Tester.dispatchAndWaitFor(
                addDrillTargets(ref, {
                    measures: [
                        {
                            measure: {
                                measureHeaderItem: { localIdentifier: "m1", name: "Measure", format: "#" },
                            },
                            attributes: [],
                        },
                    ],
                }),
                "GDC.DASH/EVT.DRILL_TARGETS.ADDED",
            );
        }
    }
});
