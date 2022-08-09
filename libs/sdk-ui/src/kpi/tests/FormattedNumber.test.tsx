// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { FormattedNumber } from "../FormattedNumber";

describe("FormattedNumber", () => {
    it("should format number with default format", () => {
        const { getByText } = render(<FormattedNumber value="10.2402" />);
        expect(getByText("10.24")).toBeInTheDocument();
    });

    it("should format number with provided format and separators", () => {
        const { getByText } = render(
            <FormattedNumber
                value="10000.2402"
                format="#,#.#"
                separators={{ thousand: ",", decimal: "@" }}
            />,
        );
        expect(getByText("10,000@2")).toBeInTheDocument();
    });

    it("should be colored when formatting contains colors", () => {
        const { getByText } = render(<FormattedNumber value="10" format="[color=99AE00]" />);
        // 99AE00 is rgb(153, 174, 0)
        expect(getByText("10")).toHaveAttribute("style", "color: rgb(153, 174, 0);");
    });
});
