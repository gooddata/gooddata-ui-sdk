// (C) 2007-2025 GoodData Corporation
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { ConfirmDialog } from "../ConfirmDialog.js";

describe("ConfirmDialog", () => {
    it("should render content", () => {
        render(
            <ConfirmDialog className="confirmDialogTest" containerClassName="containerTestClass">
                ReactConfirmDialog content
            </ConfirmDialog>,
        );
        expect(screen.getByText("ReactConfirmDialog content")).toBeInTheDocument();
    });
});
