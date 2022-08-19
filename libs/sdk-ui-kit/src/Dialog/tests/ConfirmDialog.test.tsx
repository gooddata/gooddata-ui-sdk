// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";

import { ConfirmDialog } from "../ConfirmDialog";

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
