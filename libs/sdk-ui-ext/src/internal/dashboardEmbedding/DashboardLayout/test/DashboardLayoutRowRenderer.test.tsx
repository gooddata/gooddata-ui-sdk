// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { FluidLayoutFacade } from "@gooddata/sdk-backend-spi";
import { FluidLayoutRowRenderer } from "../../FluidLayout";
import { DashboardLayoutRowRenderer } from "../DashboardLayoutRowRenderer";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

const dashboardLayoutFacade = FluidLayoutFacade.for(
    dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("tableId", "table")]])]),
);

describe("DashboardLayoutRowRenderer", () => {
    it("should add debug css class in debug mode", () => {
        const wrapper = shallow(
            <DashboardLayoutRowRenderer
                DefaultRenderer={FluidLayoutRowRenderer}
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
