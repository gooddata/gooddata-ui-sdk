// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { CoreHeadline } from "../CoreHeadline.js";
import { Headline } from "../Headline.js";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
vi.mock("../CoreHeadline", () => ({
    CoreHeadline: vi.fn(() => null),
}));

describe("Headline", () => {
    it("should render with custom SDK", async () => {
        render(<Headline workspace="foo" primaryMeasure={ReferenceMd.Amount} backend={dummyBackend()} />);
        await waitFor(() => {
            expect(CoreHeadline).toHaveBeenCalled();
        });
    });
});
