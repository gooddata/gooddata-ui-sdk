// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";

import { KpiError } from "../KpiError";

describe("KpiError", () => {
    it("should render with correct message", () => {
        const message = "ERROR!";
        render(<KpiError message={message} />);

        expect(screen.queryByText("ERROR!")).toBeInTheDocument();
    });
});
