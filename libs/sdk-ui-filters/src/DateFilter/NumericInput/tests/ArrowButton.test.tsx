// (C) 2007-2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import noop from "lodash/noop.js";
import { describe, expect, it, vi } from "vitest";

import { ArrowButton } from "../ArrowButton.js";

describe("ArrowButton", () => {
    describe("when not disabled", () => {
        it("should not disable the button", () => {
            render(<ArrowButton onClick={noop} arrowDirection="increment" />);

            expect(screen.getByRole("button", { hidden: true })).not.toBeDisabled();
        });

        it("should call the onClick handler when clicked", () => {
            const onClick = vi.fn();
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
            const onClick = vi.fn();
            render(<ArrowButton onClick={onClick} arrowDirection="increment" disabled={true} />);

            fireEvent.click(screen.getByRole("button", { hidden: true }));

            expect(onClick).not.toBeCalled();
        });
    });
});
