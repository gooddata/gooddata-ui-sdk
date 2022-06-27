// (C) 2021-2022 GoodData Corporation
import { DashboardExportToPdfResolved } from "../../../events";
import { exportDashboardToPdf } from "../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { uriRef } from "@gooddata/sdk-model";
import { objRefsToStringKey } from "@gooddata/sdk-backend-mockingbird";

describe("export dashboard to PDF handler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                backendConfig: {
                    getCommonAttributesResponses: {
                        [objRefsToStringKey([
                            uriRef("/gdc/md/referenceworkspace/obj/1070"),
                            uriRef("/gdc/md/referenceworkspace/obj/1088"),
                        ])]: [uriRef("/gdc/md/referenceworkspace/obj/1057")],
                    },
                },
            },
        ),
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
