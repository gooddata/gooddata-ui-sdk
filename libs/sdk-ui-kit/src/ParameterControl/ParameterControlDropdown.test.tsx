// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { withIntlForTest } from "@gooddata/sdk-ui";

import { ParameterControlDropdown } from "./ParameterControlDropdown.js";

const WrappedParameterControlDropdown = withIntlForTest(ParameterControlDropdown);

const renderDropdown = (props: Partial<React.ComponentProps<typeof ParameterControlDropdown>> = {}) => {
    return render(
        <WrappedParameterControlDropdown
            name="Minimum Deal Size"
            draft="10000"
            onDraftChange={() => {}}
            inputType="text"
            onApply={() => {}}
            onClose={() => {}}
            {...props}
        />,
    );
};

describe("ParameterControlDropdown", () => {
    it("renders the preview with name and value when previewValue is provided", () => {
        renderDropdown({ previewValue: 10000 });
        const preview = screen.getByTestId("parameter-control-dropdown-preview");
        expect(preview).toHaveTextContent("Minimum Deal Size");
        expect(preview).toHaveTextContent("10000");
    });

    it("does not render the preview when previewValue is omitted", () => {
        renderDropdown();
        expect(screen.queryByTestId("parameter-control-dropdown-preview")).not.toBeInTheDocument();
    });

    it("renders the reset button with type button so it does not submit a form", () => {
        renderDropdown({ onReset: () => {} });
        expect(screen.getByTestId("parameter-control-dropdown-reset")).toHaveAttribute("type", "button");
    });

    it("renders Cancel and Apply when onApply is provided", () => {
        renderDropdown({ onApply: () => {} });
        expect(screen.getByTestId("parameter-control-dropdown-cancel")).toBeInTheDocument();
        expect(screen.getByTestId("parameter-control-dropdown-apply")).toBeInTheDocument();
        expect(screen.queryByTestId("parameter-control-dropdown-close")).not.toBeInTheDocument();
    });

    it("renders a single Close button when onApply is omitted", () => {
        const onClose = vi.fn();
        renderDropdown({ onApply: undefined, onClose });
        expect(screen.queryByTestId("parameter-control-dropdown-apply")).not.toBeInTheDocument();
        expect(screen.queryByTestId("parameter-control-dropdown-cancel")).not.toBeInTheDocument();
        const close = screen.getByTestId("parameter-control-dropdown-close");
        expect(close).toHaveTextContent("Close");
        fireEvent.click(close);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
