// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { CoreScatterPlot } from "../CoreScatterPlot.js";
import { ScatterPlot } from "../ScatterPlot.js";

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
