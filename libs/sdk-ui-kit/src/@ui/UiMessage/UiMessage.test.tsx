// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IUiMessageProps, UiMessage } from "./UiMessage.js";

const messages = {
    close: "Close",
    "uiKit.message.showMore": "Show more",
    "uiKit.message.showLess": "Show less",
};

const renderMessage = (props: Partial<IUiMessageProps> = {}) =>
    render(
        <IntlProvider locale="en-US" messages={messages}>
            <UiMessage dataTestId="message" {...props}>
                {props.children ?? "Title"}
            </UiMessage>
        </IntlProvider>,
    );

describe("UiMessage", () => {
    it("renders the text as an info status by default", () => {
        renderMessage();

        expect(screen.getByRole("status")).toHaveTextContent("Title");
        const message = screen.getByTestId("message");
        expect(message).toHaveClass("gd-ui-kit-message--variant-info");
        expect(message).toHaveClass("gd-ui-kit-message--size-medium");
        expect(message).toHaveClass("gd-ui-kit-message--width-hug");
    });

    it.each(["success", "warning", "error"] as const)("applies the %s variant", (variant) => {
        renderMessage({ variant });

        expect(screen.getByTestId("message")).toHaveClass(`gd-ui-kit-message--variant-${variant}`);
    });

    it.each([
        ["info", "status"],
        ["success", "status"],
        ["warning", "alert"],
        ["error", "alert"],
    ] as const)("announces the %s variant as %s", (variant, role) => {
        renderMessage({ variant });

        expect(screen.getByRole(role)).toHaveTextContent("Title");
    });

    it("keeps the toggle and close button outside the live region", () => {
        renderMessage({ detail: "More text", onClose: vi.fn() });

        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toHaveTextContent(/^Title$/);
        expect(liveRegion).not.toContainElement(screen.getByRole("button", { name: "Show more" }));
    });

    it("shows no close button without onClose", () => {
        renderMessage();

        expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("shows a close button that calls onClose", () => {
        const onClose = vi.fn();
        renderMessage({ onClose });

        fireEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("uses the custom close button label", () => {
        renderMessage({ onClose: vi.fn(), accessibilityConfig: { closeButtonLabel: "Dismiss the hint" } });

        expect(screen.getByRole("button", { name: "Dismiss the hint" })).toBeInTheDocument();
    });

    it.each([
        ["undefined", undefined],
        ["null", null],
        ["false", false],
        ["an empty string", ""],
    ])("renders no toggle when detail is %s", (_, detail) => {
        renderMessage({ detail });

        expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    });

    it("expands and collapses the detail on its own", () => {
        const onExpandedChange = vi.fn();
        renderMessage({ detail: "More text", onExpandedChange });

        const toggle = screen.getByRole("button", { name: "Show more" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText("More text")).not.toBeVisible();

        fireEvent.click(toggle);

        expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("More text")).toBeVisible();
        expect(onExpandedChange).toHaveBeenLastCalledWith(true);

        fireEvent.click(screen.getByRole("button", { name: "Show less" }));

        expect(screen.getByText("More text")).not.toBeVisible();
        expect(onExpandedChange).toHaveBeenLastCalledWith(false);
    });

    it("follows the controlled isExpanded prop", () => {
        const onExpandedChange = vi.fn();
        renderMessage({ detail: "More text", isExpanded: true, onExpandedChange });

        expect(screen.getByText("More text")).toBeVisible();

        fireEvent.click(screen.getByRole("button", { name: "Show less" }));

        expect(onExpandedChange).toHaveBeenCalledWith(false);
        expect(screen.getByText("More text")).toBeVisible();
    });

    it("links the toggle to the detail it controls", () => {
        renderMessage({ detail: "More text" });

        const toggle = screen.getByRole("button", { name: "Show more" });
        expect(screen.getByText("More text")).toHaveAttribute("id", toggle.getAttribute("aria-controls"));
    });

    it("lets the role be overridden", () => {
        renderMessage({ variant: "error", accessibilityConfig: { role: "status" } });

        expect(screen.getByRole("status")).toHaveTextContent("Title");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
