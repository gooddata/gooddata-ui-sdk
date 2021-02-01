// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FluidLayoutFacade } from "@gooddata/sdk-backend-spi";
import { Col } from "react-grid-system";
import { FluidLayoutColumn } from "../FluidLayoutColumn";
import { fluidLayoutWithOneColumn, TextLayoutColumnRenderer, TextLayoutContentRenderer } from "./fixtures";

const customColumnRendererClass = "s-column-renderer";
const customContentRendererClass = "s-column-renderer";

const customColumnRenderer: TextLayoutColumnRenderer = ({ children }) => (
    <div className={customColumnRendererClass}>{children}</div>
);
const customContentRenderer: TextLayoutContentRenderer = ({ column }) => (
    <div className={customContentRendererClass}>{column.content()}</div>
);

const layoutFacade = FluidLayoutFacade.for(fluidLayoutWithOneColumn);

describe("FluidLayoutColumn", () => {
    it("should use default column renderer, when columnRenderer prop is not provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                contentRenderer={customContentRenderer}
            />,
        );
        expect(wrapper.find(Col)).toExist();
    });

    it("should use provided column renderer, when columnRenderer prop is provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                columnRenderer={customColumnRenderer}
                contentRenderer={customContentRenderer}
            />,
        );

        expect(wrapper.find(`.${customColumnRendererClass}`)).toExist();
    });

    it("should use provided content renderer", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                contentRenderer={customContentRenderer}
            />,
        );

        expect(wrapper.find(`.${customContentRendererClass}`)).toExist();
    });
});
