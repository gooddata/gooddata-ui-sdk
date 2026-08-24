// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

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
            onCancel={() => {}}
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
});
