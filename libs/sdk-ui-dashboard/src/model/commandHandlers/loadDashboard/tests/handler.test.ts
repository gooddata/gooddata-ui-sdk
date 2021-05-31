// (C) 2021 GoodData Corporation
import { loadDashboard } from "../../../commands";
import { DashboardTester, SimpleDashboardRecording } from "../../../tests/DashboardTester";
import { DashboardLoaded } from "../../../events";

describe("load dashboard handler", () => {
    it("should emit event for the loaded dashboard", async () => {
        const tester = DashboardTester.forRecording(SimpleDashboardRecording);

        tester.dispatch(loadDashboard());
        const event: DashboardLoaded = await tester.waitFor("GDC.DASH/EVT.LOADED");

        expect(event.type).toEqual("GDC.DASH/EVT.LOADED");
        expect(event.payload.dashboard.identifier).toEqual(SimpleDashboardRecording);
    });
});
