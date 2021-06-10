// (C) 2021 GoodData Corporation
import { RecordedBackendConfig, objRefsToStringKey } from "@gooddata/sdk-backend-mockingbird";
import { loadDashboard, setAttributeFilterParent } from "../../../../commands";
import { DashboardTester } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../state/filterContext/filterContextSelectors";
import { idRef, uriRef } from "@gooddata/sdk-model";
import { SimpleDashboardIdentifier } from "../../../../tests/Dashboard.fixtures";

describe("setAttributeFilterParentHandler", () => {
    async function getInitializedTester(backendConfig?: RecordedBackendConfig): Promise<DashboardTester> {
        const tester = DashboardTester.forRecording(SimpleDashboardIdentifier, backendConfig);

        tester.dispatch(loadDashboard());
        await tester.waitFor("GDC.DASH/EVT.LOADED");
        tester.resetMonitors();

        return tester;
    }

    it("should emit the appropriate events for valid set attribute filter parent command", async () => {
        const tester = await getInitializedTester({
            getCommonAttributesResponses: {
                [objRefsToStringKey([
                    // unfortunately the recorded dashboard uses URIs, so we must hard code them here
                    uriRef("/gdc/md/referenceworkspace/obj/1089"),
                    uriRef("/gdc/md/referenceworkspace/obj/1071"),
                ])]: [idRef("parent")],
            },
        });

        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        tester.dispatch(
            setAttributeFilterParent(firstFilterLocalId, {
                filterLocalIdentifier: secondFilterLocalId,
                over: { attributes: [idRef("parent")] },
            }),
        );

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the appropriate values in state for valid set attribute filter parent command", async () => {
        const tester = await getInitializedTester({
            getCommonAttributesResponses: {
                [objRefsToStringKey([
                    // unfortunately the recorded dashboard uses URIs, so we must hard code them here
                    uriRef("/gdc/md/referenceworkspace/obj/1089"),
                    uriRef("/gdc/md/referenceworkspace/obj/1071"),
                ])]: [idRef("parent")],
            },
        });

        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        tester.dispatch(
            setAttributeFilterParent(firstFilterLocalId, {
                filterLocalIdentifier: secondFilterLocalId,
                over: { attributes: [idRef("parent")] },
            }),
        );

        await tester.waitFor("GDC.DASH/EVT.FILTERS.FILTER_CONTEXT_CHANGED");

        expect(selectFilterContextAttributeFilters(tester.state())[0]).toMatchSnapshot();
    });

    it("should emit the appropriate events when trying to set parent of a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        tester.dispatch(
            setAttributeFilterParent("NON EXISTENT LOCAL ID", {
                filterLocalIdentifier: "whatever",
                over: { attributes: [] },
            }),
        );

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to set parent of a non-existent attribute filter", async () => {
        const tester = await getInitializedTester();

        const originalFilters = selectFilterContextAttributeFilters(tester.state());

        tester.dispatch(
            setAttributeFilterParent("NON EXISTENT LOCAL ID", {
                filterLocalIdentifier: "whatever",
                over: { attributes: [] },
            }),
        );

        await tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(tester.state())).toEqual(originalFilters);
    });
});
