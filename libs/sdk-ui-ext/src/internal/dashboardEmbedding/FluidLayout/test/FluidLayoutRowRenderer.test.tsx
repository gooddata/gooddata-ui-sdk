// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Row } from "react-grid-system";
import { FluidLayoutFacade } from "@gooddata/sdk-backend-spi";
import { FluidLayoutRowRenderer } from "../FluidLayoutRowRenderer";
import { fluidLayoutWithOneColumn } from "./fixtures";

const layoutFacade = FluidLayoutFacade.for(fluidLayoutWithOneColumn);

describe("FluidLayoutRowRenderer", () => {
    it("should propagate className", () => {
        const className = "test";
        const wrapper = shallow(
            <FluidLayoutRowRenderer
                row={layoutFacade.rows().row(0)}
                screen="xl"
                className={className}
                DefaultRenderer={FluidLayoutRowRenderer}
            >
                Test
            </FluidLayoutRowRenderer>,
        );

        expect(wrapper.find(Row)).toHaveClassName(className);
    });
});
