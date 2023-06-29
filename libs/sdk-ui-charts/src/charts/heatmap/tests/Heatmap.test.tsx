// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import { Heatmap } from "../Heatmap.js";
import { CoreHeatmap } from "../CoreHeatmap.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect, vi } from "vitest";

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
