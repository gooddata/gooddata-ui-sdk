// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { ScatterPlot } from "../ScatterPlot";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreScatterPlot } from "../CoreScatterPlot";
import { ReferenceMd } from "@gooddata/reference-workspace";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreScatterPlot", () => ({
    CoreScatterPlot: jest.fn(() => null),
}));

describe("ScatterPlot", () => {
    it("should render with custom SDK", () => {
        render(<ScatterPlot workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceMd.Amount} />);
        expect(CoreScatterPlot).toHaveBeenCalled();
    });
});
