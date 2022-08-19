// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { FormattedNumber } from "../FormattedNumber";

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
        expect(screen.getByText("10")).toHaveStyle({ color: "rgb(153, 174, 0)" });
    });
});
