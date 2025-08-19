// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { CoreHeatmap } from "../CoreHeatmap.js";
import { Heatmap } from "../Heatmap.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreHeatmap", () => ({
    CoreHeatmap: vi.fn(() => null),
}));

describe("Heatmap", () => {
    it("should render with custom SDK", () => {
        render(<Heatmap workspace="foo" measure={ReferenceMd.Amount} backend={dummyBackend()} />);
        expect(CoreHeatmap).toHaveBeenCalled();
    });
});
