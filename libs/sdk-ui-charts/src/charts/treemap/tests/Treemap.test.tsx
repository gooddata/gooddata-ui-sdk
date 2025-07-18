// (C) 2007-2025 GoodData Corporation
import { render } from "@testing-library/react";
import { Treemap } from "../Treemap.js";
import { CoreTreemap } from "../CoreTreemap.js";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { describe, it, expect, vi } from "vitest";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreTreemap", () => ({
    CoreTreemap: vi.fn(() => null),
}));

describe("Treemap", () => {
    it("should render with custom SDK", () => {
        render(<Treemap workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreTreemap).toHaveBeenCalled();
    });
});
