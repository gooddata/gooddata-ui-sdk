// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { setAttributeFilterParents } from "../../../../commands/index.js";
import { DashboardTester, preloadedTesterFactory } from "../../../../tests/DashboardTester.js";
import { selectFilterContextAttributeFilters } from "../../../../store/filterContext/filterContextSelectors.js";
import { uriRef } from "@gooddata/sdk-model";
import { SimpleDashboardIdentifier } from "../../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("setAttributeFilterParentHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for valid set attribute filter parent command", async () => {
        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            Tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        Tester.dispatch(
            setAttributeFilterParents(firstFilterLocalId, [
                {
                    filterLocalIdentifier: secondFilterLocalId,
                    over: { attributes: [uriRef("/gdc/md/referenceworkspace/obj/1057")] },
                },
            ]),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the appropriate values in state for valid set attribute filter parent command", async () => {
        const [firstFilterLocalId, secondFilterLocalId] = selectFilterContextAttributeFilters(
            Tester.state(),
        ).map((item) => item.attributeFilter.localIdentifier!);

        Tester.dispatch(
            setAttributeFilterParents(firstFilterLocalId, [
                {
                    filterLocalIdentifier: secondFilterLocalId,
                    over: { attributes: [uriRef("/gdc/md/referenceworkspace/obj/1057")] },
                },
            ]),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextAttributeFilters(Tester.state())[0]).toMatchSnapshot();
    });

    it("should emit the appropriate events when trying to set parent of a non-existent attribute filter", async () => {
        Tester.dispatch(
            setAttributeFilterParents("NON EXISTENT LOCAL ID", [
                {
                    filterLocalIdentifier: "whatever",
                    over: { attributes: [] },
                },
            ]),
        );

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should NOT alter the attribute filter state when trying to set parent of a non-existent attribute filter", async () => {
        const originalFilters = selectFilterContextAttributeFilters(Tester.state());

        Tester.dispatch(
            setAttributeFilterParents("NON EXISTENT LOCAL ID", [
                {
                    filterLocalIdentifier: "whatever",
                    over: { attributes: [] },
                },
            ]),
        );

        await Tester.waitFor("GDC.DASH/EVT.COMMAND.FAILED");

        expect(selectFilterContextAttributeFilters(Tester.state())).toEqual(originalFilters);
    });
});
