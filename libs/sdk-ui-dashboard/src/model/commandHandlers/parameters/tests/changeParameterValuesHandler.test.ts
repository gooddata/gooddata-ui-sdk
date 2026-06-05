// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { changeParameterValues } from "../../../commands/parameters.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { selectParameterRuntimeOverrideByRef } from "../../../store/tabs/parameters/parametersSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("changeParameterValues handler", () => {
    const topNRef = idRef("topN", "parameter");
    const topNParameter: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
    };

    let Tester: DashboardTester;
    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
    });

    it("sets the runtime override for a parameter present on the active tab", async () => {
        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(3);
    });

    it("ignores values for parameters not present on the active tab (no-op)", async () => {
        const unknownRef = idRef("unknown", "parameter");

        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: unknownRef, value: 9 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        expect(selectParameterRuntimeOverrideByRef(unknownRef)(Tester.state())).toBeUndefined();
        expect(selectParameterRuntimeOverrideByRef(topNRef)(Tester.state())).toBe(5);
    });
});
