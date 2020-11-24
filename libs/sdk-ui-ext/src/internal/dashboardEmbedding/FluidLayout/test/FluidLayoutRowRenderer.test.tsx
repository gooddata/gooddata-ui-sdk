// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Row } from "react-grid-system";
import { FluidLayoutRowRenderer } from "../FluidLayoutRowRenderer";
import { layoutRowWithOneColumn } from "./fixtures";

describe("FluidLayoutRowRenderer", () => {
    it("should propagate className", () => {
        const className = "test";
        const wrapper = shallow(
            <FluidLayoutRowRenderer
                row={layoutRowWithOneColumn}
                rowIndex={0}
                screen="xl"
                className={className}
            >
                Test
            </FluidLayoutRowRenderer>,
        );

        expect(wrapper.find(Row)).toHaveClassName(className);
    });

    it("should propagate other Row props", () => {
        const style = { backgroundColor: "red" };
        const wrapper = shallow(
            <FluidLayoutRowRenderer row={layoutRowWithOneColumn} rowIndex={0} screen="xl" style={style}>
                Test
            </FluidLayoutRowRenderer>,
        );

        expect(wrapper.find(Row)).toHaveStyle(style);
    });
});
