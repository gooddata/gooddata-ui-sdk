// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import { KpiError } from "../KpiError";

describe("KpiError", () => {
    it("should render with correct message", () => {
        const message = "ERROR!";
        const { queryByText } = render(<KpiError message={message} />);

        expect(queryByText("ERROR!")).toBeInTheDocument();
    });
});
