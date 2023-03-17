// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { Treemap } from "../Treemap";
import { CoreTreemap } from "../CoreTreemap";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreTreemap", () => ({
    CoreTreemap: jest.fn(() => null),
}));

describe("Treemap", () => {
    it("should render with custom SDK", () => {
        render(<Treemap workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreTreemap).toHaveBeenCalled();
    });
});
