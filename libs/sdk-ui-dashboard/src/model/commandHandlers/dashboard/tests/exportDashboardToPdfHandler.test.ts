// (C) 2021-2022 GoodData Corporation
import { DashboardExportToPdfResolved } from "../../../events";
import { exportDashboardToPdf } from "../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures";

describe("export dashboard to PDF handler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier),
    );

    it("should emit event when dashboard successfully exported", async () => {
        Tester.dispatch(exportDashboardToPdf());
        const event: DashboardExportToPdfResolved = await Tester.waitFor("GDC.DASH/EVT.EXPORT.PDF.RESOLVED");

        expect(event.payload.resultUri).toBeDefined();
    });

    it("should emit events in correct order and carry-over correlationId", async () => {
        Tester.dispatch(exportDashboardToPdf("correlation-id"));
        await Tester.waitFor("GDC.DASH/EVT.EXPORT.PDF.RESOLVED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });
});
