// (C) 2020-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";

import { FormattedPreview, IFormattedPreviewProps } from "../FormattedPreview";

describe("FormattedPreview", () => {
    function renderComponent(props: Partial<IFormattedPreviewProps> = {}) {
        const defaultProps: IFormattedPreviewProps = {
            previewNumber: 1234.56,
            format: "#.##",
            separators: {
                decimal: ",",
                thousand: " ",
            },
        };

        return render(<FormattedPreview {...defaultProps} {...props} />);
    }

    it("should render formatted value", () => {
        renderComponent();

        expect(screen.getByText("1234,56")).toBeInTheDocument();
    });

    it("should render formatted number with colors when coloring is enabled", () => {
        renderComponent({ format: "[>1][green]#,##" });

        expect(screen.getByText("1 235")).toBeInTheDocument();
        expect(screen.getByText("1 235")).toHaveStyle({ color: "#00AA00" });
    });

    it("should render formatted number without colors when coloring is disabled", () => {
        renderComponent({ format: "[>1][GREEN]#,##", colors: false });
        expect(screen.getByText("1 235")).toBeInTheDocument();
        expect(screen.getByText("1 235")).not.toHaveAttribute("style");
    });

    it("should format null value properly if no value is provided", () => {
        renderComponent({
            previewNumber: null,
            format: "[=NULL]value is null",
            colors: false,
        });
        expect(screen.getByText("value is null")).toBeInTheDocument();
    });
});
