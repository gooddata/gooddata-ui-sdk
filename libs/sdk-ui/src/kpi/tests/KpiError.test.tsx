// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiError } from "../KpiError.js";

describe("KpiError", () => {
    it("should render with correct message", () => {
        const message = "ERROR!";
        render(<KpiError message={message} />);

        expect(screen.queryByText("ERROR!")).toBeInTheDocument();
    });
});
