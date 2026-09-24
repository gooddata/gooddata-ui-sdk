// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAttributeDescriptor,
    type IDashboardParameter,
    type IDrillToCustomUrl,
    type IDrillToDashboard,
    idRef,
    newAttribute,
    newDefForItems,
    newMeasure,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    SimpleDashboardIdentifier,
    SimpleSortedTableWidgetRef,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { type IDashboardDrillEvent } from "../../../types.js";
import { drillToCustomUrl, drillToDashboard, keyDriverAnalysis } from "../../commands/drill.js";
import { createDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardKeyDriverCombinationItem } from "../../events/drill.js";
import { selectCatalogDateAttributes } from "../../store/catalog/catalogSelectors.js";
import { selectExecutableDashboardFilters } from "../../store/filtering/dashboardFilterSelectors.js";
import { selectFilterContextFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { unavailableObjectsActions } from "../../store/unavailableObjects/index.js";

describe("drillToDashboardHandler parameter inheritance", () => {
    const topNRef = idRef("topN", "parameter");
    const topNParameter: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
    };

    const selfDrillDefinition: IDrillToDashboard = {
        type: "drillToDashboard",
        transition: "in-place",
        origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
        target: idRef(SimpleDashboardIdentifier),
    };

    const drillEvent = {
        dataView: {} as never,
        drillContext: { type: "table", element: "cell", intersection: [] },
        drillDefinitions: [],
        widgetRef: SimpleSortedTableWidgetRef,
    } as IDashboardDrillEvent;

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(tabsActions.setParameterRuntimeValues({ values: [{ ref: topNRef, value: 3 }] }));
    });

    it("resolves mixed custom URL placeholders through the shared registry", async () => {
        Tester.dispatch(
            tabsActions.addMeasureValueFilter({
                measure: idRef("unfiltered-metric", "measure"),
                localIdentifier: "mvf",
                index: -1,
            }),
        );
        const drillDefinition: IDrillToCustomUrl = {
            type: "drillToCustomUrl",
            transition: "new-window",
            origin: selfDrillDefinition.origin,
            target: {
                url: "https://example.com/{workspace_id}/{dashboard_id}/{widget_id}?metric={dash_mvf_condition(unfiltered-metric)}&workspace={workspace_id}",
            },
        };
        const event = await Tester.dispatchAndWaitFor(
            drillToCustomUrl(drillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
        );
        expect(event.payload.url).toBe(
            `https://example.com/reference-workspace/${SimpleDashboardIdentifier}/${objRefToString(SimpleSortedTableWidgetRef)}?metric=ALL&workspace=reference-workspace`,
        );
    });

    it("rejects a custom URL when a registered placeholder cannot be resolved", async () => {
        const drillDefinition: IDrillToCustomUrl = {
            type: "drillToCustomUrl",
            transition: "new-window",
            origin: selfDrillDefinition.origin,
            target: { url: "https://example.com/?metric={mvf_condition(missing-local-measure)}" },
        };
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        try {
            const event = await Tester.dispatchAndWaitFor(
                drillToCustomUrl(drillDefinition, drillEvent),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );
            expect(event.payload.reason).toBe("USER_ERROR");
            expect(warnSpy).toHaveBeenCalledExactlyOnceWith(
                expect.stringContaining(
                    "could not resolve parameter(s) {mvf_condition(missing-local-measure)}",
                ),
            );
            expect(Tester.emittedEventsDigest().map(({ type }) => type)).not.toContain(
                "GDC.DASH/EVT.DRILL.DRILL_TO_CUSTOM_URL.RESOLVED",
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    it("rejects a restricted dashboard before emitting a navigation event", async () => {
        const target = idRef("restricted-target", "analyticalDashboard");
        Tester.dispatch(
            unavailableObjectsActions.setUnavailableObjects([
                { ref: target, type: "analyticalDashboard", reason: "forbidden" },
            ]),
        );
        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard({ ...selfDrillDefinition, target }, drillEvent),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );
        expect(event.payload.reason).toBe("USER_ERROR");
        expect(Tester.emittedEventsDigest().map(({ type }) => type)).not.toContain(
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );
    });

    it.each([true, false])(
        "omits restricted KDA filters and preserves saved values (raw filters: %s)",
        async (useRawFilters) => {
            const restrictedLabel = idRef("restricted-label", "displayForm");
            const restrictedMetric = idRef("restricted-metric", "measure");
            const readableLabel = idRef("readable-label", "displayForm");
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: readableLabel,
                    localIdentifier: "readable-attribute-filter",
                    index: -1,
                    initialSelection: { values: ["readable-selection"] },
                }),
            );
            Tester.dispatch(
                tabsActions.addAttributeFilter({
                    displayForm: restrictedLabel,
                    localIdentifier: "restricted-attribute-filter",
                    index: -1,
                    initialSelection: { values: ["stored-selection"] },
                }),
            );
            Tester.dispatch(
                tabsActions.addMeasureValueFilter({
                    measure: restrictedMetric,
                    localIdentifier: "restricted-mvf",
                    index: -1,
                }),
            );
            Tester.dispatch(
                unavailableObjectsActions.setUnavailableObjects([
                    { ref: restrictedLabel, type: "displayForm", reason: "forbidden" },
                    { ref: restrictedMetric, type: "measure", reason: "forbidden" },
                ]),
            );

            const savedFilters = Tester.select(selectFilterContextFilters);
            const dateAttribute = Tester.select(selectCatalogDateAttributes)[0];
            const descriptor: IAttributeDescriptor = {
                attributeHeader: {
                    uri: dateAttribute.defaultDisplayForm.uri,
                    identifier: dateAttribute.defaultDisplayForm.id,
                    ref: dateAttribute.defaultDisplayForm.ref,
                    primaryLabel: dateAttribute.defaultDisplayForm.ref,
                    localIdentifier: "date",
                    name: dateAttribute.attribute.title,
                    granularity: dateAttribute.granularity,
                    formOf: {
                        ref: dateAttribute.attribute.ref,
                        uri: dateAttribute.attribute.uri,
                        identifier: dateAttribute.attribute.id,
                        name: dateAttribute.attribute.title,
                    },
                },
            };
            const keyDriveItem: IDashboardKeyDriverCombinationItem = {
                where: "after",
                type: "comparative",
                difference: 1,
                values: [1, 2],
                measure: { measureHeaderItem: { localIdentifier: "m1", name: "Metric", format: "#,##0" } },
                range: [
                    {
                        type: "attributeScope",
                        descriptor,
                        header: {
                            attributeHeaderItem: { uri: "from", name: "From", normalizedValue: "2025-01-01" },
                        },
                    },
                    {
                        type: "attributeScope",
                        descriptor,
                        header: {
                            attributeHeaderItem: { uri: "to", name: "To", normalizedValue: "2025-02-01" },
                        },
                    },
                ],
            };
            const event = await Tester.dispatchAndWaitFor(
                keyDriverAnalysis(
                    {
                        type: "keyDriveAnalysis",
                        origin: selfDrillDefinition.origin,
                        transition: "in-place",
                    },
                    {
                        ...drillEvent,
                        dataView: dummyDataView(
                            newDefForItems("reference-workspace", [
                                newAttribute(dateAttribute.defaultDisplayForm.ref, (a) => a.localId("date")),
                                newMeasure("metric", (m) => m.localId("m1")),
                            ]),
                        ),
                        drillContext: {
                            type: "table",
                            element: "cell",
                            intersection: [
                                { header: descriptor },
                                {
                                    header: {
                                        attributeHeader: {
                                            ...descriptor.attributeHeader,
                                            ref: restrictedLabel,
                                            primaryLabel: restrictedLabel,
                                            localIdentifier: "restricted",
                                            formOf: {
                                                ref: idRef("restricted-attribute", "attribute"),
                                                uri: "restricted-attribute",
                                                identifier: "restricted-attribute",
                                                name: "Restricted",
                                            },
                                        },
                                        attributeHeaderItem: { uri: "restricted-value", name: "Value" },
                                    },
                                },
                                { header: keyDriveItem.measure },
                            ],
                        },
                    },
                    useRawFilters ? savedFilters : Tester.select(selectExecutableDashboardFilters),
                    keyDriveItem,
                ),
                "GDC.DASH/EVT.DRILL.KEY_DRIVER_ANALYSIS.RESOLVED",
            );

            expect(event.payload.keyDriveDefinition.filters).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        attributeFilter: expect.objectContaining({
                            displayForm: readableLabel,
                            attributeElements: { values: ["readable-selection"] },
                        }),
                    }),
                ]),
            );
            expect(event.payload.keyDriveDefinition.filters).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        attributeFilter: expect.objectContaining({ displayForm: restrictedLabel }),
                    }),
                ]),
            );
            expect(event.payload.keyDriveDefinition.measureValueFilters).toEqual([]);
            expect(Tester.select(selectFilterContextFilters)).toEqual(savedFilters);
        },
    );

    it("carries the source tab's active parameter overrides in the resolved payload (drill to self)", async () => {
        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard(selfDrillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 3 }]);
    });

    it("carries a parameter left at its workspace default (F1-2604)", async () => {
        Tester.dispatch(tabsActions.setParameterRuntimeValues({ values: [{ ref: topNRef, value: 5 }] }));

        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard(selfDrillDefinition, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 5 }]);
    });

    it("reads overrides from the source tab, not the target tab, when the drill switches tabs", async () => {
        const sourceTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
        const targetTabId = Tester.select(selectActiveTabLocalIdentifier)!;
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(tabsActions.setParameterRuntimeValues({ values: [{ ref: topNRef, value: 7 }] }));

        await Tester.dispatchAndWaitFor(switchDashboardTab(sourceTabId), "GDC.DASH/EVT.TAB.SWITCHED");

        const event = await Tester.dispatchAndWaitFor(
            drillToDashboard({ ...selfDrillDefinition, targetTabLocalIdentifier: targetTabId }, drillEvent),
            "GDC.DASH/EVT.DRILL.DRILL_TO_DASHBOARD.RESOLVED",
        );

        expect(event.payload.parameters).toEqual([{ ref: topNRef, value: 3 }]);
    });

    it("marks the tab switch as drill-originated so saved filter state is not restored over the drill", async () => {
        const sourceTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
        const targetTabId = Tester.select(selectActiveTabLocalIdentifier)!;

        await Tester.dispatchAndWaitFor(switchDashboardTab(sourceTabId), "GDC.DASH/EVT.TAB.SWITCHED");

        const tabSwitched = await Tester.dispatchAndWaitFor(
            drillToDashboard({ ...selfDrillDefinition, targetTabLocalIdentifier: targetTabId }, drillEvent),
            "GDC.DASH/EVT.TAB.SWITCHED",
        );

        expect(tabSwitched.payload.newTabId).toEqual(targetTabId);
        expect(tabSwitched.payload.source).toEqual("drillToSelf");
    });
});
