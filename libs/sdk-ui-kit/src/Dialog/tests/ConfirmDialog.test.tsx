// (C) 2007-2025 GoodData Corporation
import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
