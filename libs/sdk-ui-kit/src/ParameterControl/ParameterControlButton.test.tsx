// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterDefinition } from "@gooddata/sdk-model";
import { withIntlForTest } from "@gooddata/sdk-ui";

import { ParameterControlButton } from "./ParameterControlButton.js";

const WrappedParameterControlButton = withIntlForTest(ParameterControlButton);

const numberDefinition: IParameterDefinition = { type: "NUMBER", defaultValue: 10 };

const freeTextDefinition: IParameterDefinition = { type: "STRING", defaultValue: "Actual" };

const constrainedDefinition: IParameterDefinition = {
    type: "STRING",
    defaultValue: "actual",
    constraints: {
        allowedValues: [
            { value: "actual", title: "Actual" },
            { value: "budget", title: "Budget Plan" },
            { value: "forecast" },
        ],
    },
};

const renderButton = (props: Partial<React.ComponentProps<typeof ParameterControlButton>> = {}) => {
    return render(
        <WrappedParameterControlButton
            name="Threshold"
            definition={numberDefinition}
            value={25}
            isActive={false}
            onClick={() => {}}
            {...props}
        />,
    );
};

describe("ParameterControlButton", () => {
    it("renders the parameter name as the title", () => {
        renderButton({ name: "Threshold" });
        expect(screen.getByText("Threshold")).toBeInTheDocument();
    });

    it("renders the value-label subtitle with the formatted value", () => {
        const { container } = renderButton({ value: 42 });
        expect(container.textContent).toContain("is 42");
    });

    it("renders a free-text string value in the subtitle", () => {
        const { container } = renderButton({ definition: freeTextDefinition, value: "Budget" });
        expect(container.textContent).toContain("is Budget");
    });

    it("shows the allowed value title, never the raw value, for a constrained STRING parameter", () => {
        renderButton({ definition: constrainedDefinition, value: "budget" });
        expect(screen.getByRole("button")).toHaveAccessibleName("Threshold is Budget Plan");
    });

    it("falls back to the raw value when the allowed value has no title", () => {
        renderButton({ definition: constrainedDefinition, value: "forecast" });
        expect(screen.getByRole("button")).toHaveAccessibleName("Threshold is forecast");
    });

    it("delegates rendering to UiControlButton (role=button, dialog popup)", () => {
        renderButton();
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
    });

    it("reflects isActive as aria-expanded", () => {
        renderButton({ isActive: true });
        expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    it("forwards dropdownId as aria-controls while active", () => {
        renderButton({ isActive: true, dropdownId: "drop-id" });
        expect(screen.getByRole("button")).toHaveAttribute("aria-controls", "drop-id");
    });

    it("calls onClick when clicked", () => {
        const onClick = vi.fn();
        renderButton({ onClick });
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("enters the warning state and wires the tooltip when warningTooltip is set", () => {
        renderButton({ warningTooltip: "Out of range" });
        const button = screen.getByRole("button");
        expect(button.className).toMatch(/gd-ui-kit-control-button--isWarning/);
        expect(button).toHaveAttribute("aria-describedby");
    });

    it("renders no warning state when warningTooltip is omitted", () => {
        renderButton();
        const button = screen.getByRole("button");
        expect(button.className).not.toMatch(/gd-ui-kit-control-button--isWarning/);
        expect(button).not.toHaveAttribute("aria-describedby");
    });
});
