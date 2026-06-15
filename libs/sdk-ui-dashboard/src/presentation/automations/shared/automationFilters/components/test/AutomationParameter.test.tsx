// (C) 2026 GoodData Corporation

import { type ComponentProps } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { AutomationParameter } from "../AutomationParameter.js";

function renderChip(custom: Partial<ComponentProps<typeof AutomationParameter>> = {}) {
    const props: ComponentProps<typeof AutomationParameter> = {
        parameter: {
            ref: idRef("topN", "parameter"),
            title: "Top N",
            value: 5,
            mode: "active",
            constraints: { min: 1, max: 10 },
        },
        onChange: vi.fn(),
        onDelete: vi.fn(),
        ...custom,
    };
    render(
        <IntlWrapper>
            <AutomationParameter {...props} />
        </IntlWrapper>,
    );
    return props;
}

describe("AutomationParameter", () => {
    it("renders the chip label as '{title} is {value}'", () => {
        renderChip();

        expect(screen.getByText("Top N is 5")).toBeInTheDocument();
    });

    it("calls onDelete with the parameter ref when the delete button is clicked (active mode)", () => {
        const { onDelete } = renderChip();

        fireEvent.click(screen.getByTestId("automation-parameter-topN-delete-button"));

        expect(onDelete).toHaveBeenCalledWith(idRef("topN", "parameter"));
    });

    it("renders a readonly parameter as locked, without a delete button", () => {
        renderChip({
            parameter: { ref: idRef("topN", "parameter"), title: "Top N", value: 5, mode: "readonly" },
        });

        expect(screen.getByText("Top N is 5")).toBeInTheDocument();
        expect(screen.queryByTestId("automation-parameter-topN-delete-button")).toBeNull();
    });
});
