// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { changeParameterValues } from "../../commands/parameters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { isDashboardParametersChanged } from "../../events/parameters.js";
import { catalogActions } from "../../store/catalog/index.js";
import { selectConfig } from "../../store/config/configSelectors.js";
import { configActions } from "../../store/config/index.js";
import { metaActions } from "../../store/meta/index.js";
import { tabsActions } from "../../store/tabs/index.js";
import {
    selectParameterRuntimeOverrideByRef,
    selectParameterValuesByTab,
} from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";

describe("changeParameterValues handler", () => {
    const topNRef = idRef("topN", "parameter");
    const topNParameter: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
    };

    let Tester: DashboardTester;
    beforeEach(async function setup() {
        await preloadedTesterFactory(
            function setTester(tester) {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({ settings: { enableParameters: true } }),
            },
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
    });

    it("does not write values or emit a change event when parameters are disabled", async function disabledParameters() {
        const config = selectConfig(Tester.state());
        Tester.dispatch(
            configActions.setConfig({ ...config, settings: { ...config.settings, enableParameters: false } }),
        );

        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
        expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
    });

    it("sets the runtime override for a parameter present on the active tab", async () => {
        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(3);
    });

    it("ignores values for parameters not present on the active tab (no-op)", async () => {
        const unknownRef = idRef("unknown", "parameter");

        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: unknownRef, value: 9 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(selectParameterRuntimeOverrideByRef(unknownRef)(Tester.state())).toBeUndefined();
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
        expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
    });

    it("does not emit a parameters changed event when the value equals the current one", async () => {
        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 5 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
    });

    it("emits a parameters changed event carrying the applied values of the active tab", async () => {
        const activeTabId = selectActiveTabLocalIdentifier(Tester.state());

        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }], correlationId: "corr-1" }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
        expect(events).toHaveLength(1);
        expect(events[0].payload).toEqual({
            parameters: [{ ref: topNRef, value: 3 }],
            tabLocalIdentifier: activeTabId,
        });
        expect(events[0].correlationId).toBe("corr-1");
    });

    describe("with tabLocalIdentifier", () => {
        it("does not write the override when tabLocalIdentifier names a tab that does not exist", async () => {
            await Tester.dispatchAndWaitFor(
                changeParameterValues({
                    parameters: [{ ref: topNRef, value: 3 }],
                    tabLocalIdentifier: "no-such-tab",
                }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
            expect(Tester.emittedEvents().filter(isDashboardParametersChanged)).toHaveLength(0);
        });

        it("threads tabLocalIdentifier through to the named tab", async () => {
            const activeTabId = selectActiveTabLocalIdentifier(Tester.state());

            await Tester.dispatchAndWaitFor(
                changeParameterValues({
                    parameters: [{ ref: topNRef, value: 3 }],
                    tabLocalIdentifier: activeTabId,
                }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(3);
        });

        it("names the explicitly requested tab in the emitted event", async () => {
            const activeTabId = selectActiveTabLocalIdentifier(Tester.state());

            await Tester.dispatchAndWaitFor(
                changeParameterValues({
                    parameters: [{ ref: topNRef, value: 3 }],
                    tabLocalIdentifier: activeTabId,
                }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
            expect(events).toHaveLength(1);
            expect(events[0].payload.tabLocalIdentifier).toBe(activeTabId);
        });
    });

    describe("when filters persist across tabs", () => {
        const otherTabId = "tab-2";

        function enableCrossTabFilters(): void {
            const config = selectConfig(Tester.state());
            Tester.dispatch(
                configActions.setConfig({
                    ...config,
                    settings: {
                        ...config.settings,
                        enableDashboardPersistentFiltersAcrossTabs: true,
                    },
                }),
            );
            Tester.dispatch(metaActions.setDisablePersistentFiltersAcrossTabs(false));
        }

        function appendTab(parameters?: { parameter: IDashboardParameter; runtimeOverride: number }[]): void {
            const sourceTabId = selectActiveTabLocalIdentifier(Tester.state())!;
            Tester.dispatch(
                tabsActions.setTabs({
                    tabs: [
                        ...(selectTabs(Tester.state()) ?? []),
                        {
                            localIdentifier: otherTabId,
                            title: "Tab 2",
                            ...(parameters ? { parameters: { parameters } } : {}),
                        },
                    ],
                    activeTabLocalIdentifier: sourceTabId,
                }),
            );
        }

        it("writes and emits a change for every tab that defines the parameter", async () => {
            enableCrossTabFilters();
            appendTab([{ parameter: topNParameter, runtimeOverride: 8 }]);
            const sourceTabId = selectActiveTabLocalIdentifier(Tester.state())!;

            await Tester.dispatchAndWaitFor(
                changeParameterValues({
                    parameters: [{ ref: topNRef, value: 3 }],
                    correlationId: "corr-tabs",
                }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
                [sourceTabId]: [{ ref: topNRef, value: 3 }],
                [otherTabId]: [{ ref: topNRef, value: 3 }],
            });
            const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
            expect(events.map((event) => event.payload)).toEqual([
                { parameters: [{ ref: topNRef, value: 3 }], tabLocalIdentifier: sourceTabId },
                { parameters: [{ ref: topNRef, value: 3 }], tabLocalIdentifier: otherTabId },
            ]);
            expect(events.every((event) => event.correlationId === "corr-tabs")).toBe(true);
        });

        it("resets every other tab to its own reset value with restorePerTabOriginals", async () => {
            enableCrossTabFilters();
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
                            definition: { type: "NUMBER", defaultValue: 10 },
                        },
                    ],
                }),
            );
            appendTab([{ parameter: { ...topNParameter, value: 7 }, runtimeOverride: 8 }]);
            const sourceTabId = selectActiveTabLocalIdentifier(Tester.state())!;

            await Tester.dispatchAndWaitFor(
                changeParameterValues({
                    parameters: [{ ref: topNRef, value: 10 }],
                    restorePerTabOriginals: true,
                }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
                [sourceTabId]: [{ ref: topNRef, value: 10 }],
                [otherTabId]: [{ ref: topNRef, value: 7 }],
            });
            const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
            expect(events.map((event) => event.payload.tabLocalIdentifier)).toEqual([
                sourceTabId,
                otherTabId,
            ]);
        });

        it("does not emit a change for a tab that does not define the parameter", async () => {
            enableCrossTabFilters();
            appendTab();
            const sourceTabId = selectActiveTabLocalIdentifier(Tester.state())!;

            await Tester.dispatchAndWaitFor(
                changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
                "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
            );

            expect(selectParameterValuesByTab(Tester.state())[otherTabId]).toEqual([]);
            const events = Tester.emittedEvents().filter(isDashboardParametersChanged);
            expect(events).toHaveLength(1);
            expect(events[0].payload.tabLocalIdentifier).toBe(sourceTabId);
        });
    });

    it("does not emit a filter context changed event", async () => {
        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(Tester.emittedEventsDigest().map((event) => event.type)).not.toContain(
            "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
        );
    });
});
