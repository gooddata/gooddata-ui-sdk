// (C) 2021 GoodData Corporation
import { changeAttributeFilterSelection, loadDashboard } from "../../../../commands";
import { DashboardTester, SimpleDashboardRecording } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";

describe("changeAttributeFilterSelectionHandler.test", () => {
    async function getInitializedTester(): Promise<DashboardTester> {
        const tester = DashboardTester.forRecording(SimpleDashboardRecording);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");
        tester.resetMonitors();

        return tester;
    }

    it("should emit the appropriate events for changed attribute filter selection", async () => {
        const tester = await getInitializedTester();

        const firstFilterLocalId = selectFilterContextAttributeFilters(tester.state())[0].attributeFilter
            .localIdentifier!;

        tester.dispatch(
            changeAttributeFilterSelection(
                firstFilterLocalId,
                { uris: ["testing/uri"] },
                "NOT_IN",
                "testCorrelation",
            ),
        );

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the attribute selection in state on changed attribute filter selection", async () => {
        const tester = await getInitializedTester();

        const firstFilterLocalId = selectFilterContextAttributeFilters(tester.state())[0].attributeFilter
            .localIdentifier!;

        tester.dispatch(
            changeAttributeFilterSelection(
                firstFilterLocalId,
                { uris: ["testing/uri"] },
                "NOT_IN",
                "testCorrelation",
            ),
        );

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextAttributeFilters(tester.state())[0]).toMatchSnapshot({
            attributeFilter: {
                localIdentifier: expect.any(String),
            },
        });
    });

    it("should emit the appropriate events when trying to change a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(
            changeAttributeFilterSelection(
                "NON EXISTENT LOCAL ID",
                { uris: ["testing/uri"] },
                "NOT_IN",
                "testCorrelation",
            ),
        );

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to change a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        const originalFilters = selectFilterContextAttributeFilters(tester.state());

        tester.dispatch(
            changeAttributeFilterSelection(
                "NON EXISTENT LOCAL ID",
                { uris: ["testing/uri"] },
                "NOT_IN",
                "testCorrelation",
            ),
        );

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(tester.state())).toEqual(originalFilters);
    });
});
