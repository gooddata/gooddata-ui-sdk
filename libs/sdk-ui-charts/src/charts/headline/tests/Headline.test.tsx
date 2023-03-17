// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { Headline } from "../Headline";
import { CoreHeadline } from "../CoreHeadline";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreHeadline", () => ({
    CoreHeadline: jest.fn(() => null),
}));

describe("Headline", () => {
    it("should render with custom SDK", () => {
        render(<Headline workspace="foo" primaryMeasure={ReferenceMd.Amount} backend={dummyBackend()} />);
        expect(CoreHeadline).toHaveBeenCalled();
    });
});
