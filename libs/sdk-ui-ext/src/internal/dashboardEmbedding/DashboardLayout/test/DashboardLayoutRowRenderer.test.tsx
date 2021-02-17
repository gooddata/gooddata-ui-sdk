// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { FluidLayoutRowRenderer } from "../../FluidLayout";
import { DashboardLayoutRowRenderer } from "../DashboardLayoutRowRenderer";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";
import { DashboardViewLayoutFacade } from "../facade/layout";

const dashboardLayoutFacade = DashboardViewLayoutFacade.for(
    dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("tableId", "table")]])]),
);

describe("DashboardLayoutRowRenderer", () => {
    it("should add debug css class in debug mode", () => {
        const wrapper = shallow(
            <DashboardLayoutRowRenderer
                DefaultRowRenderer={FluidLayoutRowRenderer}
                row={dashboardLayoutFacade.rows().row(0)}
                screen="xl"
                debug
            >
                Test
            </DashboardLayoutRowRenderer>,
        );

        expect(wrapper.find(FluidLayoutRowRenderer)).toHaveClassName("gd-fluidlayout-row-debug");
    });
});
