// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboardParameter,
    type IDrillToCustomUrl,
    type ObjRef,
    idRef,
    localIdRef,
} from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
    drillToAttributeUrlWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { addDrillTargets } from "../../commands/drillTargets.js";
import { changeRenderMode } from "../../commands/renderMode.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectInvalidUrlDrillParameterWidgetRefs } from "../../store/ui/uiSelectors.js";

describe("parameter placeholders in custom URL drill validation", () => {
    const topNParameter: IDashboardParameter = {
        ref: idRef("topN", "parameter"),
        parameterType: "NUMBER",
        mode: "active",
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

    it("marks the widget when its parameter is removed from the dashboard", async () => {
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");

        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));

        await vi.waitFor(() =>
            expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([
                SimpleSortedTableWidgetRef,
            ]),
        );
    });

    it("clears the mark when the missing parameter is added to the dashboard", async () => {
        Tester.dispatch(tabsActions.removeParameter({ ref: topNParameter.ref }));
        await loadDrillInEditMode("https://example.com/?n={parameter(topN)}");
        expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([SimpleSortedTableWidgetRef]);

        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));

        await vi.waitFor(() => expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([]));
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

        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));

        await vi.waitFor(() =>
            expect(Tester.select(selectInvalidUrlDrillParameterWidgetRefs)).toEqual([
                drillToAttributeUrlWidgetRef,
            ]),
        );
    });

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
