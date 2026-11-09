// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import {
    type IDashboardParameter,
    type IDrillToCustomUrl,
    idRef,
    isInsightWidget,
    newDefForItems,
} from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { type IDashboardDrillEvent } from "../../../types.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { drillToCustomUrl } from "../../commands/drill.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { isDashboardDrillToCustomUrlResolved } from "../../events/drill.js";
import { isDashboardCommandFailed } from "../../events/general.js";
import { catalogActions } from "../../store/catalog/index.js";
import { selectConfig } from "../../store/config/configSelectors.js";
import { configActions } from "../../store/config/index.js";
import { insightsActions } from "../../store/insights/index.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectAnalyticalWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";

describe("parameter placeholders of a custom URL drill", () => {
    const topNRef = idRef("topN", "parameter");
    const regionRef = idRef("region", "parameter");
    const topNParameter: IDashboardParameter = { ref: topNRef, parameterType: "NUMBER", mode: "active" };
    const regionParameter: IDashboardParameter = { ref: regionRef, parameterType: "STRING", mode: "active" };

    const drillEvent: IDashboardDrillEvent = {
        dataView: dummyDataView(newDefForItems("reference-workspace", [])),
        drillContext: { type: "table", element: "cell", intersection: [] },
        drillDefinitions: [],
        widgetRef: SimpleSortedTableWidgetRef,
    };

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory(
            function setTester(tester) {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({
                    settings: { enableParameters: true, enableStringParameters: true },
                }),
            },
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(tabsActions.addParameter({ parameter: regionParameter, workspaceDefault: "East" }));
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({
                values: [
                    { ref: topNRef, value: 3 },
                    { ref: regionRef, value: "North & South" },
                ],
            }),
        );
    });

    it("resolves the applied chip values, URL-encoded", async () => {
        expect(await resolveUrl("https://example.com/?n={parameter(topN)}&r={parameter(region)}")).toBe(
            "https://example.com/?n=3&r=North%20%26%20South",
        );
    });

    it("does not encode a parameter that starts the URL", async () => {
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({
                values: [{ ref: regionRef, value: "https://example.com/base" }],
            }),
        );

        expect(await resolveUrl("{parameter(region)}/?n={parameter(topN)}")).toBe(
            "https://example.com/base/?n=3",
        );
    });

    it("inserts an unencoded value literally when it contains replacement tokens", async () => {
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({
                values: [{ ref: regionRef, value: "https://example.com/$&-$'-$$" }],
            }),
        );

        expect(await resolveUrl("{parameter(region)}/?n={parameter(topN)}")).toBe(
            "https://example.com/$&-$'-$$/?n=3",
        );
    });

    it("does not resolve placeholders inside an inserted value", async () => {
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({
                values: [{ ref: regionRef, value: "https://host/{workspace_id}" }],
            }),
        );

        expect(await resolveUrl("{parameter(region)}/?w={workspace_id}")).toBe(
            "https://host/{workspace_id}/?w=reference-workspace",
        );
    });

    it("resolves a repeated placeholder whose value contains itself", async () => {
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({
                values: [{ ref: regionRef, value: "{parameter(region)}" }],
            }),
        );

        expect(await resolveUrl("{parameter(region)}/{parameter(region)}")).toBe(
            "{parameter(region)}/%7Bparameter(region)%7D",
        );
    });

    it("resolves the insight value when the chip has no value", async () => {
        clearTopNChipValue();
        setInsightTopNValue(7);
        setWorkspaceTopNDefault(10);

        expect(await resolveUrl("https://example.com/?n={parameter(topN)}")).toBe("https://example.com/?n=7");
    });

    it("resolves the workspace default when neither the chip nor the insight has a value", async () => {
        clearTopNChipValue();
        setWorkspaceTopNDefault(10);

        expect(await resolveUrl("https://example.com/?n={parameter(topN)}")).toBe(
            "https://example.com/?n=10",
        );
    });

    it("rejects a drill whose parameter has no value", async () => {
        clearTopNChipValue();

        await expectDrillToFail("https://example.com/?n={parameter(topN)}");
    });

    it("rejects a drill whose parameter is not on the dashboard", async () => {
        await expectDrillToFail("https://example.com/?n={parameter(unknown)}");
    });

    it("rejects a drill when parameters are disabled", async () => {
        setSettings({ enableParameters: false, enableStringParameters: true });

        await expectDrillToFail("https://example.com/?n={parameter(topN)}");
    });

    it("rejects a string parameter when string parameters are disabled", async () => {
        setSettings({ enableParameters: true, enableStringParameters: false });

        expect(await resolveUrl("https://example.com/?n={parameter(topN)}")).toBe("https://example.com/?n=3");
        await expectDrillToFail("https://example.com/?r={parameter(region)}");
    });

    function customUrlDrill(url: string): IDrillToCustomUrl {
        return {
            type: "drillToCustomUrl",
            transition: "new-window",
            origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
            target: { url },
        };
    }

    async function resolveUrl(url: string) {
        const event: unknown = await Tester.dispatchAndWaitFor(
            drillToCustomUrl(customUrlDrill(url), drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        );
        if (!isDashboardDrillToCustomUrlResolved(event)) {
            throw new Error("The custom URL drill did not resolve.");
        }
        return event.payload.url;
    }

    async function expectDrillToFail(url: string) {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        try {
            const event: unknown = await Tester.dispatchAndWaitFor(
                drillToCustomUrl(customUrlDrill(url), drillEvent),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );
            expect(isDashboardCommandFailed(event) && event.payload.reason).toBe("USER_ERROR");
        } finally {
            warnSpy.mockRestore();
        }
    }

    function setSettings(settings: { enableParameters: boolean; enableStringParameters: boolean }) {
        const config = selectConfig(Tester.state());
        Tester.dispatch(
            configActions.setConfig({ ...config, settings: { ...config.settings, ...settings } }),
        );
    }

    function clearTopNChipValue() {
        Tester.dispatch(
            tabsActions.setParameterRuntimeValues({ values: [{ ref: topNRef, value: undefined }] }),
        );
    }

    function setInsightTopNValue(value: number) {
        const widget = selectAnalyticalWidgetByRef(SimpleSortedTableWidgetRef)(Tester.state());
        const insight = isInsightWidget(widget)
            ? selectInsightByRef(widget.insight)(Tester.state())
            : undefined;
        if (!insight) {
            throw new Error("The drilled widget has no insight.");
        }
        Tester.dispatch(
            insightsActions.upsertInsight({
                ...insight,
                insight: { ...insight.insight, parameters: [{ ref: topNRef, value }] },
            }),
        );
    }

    function setWorkspaceTopNDefault(defaultValue: number) {
        Tester.dispatch(
            catalogActions.setCatalogParameters({
                status: "loaded",
                parameters: [
                    {
                        type: "parameter",
                        id: "topN",
                        uri: "/topN",
                        ref: topNRef,
                        title: "Top N",
                        description: "",
                        production: true,
                        deprecated: false,
                        unlisted: false,
                        definition: { type: "NUMBER", defaultValue },
                    },
                ],
            }),
        );
    }
});
