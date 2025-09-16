// (C) 2007-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { CoreDonutChart } from "../CoreDonutChart.js";
import { DonutChart } from "../DonutChart.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreDonutChart", () => ({
    CoreDonutChart: vi.fn(() => null),
}));

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        render(<DonutChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreDonutChart).toHaveBeenCalled();
    });
});
