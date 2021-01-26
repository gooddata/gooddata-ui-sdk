// (C) 2019-2020 GoodData Corporation
import React from "react";
import add from "lodash/add";
import { mount } from "enzyme";
import { FluidLayout } from "../FluidLayout";
import { FluidLayoutColumn } from "../FluidLayoutColumn";
import { FluidLayoutRow } from "../FluidLayoutRow";
import { createFluidLayoutMock } from "./fixtures";

describe("FluidLayout", () => {
    it.each([
        ["is empty", [0]],
        ["has 1 row with 1 column", [1]],
        ["has 5 rows with various columns count", [5, 3, 0, 2, 1]],
    ])("should render fluid layout when layout %s", (_testCase: string, columnsCountInRow: number[]) => {
        const layout = createFluidLayoutMock(columnsCountInRow);
        const wrapper = mount(
            <FluidLayout layout={layout} contentRenderer={({ column }) => <div>{column.content}</div>} />,
        );

        expect(wrapper.find(FluidLayoutRow)).toHaveLength(columnsCountInRow.length);
        expect(wrapper.find(FluidLayoutColumn)).toHaveLength(columnsCountInRow.reduce(add, 0));
    });
});
