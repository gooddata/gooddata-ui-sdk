// (C) 2007-2023 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop";

import { ArrowButton } from "../ArrowButton";

describe("ArrowButton", () => {
    describe("when not disabled", () => {
        it("should not disable the button", () => {
            render(<ArrowButton onClick={noop} arrowDirection="increment" />);

            expect(screen.getByRole("button", { hidden: true })).not.toBeDisabled();
        });

        it("should call the onClick handler when clicked", () => {
            const onClick = jest.fn();
            render(<ArrowButton onClick={onClick} arrowDirection="increment" />);

            fireEvent.click(screen.getByRole("button", { hidden: true }));

            expect(onClick).toBeCalled();
        });
    });

    describe("when disabled", () => {
        it("should disable the button", () => {
            render(<ArrowButton onClick={noop} arrowDirection="increment" disabled={true} />);

            expect(screen.getByRole("button", { hidden: true })).toBeDisabled();
        });

        it("should not call the onClick handler when clicked", () => {
            const onClick = jest.fn();
            render(<ArrowButton onClick={onClick} arrowDirection="increment" disabled={true} />);

            fireEvent.click(screen.getByRole("button", { hidden: true }));

            expect(onClick).not.toBeCalled();
        });
    });
});
