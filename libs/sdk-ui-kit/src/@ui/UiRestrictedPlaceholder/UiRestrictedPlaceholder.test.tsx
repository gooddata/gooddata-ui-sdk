// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { UiRestrictedPlaceholder } from "./UiRestrictedPlaceholder.js";

const title = "You don't have access";
const description = "Contact your administrator to request access.";

describe("UiRestrictedPlaceholder", () => {
    it("shows recovery guidance without a duplicate tooltip or tab stop in default mode", async () => {
        render(
            <>
                <UiRestrictedPlaceholder title={title} description={description} />
                <button type="button">Continue</button>
            </>,
        );
        const user = userEvent.setup();

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toBeInTheDocument();

        await user.tab();
        expect(screen.getByRole("button", { name: "Continue" })).toHaveFocus();
        await user.hover(screen.getByText(title));
        expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    });

    it("keeps compact recovery guidance available to assistive technology", () => {
        render(<UiRestrictedPlaceholder title={title} description={description} size="compact" />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(description)).toHaveClass("sr-only");
        expect(screen.getByRole("status")).toHaveTextContent(description);
    });

    it("shows compact recovery guidance on keyboard focus and dismisses it with Escape", async () => {
        render(<UiRestrictedPlaceholder title={title} description={description} size="compact" />);
        const user = userEvent.setup();

        await user.tab();

        expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent(description);
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
    });

    it("shows recovery guidance on hover", async () => {
        render(<UiRestrictedPlaceholder title={title} description={description} size="compact" />);

        await userEvent.setup().hover(screen.getByText(title));

        expect(await screen.findByRole("tooltip", { hidden: true })).toHaveTextContent(description);
    });

    it("reports itself as a status, so the reason is not for the eye alone", () => {
        render(
            <UiRestrictedPlaceholder
                title={title}
                description={description}
                dataTestId="restricted-placeholder"
            />,
        );

        const placeholder = screen.getByTestId("restricted-placeholder");
        expect(placeholder).toHaveAttribute("role", "status");
        expect(placeholder).toHaveTextContent(title);
    });
});
