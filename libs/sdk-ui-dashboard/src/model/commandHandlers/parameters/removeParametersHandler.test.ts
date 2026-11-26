// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { removeParameters } from "../../commands/parameters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../events/general.js";
import { type IDashboardParametersRemoved } from "../../events/parameters.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectDashboardParameters } from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";

describe("removeParameters handler", () => {
    const topNParameter: IDashboardParameter = {
        ref: idRef("topN", "parameter"),
        parameterType: "NUMBER",
        mode: "active",
    };
    const scenarioParameter: IDashboardParameter = {
        ref: idRef("scenario", "parameter"),
        parameterType: "STRING",
        mode: "active",
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
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        Tester.dispatch(
            tabsActions.addParameter({ parameter: scenarioParameter, workspaceDefault: "Actual" }),
        );
    });

    it("removes the parameters from the active tab", async () => {
        const event: IDashboardParametersRemoved = await Tester.dispatchAndWaitFor(
            removeParameters([topNParameter.ref], activeTab()),
            "GDC.DASH/EVT.PARAMETERS.REMOVED",
        );

        expect(event.payload.refs).toEqual([topNParameter.ref]);
        expect(selectDashboardParameters(Tester.state())).toEqual([scenarioParameter]);
    });

    it("fails and removes nothing when a parameter is not on the active tab", async () => {
        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            removeParameters([topNParameter.ref, idRef("unknown", "parameter")], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameters(Tester.state())).toEqual([topNParameter, scenarioParameter]);
    });

    it("fails and removes nothing when a ref has a different type than the parameter", async () => {
        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            removeParameters([idRef("topN", "insight"), scenarioParameter.ref], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameters(Tester.state())).toEqual([topNParameter, scenarioParameter]);
    });

    it("fails and removes nothing when a ref is repeated", async () => {
        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            removeParameters([topNParameter.ref, topNParameter.ref], activeTab()),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameters(Tester.state())).toEqual([topNParameter, scenarioParameter]);
    });

    it("fails and removes nothing when the tab is not the active tab", async () => {
        const event: IDashboardCommandFailed = await Tester.dispatchAndWaitFor(
            removeParameters([topNParameter.ref], "otherTab"),
            "GDC.DASH/EVT.COMMAND.FAILED",
        );

        expect(event.payload.reason).toEqual("USER_ERROR");
        expect(selectDashboardParameters(Tester.state())).toEqual([topNParameter, scenarioParameter]);
    });

    function activeTab(): string {
        return selectActiveOrDefaultTabLocalIdentifier(Tester.state());
    }
});
