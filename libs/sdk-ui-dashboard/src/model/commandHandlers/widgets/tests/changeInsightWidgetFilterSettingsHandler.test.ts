// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    ChangeInsightWidgetFilterSettings,
    disableInsightWidgetDateFilter,
    enableInsightWidgetDateFilter,
    ignoreFilterOnInsightWidget,
    replaceInsightWidgetFilterSettings,
    replaceInsightWidgetIgnoredFilters,
    unignoreFilterOnInsightWidget,
} from "../../../commands/index.js";
import {
    attributeDisplayFormRef,
    idRef,
    ObjRef,
    uriRef,
    isDashboardAttributeFilterReference,
} from "@gooddata/sdk-model";
import {
    DashboardCommandFailed,
    DashboardInsightWidgetFilterSettingsChanged,
} from "../../../events/index.js";
import { selectAnalyticalWidgetByRef } from "../../../store/layout/layoutSelectors.js";
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    ComplexDashboardFilters,
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

function ignoredWidgetFilterRefs(tester: DashboardTester, ref: ObjRef) {
    const widget = selectAnalyticalWidgetByRef(ref)(tester.state());

    return widget!.ignoreDashboardFilters.filter(isDashboardAttributeFilterReference).map((ignored) => {
        return ignored.displayForm;
    });
}

