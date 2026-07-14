// (C) 2007-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { ExportTabularPdfDialog } from "../ExportTabularPdfDialog.js";

const messages = {
    "dialogs.export.pdf.headline": "Export to PDF",
    "dialogs.export.pdf.pageSize": "Page size",
    "dialogs.export.pdf.pageOrientation": "Orientation",
    "dialogs.export.pdf.pageSize.option.a3": "A3",
    "dialogs.export.pdf.pageSize.option.a4": "A4",
    "dialogs.export.pdf.pageSize.option.letter": "Letter",
    "dialogs.export.pdf.pageOrientation.option.portrait": "Portrait",
    "dialogs.export.pdf.pageOrientation.option.landscape": "Landscape",
    "dialogs.export.pdf.includePageExportInfo": "Include page export information",
};

describe("ExportTabularPdfDialog", () => {
    it("associates each PDF export setting label with its dropdown button", () => {
        render(
            <IntlProvider locale="en-US" messages={messages}>
                <ExportTabularPdfDialog />
            </IntlProvider>,
        );

        const pageSizeLabel = screen.getByText("Page size");
        const pageSizeButton = screen.getByLabelText("Page size");
        const orientationLabel = screen.getByText("Orientation");
        const orientationButton = screen.getByLabelText("Orientation");

        expect(pageSizeLabel.tagName).toBe("LABEL");
        expect(pageSizeLabel).toHaveAttribute("for", pageSizeButton.id);
        expect(pageSizeButton).toHaveAttribute("role", "combobox");
        expect(orientationLabel.tagName).toBe("LABEL");
        expect(orientationLabel).toHaveAttribute("for", orientationButton.id);
        expect(orientationButton).toHaveAttribute("role", "combobox");
    });
});
