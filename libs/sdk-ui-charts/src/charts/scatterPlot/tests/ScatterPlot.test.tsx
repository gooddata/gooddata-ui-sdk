// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { ScatterPlot } from "../ScatterPlot.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { CoreScatterPlot } from "../CoreScatterPlot.js";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect, vi } from "vitest";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreScatterPlot", () => ({
    CoreScatterPlot: vi.fn(() => null),
}));

describe("ScatterPlot", () => {
    it("should render with custom SDK", () => {
        render(<ScatterPlot workspace="foo" backend={dummyBackend()} xAxisMeasure={ReferenceMd.Amount} />);
        expect(CoreScatterPlot).toHaveBeenCalled();
    });
});
