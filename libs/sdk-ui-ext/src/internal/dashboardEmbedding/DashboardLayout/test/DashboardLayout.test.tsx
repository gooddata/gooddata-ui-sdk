// (C) 2019-2020 GoodData Corporation
import { shallow } from "enzyme";
import React from "react";
import { FluidLayout } from "../../FluidLayout";
import { DashboardLayout } from "../DashboardLayout";
import { dashboardLayoutMock, dashboardRowMock, dashboardWidgetMock } from "../mocks";

describe("DashboardLayout", () => {
    it("should render layout", () => {
        const dashboardLayout = dashboardLayoutMock([
            dashboardRowMock([[dashboardWidgetMock("tableId", "table")]]),
        ]);

        const wrapper = shallow(
            <DashboardLayout
                layout={dashboardLayout}
                contentRenderer={({ column }) => (
                    <div>{`col-${column.index()}-row-${column.row().index()}`}</div>
                )}
            />,
        );

        expect(wrapper.find(FluidLayout)).toHaveLength(1);
    });
});
