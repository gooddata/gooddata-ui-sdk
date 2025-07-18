// (C) 2007-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { FormattedNumber } from "../FormattedNumber.js";
import { describe, expect, it } from "vitest";

describe("FormattedNumber", () => {
    it("should format number with default format", () => {
        render(<FormattedNumber value="10.2402" />);
        expect(screen.getByText("10.24")).toBeInTheDocument();
    });

    it("should format number with provided format and separators", () => {
        render(
            <FormattedNumber
                value="10000.2402"
                format="#,#.#"
                separators={{ thousand: ",", decimal: "@" }}
            />,
        );
        expect(screen.getByText("10,000@2")).toBeInTheDocument();
    });

    it("should be colored when formatting contains colors", () => {
        render(<FormattedNumber value="10" format="[color=99AE00]" />);
        // 99AE00 is rgb(153, 174, 0)
        expect(screen.getByText("10")).toHaveStyle({ color: "#99ae00" });
    });
});
