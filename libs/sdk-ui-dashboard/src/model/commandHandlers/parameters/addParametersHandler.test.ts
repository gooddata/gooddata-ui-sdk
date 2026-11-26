// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { type IScalarParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { addParameters } from "../../commands/parameters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../events/general.js";
import { type IDashboardParametersAdded } from "../../events/parameters.js";
import { catalogActions } from "../../store/catalog/index.js";
import { selectDashboardParameterEntries } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";

describe("addParameters handler", () => {
    const topNRef = idRef("topN", "parameter");
    const scenarioRef = idRef("scenario", "parameter");
    const topNCatalogParameter: IScalarParameterMetadataObject = {
        type: "parameter",
        id: "topN",
        uri: "/topN",
        ref: topNRef,
        title: "Top N",
        description: "",
        production: true,
        deprecated: false,
        unlisted: false,
        definition: { type: "NUMBER", defaultValue: 5 },
    };
    const scenarioCatalogParameter: IScalarParameterMetadataObject = {
        ...topNCatalogParameter,
        id: "scenario",
        uri: "/scenario",
        ref: scenarioRef,
        title: "Scenario",
        definition: { type: "STRING", defaultValue: "Actual" },
    };

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory(
            function setTester(tester) {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            { initCommand: initializeDashboard({ settings: { enableParameters: true } }) },
        );
        Tester.dispatch(
            catalogActions.setCatalogParameters({
                status: "loaded",
                dateRangeParametersStatus: "gated-off",
                dateRangeParameters: [],
                parameters: [topNCatalogParameter, scenarioCatalogParameter],
            }),
        );
    });

    it("adds the parameters to the active tab with their catalog type and default", async () => {
        const event: IDashboardParametersAdded = await Tester.dispatchAndWaitFor(
            addParameters([topNRef, scenarioRef], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.ADDED",
        );

        expect(event.payload.refs).toEqual([topNRef, scenarioRef]);
        expect(selectDashboardParameterEntries(Tester.state())).toEqual([
            { parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" }, runtimeOverride: 5 },
            {
                parameter: { ref: scenarioRef, parameterType: "STRING", mode: "active" },
                runtimeOverride: "Actual",
            },
        ]);
    });

    it("fails and adds nothing when a parameter is not in the catalog", async () => {
        const entriesBefore = selectDashboardParameterEntries(Tester.state());

        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addParameters([topNRef, idRef("unknown", "parameter")], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameterEntries(Tester.state())).toEqual(entriesBefore);
    });

    it("fails and adds nothing when a parameter is already on the active tab", async () => {
        await Tester.dispatchAndWaitFor(
            addParameters([topNRef], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.ADDED",
        );
        const entriesBefore = selectDashboardParameterEntries(Tester.state());

        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addParameters([scenarioRef, topNRef], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameterEntries(Tester.state())).toEqual(entriesBefore);
    });

    it("fails and adds nothing when a ref is repeated", async () => {
        const entriesBefore = selectDashboardParameterEntries(Tester.state());

        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addParameters([topNRef, topNRef], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameterEntries(Tester.state())).toEqual(entriesBefore);
    });

    it("fails and adds nothing when the tab is not the active tab", async () => {
        const entriesBefore = selectDashboardParameterEntries(Tester.state());

        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            addParameters([topNRef], "otherTab"),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameterEntries(Tester.state())).toEqual(entriesBefore);
    });

    function activeTab(): string {
        return selectActiveOrDefaultTabLocalIdentifier(Tester.state());
    }
});
