// (C) 2022 GoodData Corporation
import { idRef, KpiDrillDefinition, ObjRef, uriRef } from "@gooddata/sdk-model";
import { ILegacyDashboard } from "../../../../../types";
import { validateKpiDrillTarget } from "../kpiDrillValidationUtils";

describe("validateKpiDrillTarget", () => {
    const mockDashboard: ILegacyDashboard = {
        identifier: "foo",
        ref: uriRef("/gdc/md/foo"),
        tabs: [{ identifier: "tab1", title: "Tab 1" }],
        title: "Sample dashboard",
        uri: "/gdc/md/foo",
    };

    const mockDashboards = [mockDashboard];

    function getDrillDefinition(target: ObjRef, tab: string): KpiDrillDefinition {
        return {
            origin: {
                type: "drillFromMeasure",
                measure: idRef("some.measure"),
            },
            tab,
            target,
            transition: "in-place",
            type: "drillToLegacyDashboard",
        };
    }

    it("should not throw for valid target", () => {
        validateKpiDrillTarget(
            getDrillDefinition(mockDashboard.ref, mockDashboard.tabs[0].identifier),
            mockDashboards,
        );
    });

    it("should throw for not found dashboard", () => {
        expect(() =>
            validateKpiDrillTarget(
                getDrillDefinition(uriRef("missing"), mockDashboard.tabs[0].identifier),
                mockDashboards,
            ),
        ).toThrowErrorMatchingSnapshot();
    });

    it("should throw for invalid tab on an existing dashboard", () => {
        expect(() =>
            validateKpiDrillTarget(getDrillDefinition(mockDashboard.ref, "missing"), mockDashboards),
        ).toThrowErrorMatchingSnapshot();
    });
});
