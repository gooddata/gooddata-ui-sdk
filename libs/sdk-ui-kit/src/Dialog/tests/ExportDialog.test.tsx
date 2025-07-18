// (C) 2007-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { ExportDialog } from "../ExportDialog.js";
import { describe, it, expect } from "vitest";

describe("ExportDialog", () => {
    it("should render content with provided classnames", () => {
        render(<ExportDialog className="exportDialogTest" containerClassName="containerTestClass" />);

        expect(screen.getByText("Export")).toBeInTheDocument();
        expect(document.getElementsByClassName("gd-overlay-content")).toHaveLength(1);
        expect(document.getElementsByClassName("exportDialogTest")).toHaveLength(1);
        expect(document.getElementsByClassName("containerTestClass")).toHaveLength(1);
    });
});
