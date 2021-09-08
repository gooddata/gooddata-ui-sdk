// (C) 2021 GoodData Corporation
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { ChangeKpiWidgetMeasure, changeKpiWidgetMeasure, initializeDashboard } from "../../../commands";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { measureItem, uriRef } from "@gooddata/sdk-model";
import { DashboardCommandFailed, DashboardKpiWidgetMeasureChanged } from "../../../events";
import { selectWidgetByRef } from "../../../state/layout/layoutSelectors";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWidgets,
} from "../../../tests/fixtures/ComplexDashboard.fixtures";
import {
    MockAvailabilityWithDifferentRelevance,
    TimelineDateDatasetRef,
} from "../../../tests/fixtures/CatalogAvailability.fixtures";

describe("change KPI widget measure handler", () => {
    describe("for any KPI", () => {
        const WidgetWithNoFilters = ComplexDashboardWidgets.FirstSection.ThirdKpi;

        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier),
        );

        it("should replace measure and keep existing header", async () => {
            const event: DashboardKpiWidgetMeasureChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(WidgetWithNoFilters.ref, measureItem(ReferenceLdm.Won)),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(event.payload.measure.title).toEqual("Won");
            expect(event.payload.kpiWidget.title).toEqual("Probability All Time");
            expect(event.payload.header).toBeUndefined();
            expect(event.payload.kpiWidget.kpi.metric).toEqual(event.payload.measure.ref);
        });

        it("should replace measure and switch widget title to measure title", async () => {
            const event: DashboardKpiWidgetMeasureChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(
                    WidgetWithNoFilters.ref,
                    measureItem(ReferenceLdm.Won),
                    "from-measure",
                ),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(event.payload.measure.title).toEqual("Won");
            expect(event.payload.kpiWidget.title).toEqual("Won");
            expect(event.payload.header).toEqual({ title: "Won" });
            expect(event.payload.kpiWidget.kpi.metric).toEqual(event.payload.measure.ref);
        });

        it("should replace measure and switch widget title to custom value", async () => {
            const event: DashboardKpiWidgetMeasureChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(WidgetWithNoFilters.ref, measureItem(ReferenceLdm.Won), {
                    title: "Custom Title",
                }),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(event.payload.measure.title).toEqual("Won");
            expect(event.payload.kpiWidget.title).toEqual("Custom Title");
            expect(event.payload.header).toEqual({ title: "Custom Title" });
            expect(event.payload.kpiWidget.kpi.metric).toEqual(event.payload.measure.ref);
        });

        it("should fail if widget does not exist", async () => {
            const event: DashboardCommandFailed<ChangeKpiWidgetMeasure> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(
                    uriRef("does-not-exist"),
                    measureItem(ReferenceLdm.Won),
                    { title: "Custom Title" },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if measure does not exist", async () => {
            const event: DashboardCommandFailed<ChangeKpiWidgetMeasure> = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(
                    WidgetWithNoFilters.ref,
                    uriRef("does-not-exist"),
                    { title: "Custom Title" },
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(
                    WidgetWithNoFilters.ref,
                    measureItem(ReferenceLdm.Won),
                    "from-measure",
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for KPI with date dataset", () => {
        const WidgetWithDateDataset = ComplexDashboardWidgets.FirstSection.LastKpi;

        it("should keep existing date dataset if it is available for the new metric", async () => {
            const Tester = DashboardTester.forRecording(ComplexDashboardIdentifier);
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.resetMonitors();

            const originalWidget = selectWidgetByRef(WidgetWithDateDataset.ref)(Tester.state());
            const event: DashboardKpiWidgetMeasureChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(WidgetWithDateDataset.ref, measureItem(ReferenceLdm.Won)),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(event.payload.kpiWidget.dateDataSet).toEqual(originalWidget!.dateDataSet);
        });

        it("should switch to most relevant date dataset if existing setting is not valid", async () => {
            const Tester = DashboardTester.forRecording(
                ComplexDashboardIdentifier,
                {},
                {
                    catalogAvailability: {
                        availableDateDatasets: MockAvailabilityWithDifferentRelevance,
                    },
                },
            );
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.resetMonitors();

            const originalWidget = selectWidgetByRef(WidgetWithDateDataset.ref)(Tester.state());
            const event: DashboardKpiWidgetMeasureChanged = await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(WidgetWithDateDataset.ref, measureItem(ReferenceLdm.Won)),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(event.payload.kpiWidget.dateDataSet).not.toEqual(originalWidget!.dateDataSet);
            // this is URI of the Timeline date dataset which the mocks used above make the most relevant
            // the Timeline date dataset is part of the reference workspace catalog
            expect(event.payload.kpiWidget.dateDataSet).toEqual(TimelineDateDatasetRef);
        });

        it("should emit correct events", async () => {
            const Tester = DashboardTester.forRecording(ComplexDashboardIdentifier);
            await Tester.dispatchAndWaitFor(initializeDashboard(), "GDC.DASH/EVT.INITIALIZED");
            Tester.resetMonitors();

            await Tester.dispatchAndWaitFor(
                changeKpiWidgetMeasure(
                    WidgetWithDateDataset.ref,
                    measureItem(ReferenceLdm.Won),
                    undefined,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.KPI_WIDGET.MEASURE_CHANGED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