describe("change insight widget filter settings handler", () => {
    // Note: this picked this data set on purpose so that it is different from the ones that are already used
    //  on some of the widgets on the reference dashboard
    const ValidDateDatasetUriRef = uriRef("/gdc/md/referenceworkspace/obj/392");
    const ValidDateDatasetIdRef = idRef("created.dataset.dt");
    const WidgetWithNoFilters = ComplexDashboardWidgets.SecondSection.FirstTable;
    const WidgetWithAllFilters = ComplexDashboardWidgets.ThirdSection.Heatmap;

    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, ComplexDashboardIdentifier);
    });

    describe("for replace settings operation", () => {
        const TestWidgetRef = WidgetWithNoFilters.ref;

        it("should enable date filter and clear attribute ignores when date dataset specified using URI", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                replaceInsightWidgetFilterSettings(TestWidgetRef, {
                    dateDatasetForFiltering: ValidDateDatasetUriRef,
                }),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeDefined();
            expect(event.payload.ignoredAttributeFilters).toEqual([]);
            expect(event.payload.dateDatasetForFiltering!.dataSet.uri).toEqual(ValidDateDatasetUriRef.uri);

            // this verifies that the widget's date dataset is updated && importantly the 'native' ref used
            // on the catalog date dataset is used.
            const widget = selectAnalyticalWidgetByRef(TestWidgetRef)(Tester.state());
            expect(widget!.dateDataSet).toEqual(event.payload.dateDatasetForFiltering!.dataSet.ref);
            expect(widget!.ignoreDashboardFilters).toEqual([]);
        });

        it("should enable date filter and clear attribute ignores when date dataset specified using identifier", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                replaceInsightWidgetFilterSettings(TestWidgetRef, {
                    dateDatasetForFiltering: ValidDateDatasetIdRef,
                }),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeDefined();
            expect(event.payload.ignoredAttributeFilters).toEqual([]);
            expect(event.payload.dateDatasetForFiltering!.dataSet.id).toEqual(
                ValidDateDatasetIdRef.identifier,
            );

            // this verifies that the widget's date dataset is updated && importantly the 'native' ref used
            // on the catalog date dataset is used.
            const widget = selectAnalyticalWidgetByRef(TestWidgetRef)(Tester.state());
            expect(widget!.dateDataSet).toEqual(event.payload.dateDatasetForFiltering!.dataSet.ref);
            expect(widget!.ignoreDashboardFilters).toEqual([]);
        });

        it("should fail if bad date dataset ref is provided", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings> =
                await Tester.dispatchAndWaitFor(
                    replaceInsightWidgetFilterSettings(
                        TestWidgetRef,
                        {
                            dateDatasetForFiltering: idRef("does not exist"),
                        },
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should set ignored attribute filters and disable date filter", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                replaceInsightWidgetFilterSettings(TestWidgetRef, {
                    ignoreAttributeFilters: [
                        ComplexDashboardFilters.FirstAttribute.uriRef,
                        ComplexDashboardFilters.SecondAttribute.idRef,
                    ],
                }),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toBeDefined();
            expect(event.payload.dateDatasetForFiltering).toBeUndefined();
            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
                ComplexDashboardFilters.SecondAttribute.filter,
            ]);

            // this verifies that the widget's ignored filters are updated && importantly the 'native' ref used
            // on the ignored attribute filter is used
            const widget = selectAnalyticalWidgetByRef(TestWidgetRef)(Tester.state());
            expect(ignoredWidgetFilterRefs(Tester, TestWidgetRef)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
                ComplexDashboardFilters.SecondAttribute.filter.attributeFilter.displayForm,
            ]);
            expect(widget!.dateDataSet).toBeUndefined();
        });

        it("should fail if non-existent display form is provided", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings> =
                await Tester.dispatchAndWaitFor(
                    replaceInsightWidgetFilterSettings(
                        TestWidgetRef,
                        {
                            ignoreAttributeFilters: [uriRef("does not exist")],
                        },
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if display form not used for filtering is provided", async () => {
            const event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings> =
                await Tester.dispatchAndWaitFor(
                    replaceInsightWidgetFilterSettings(
                        TestWidgetRef,
                        {
                            ignoreAttributeFilters: [attributeDisplayFormRef(ReferenceMd.Account.Default)],
                        },
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                replaceInsightWidgetFilterSettings(
                    TestWidgetRef,
                    {
                        dateDatasetForFiltering: ValidDateDatasetIdRef,
                        ignoreAttributeFilters: [
                            ComplexDashboardFilters.FirstAttribute.uriRef,
                            ComplexDashboardFilters.SecondAttribute.idRef,
                        ],
                    },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for enable date filter operation", () => {
        it("should enable date filter for widget that has date filter disabled", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                enableInsightWidgetDateFilter(WidgetWithNoFilters.ref, ValidDateDatasetIdRef),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeDefined();
            expect(event.payload.dateDatasetForFiltering!.dataSet.uri).toEqual(ValidDateDatasetUriRef.uri);

            // this verifies that the widget's date dataset is updated && importantly the 'native' ref used
            // on the catalog date dataset is used.
            const widget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());
            expect(widget!.dateDataSet).toEqual(event.payload.dateDatasetForFiltering!.dataSet.ref);
        });

        it("should modify date dataset when widget already has date filter enabled", async () => {
            const originalWidget = selectAnalyticalWidgetByRef(WidgetWithAllFilters.ref)(Tester.state());

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                enableInsightWidgetDateFilter(WidgetWithAllFilters.ref, ValidDateDatasetIdRef),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeDefined();
            expect(event.payload.dateDatasetForFiltering!.dataSet.uri).toEqual(ValidDateDatasetUriRef.uri);

            // this verifies that the widget's date dataset is updated && importantly the 'native' ref used
            // on the catalog date dataset is used.
            const widget = selectAnalyticalWidgetByRef(WidgetWithAllFilters.ref)(Tester.state());
            expect(widget!.dateDataSet).toEqual(event.payload.dateDatasetForFiltering!.dataSet.ref);
            expect(widget!.dateDataSet).not.toEqual(originalWidget!.dateDataSet);
        });

        it("should not touch the ignored attribute filters", async () => {
            const originalWidget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                enableInsightWidgetDateFilter(WidgetWithNoFilters.ref, ValidDateDatasetIdRef),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            // widget with no filters means all attribute filters are in widget's ignore list. ensure they remain
            // the same
            const widget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());
            expect(widget!.ignoreDashboardFilters).toEqual(originalWidget!.ignoreDashboardFilters);
            expect(event.payload.ignoredAttributeFilters).not.toEqual([]);
        });
    });

    describe("for disable date filter operation", () => {
        it("should disable date filter", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                disableInsightWidgetDateFilter(WidgetWithAllFilters.ref),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeUndefined();

            const widget = selectAnalyticalWidgetByRef(WidgetWithAllFilters.ref)(Tester.state());
            expect(widget!.dateDataSet).toBeUndefined();
        });

        it("should do nothing if widget has no date filtering setup", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                disableInsightWidgetDateFilter(WidgetWithNoFilters.ref),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeUndefined();

            const widget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());
            expect(widget!.dateDataSet).toBeUndefined();
        });

        it("should not touch the ignored attribute filters", async () => {
            const originalWidget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                disableInsightWidgetDateFilter(WidgetWithNoFilters.ref),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            // widget with no filters means all attribute filters are in widget's ignore list. ensure they remain
            // the same
            const widget = selectAnalyticalWidgetByRef(WidgetWithNoFilters.ref)(Tester.state());
            expect(widget!.ignoreDashboardFilters).toEqual(originalWidget!.ignoreDashboardFilters);
            expect(event.payload.ignoredAttributeFilters).not.toEqual([]);
        });
    });

    describe("for replace attribute ignores operation", () => {
        it("should replace existing ignore list", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                replaceInsightWidgetIgnoredFilters(WidgetWithAllFilters.ref, [
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ]),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toBeDefined();
            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
            ]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithAllFilters.ref)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
            ]);
        });

        it("should not touch the date filter setting", async () => {
            const originalWidget = selectAnalyticalWidgetByRef(WidgetWithAllFilters.ref)(Tester.state());
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                replaceInsightWidgetIgnoredFilters(WidgetWithAllFilters.ref, [
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ]),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.dateDatasetForFiltering).toBeDefined();

            const widget = selectAnalyticalWidgetByRef(WidgetWithAllFilters.ref)(Tester.state());
            expect(widget!.dateDataSet).toEqual(originalWidget!.dateDataSet);
        });
    });

    describe("for ignore attribute filter operation", () => {
        it("should add filter when ignore list is empty", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                ignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
            ]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithAllFilters.ref)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
            ]);
        });

        it("should add filter when ignore list is not empty", async () => {
            await Tester.dispatchAndWaitFor(
                ignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                ignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.SecondAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
                ComplexDashboardFilters.SecondAttribute.filter,
            ]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithAllFilters.ref)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
                ComplexDashboardFilters.SecondAttribute.filter.attributeFilter.displayForm,
            ]);
        });

        it("should do nothing if filter already ignored", async () => {
            await Tester.dispatchAndWaitFor(
                ignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                ignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
            ]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithAllFilters.ref)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
            ]);
        });
    });

    describe("for unignore attribute filter operation", () => {
        it("should do nothing if ignore list is empty", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                unignoreFilterOnInsightWidget(
                    WidgetWithAllFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithAllFilters.ref)).toEqual([]);
        });

        it("should do nothing if list of filters to remove is empty", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                unignoreFilterOnInsightWidget(WidgetWithNoFilters.ref, []),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).not.toEqual([]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithNoFilters.ref)).not.toEqual([]);
        });

        it("should remove single filter from ignore list", async () => {
            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                unignoreFilterOnInsightWidget(
                    WidgetWithNoFilters.ref,
                    ComplexDashboardFilters.SecondAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter,
            ]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithNoFilters.ref)).toEqual([
                ComplexDashboardFilters.FirstAttribute.filter.attributeFilter.displayForm,
            ]);
        });

        it("should remove last filter from ignore list", async () => {
            await Tester.dispatchAndWaitFor(
                unignoreFilterOnInsightWidget(
                    WidgetWithNoFilters.ref,
                    ComplexDashboardFilters.SecondAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            const event: DashboardInsightWidgetFilterSettingsChanged = await Tester.dispatchAndWaitFor(
                unignoreFilterOnInsightWidget(
                    WidgetWithNoFilters.ref,
                    ComplexDashboardFilters.FirstAttribute.uriRef,
                ),
                "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
            );

            expect(event.payload.ignoredAttributeFilters).toEqual([]);

            expect(ignoredWidgetFilterRefs(Tester, WidgetWithNoFilters.ref)).toEqual([]);
        });
    });
});
