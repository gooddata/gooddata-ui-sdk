// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExportDialog } from "../ExportDialog.js";

describe("ExportDialog", () => {
    it("should render content with provided classnames", () => {
        render(<ExportDialog className="exportDialogTest" containerClassName="containerTestClass" />);

        expect(screen.getByText("Export")).toBeInTheDocument();
        expect(document.getElementsByClassName("gd-overlay-content")).toHaveLength(1);
        expect(document.getElementsByClassName("exportDialogTest")).toHaveLength(1);
        expect(document.getElementsByClassName("containerTestClass")).toHaveLength(1);
    });
});
