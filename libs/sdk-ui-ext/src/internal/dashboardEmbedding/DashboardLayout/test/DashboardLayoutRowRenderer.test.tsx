// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { FluidLayoutRowRenderer } from "../../FluidLayout";
import { DashboardLayoutRowRenderer } from "../DashboardLayoutRowRenderer";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

const dashboardLayout = dashboardLayoutMock([dashboardRowMock([[dashboardWidgetMock("tableId", "table")]])]);

describe("DashboardLayoutRowRenderer", () => {
    it("should add style for each even row in debug mode", () => {
        const wrapper = shallow(
            <DashboardLayoutRowRenderer row={dashboardLayout.rows[0]} rowIndex={0} screen="xl" debug>
                Test
            </DashboardLayoutRowRenderer>,
        );

        expect(wrapper.find(FluidLayoutRowRenderer)).toHaveStyle("backgroundColor", "#F2F2F2");
    });

    it("should add style for each odd row in debug mode", () => {
        const wrapper = shallow(
            <DashboardLayoutRowRenderer row={dashboardLayout.rows[0]} rowIndex={1} screen="xl" debug>
                Test
            </DashboardLayoutRowRenderer>,
        );

        expect(wrapper.find(FluidLayoutRowRenderer)).toHaveStyle("backgroundColor", "#FFFFFF");
    });
});
