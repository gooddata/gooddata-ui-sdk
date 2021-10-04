// (C) 2021 GoodData Corporation
import { objRefsToStringKey } from "@gooddata/sdk-backend-mockingbird";
import { setAttributeFilterParent } from "../../../../commands";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester";
import { selectFilterContextAttributeFilters } from "../../../../store/filterContext/filterContextSelectors";
import { idRef, uriRef } from "@gooddata/sdk-model";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures";

const BackendConfig = {
    getCommonAttributesResponses: {
        [objRefsToStringKey([
            // unfortunately the recorded dashboard uses URIs, so we must hard code them here
            uriRef("/gdc/md/referenceworkspace/obj/1089"),
            uriRef("/gdc/md/referenceworkspace/obj/1071"),
        ])]: [idRef("parent")],
    },
};

describe("setAttributeFilterParentHandler", () => {
    let Tester: DashboardTester;
    beforeEach(
        preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                backendConfig: BackendConfig,
            },
        ),
    );

    it("should emit the appropriate events for valid set attribute filter parent command", async () => {
        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            Tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        Tester.dispatch(
            setAttributeFilterParent(firstFilterLocalId, {
                filterLocalIdentifier: secondFilterLocalId,
                over: { attributes: [idRef("parent")] },
            }),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the appropriate values in state for valid set attribute filter parent command", async () => {
        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            Tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        Tester.dispatch(
            setAttributeFilterParent(firstFilterLocalId, {
                filterLocalIdentifier: secondFilterLocalId,
                over: { attributes: [idRef("parent")] },
            }),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot();
    });

    it("should emit the appropriate events when trying to set parent of a non-existent attribute filter", async () => {
        Tester.dispatch(
            setAttributeFilterParent("NON EXISTENT LOCAL ID", {
                filterLocalIdentifier: "whatever",
                over: { attributes: [] },
            }),
        );

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to set parent of a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(
            setAttributeFilterParent("NON EXISTENT LOCAL ID", {
                filterLocalIdentifier: "whatever",
                over: { attributes: [] },
            }),
        );

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });
});
