// (C) 2007-2023 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import { DonutChart } from "../DonutChart";
import { CoreDonutChart } from "../CoreDonutChart";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceMd } from "@gooddata/reference-workspace";

/**
 * This mock enables us to test props as parameters of the called chart function
 */
jest.mock("../CoreDonutChart", () => ({
    CoreDonutChart: jest.fn(() => null),
}));

describe("DonutChart", () => {
    it("should render with custom SDK", () => {
        render(<DonutChart workspace="foo" backend={dummyBackend()} measures={[ReferenceMd.Amount]} />);
        expect(CoreDonutChart).toHaveBeenCalled();
    });
});
