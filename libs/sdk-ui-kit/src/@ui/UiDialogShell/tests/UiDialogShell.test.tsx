// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiDialogFooter } from "../UiDialogFooter.js";
import { UiDialogHeader } from "../UiDialogHeader.js";
import { UiDialogShell } from "../UiDialogShell.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiDialogShell", () => {
    it("renders children inside the shell", () => {
        renderWithIntl(
            <UiDialogShell dataTestId="shell">
                <div>content</div>
            </UiDialogShell>,
        );
        expect(screen.getByTestId("shell")).toBeInTheDocument();
        expect(screen.getByText("content")).toBeInTheDocument();
    });

    it("applies the supplied width to the root", () => {
        renderWithIntl(
            <UiDialogShell width={420} dataTestId="shell">
                <span />
            </UiDialogShell>,
        );
        expect(screen.getByTestId("shell").style.width).toBe("420px");
    });

    it("uses the rendered header as the dialog accessible name", () => {
        renderWithIntl(
            <UiDialogShell>
                <UiDialogHeader title="Hello" />
            </UiDialogShell>,
        );
        expect(screen.getByRole("dialog", { name: "Hello" })).toBeInTheDocument();
    });

    it("uses ariaLabel without generating aria-labelledby when no header exists", () => {
        renderWithIntl(
            <UiDialogShell accessibilityConfig={{ ariaLabel: "Standalone dialog" }}>
                <div>content</div>
            </UiDialogShell>,
        );
        const dialog = screen.getByRole("dialog", { name: "Standalone dialog" });
        expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("emits aria-labelledby by default — UiDialogHeader sets the matching id via context", () => {
        // The shell always emits aria-labelledby (set to the same id UiDialogHeader's <h2>
        // will use). Callers who do not render UiDialogHeader must pass accessibilityConfig.ariaLabel
        // or ariaLabelledBy themselves; otherwise the reference dangles and screen readers fall
        // back to visible content. This avoids guessing at the children tree at render time.
        renderWithIntl(
            <UiDialogShell dataTestId="shell">
                <div>content</div>
            </UiDialogShell>,
        );
        expect(screen.getByTestId("shell")).toHaveAttribute("aria-labelledby");
    });

    it("respects an externally supplied ariaLabelledBy", () => {
        renderWithIntl(
            <UiDialogShell accessibilityConfig={{ ariaLabelledBy: "external-id" }} dataTestId="shell">
                <div>content</div>
            </UiDialogShell>,
        );
        expect(screen.getByTestId("shell")).toHaveAttribute("aria-labelledby", "external-id");
    });
});

describe("UiDialogHeader", () => {
    it("renders the title", () => {
        renderWithIntl(<UiDialogHeader title="Hello" />);
        expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("does not render an X button when onClose is omitted", () => {
        renderWithIntl(<UiDialogHeader title="Hello" />);
        expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });

    it("calls onClose when the X button is clicked", () => {
        const onClose = vi.fn();
        renderWithIntl(<UiDialogHeader title="Hello" onClose={onClose} />);
        fireEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders the leading slot when provided", () => {
        renderWithIntl(<UiDialogHeader title="Hello" leading={<button>back</button>} />);
        expect(screen.getByRole("button", { name: "back" })).toBeInTheDocument();
    });

    it("applies the size modifier on the title", () => {
        const { container } = renderWithIntl(<UiDialogHeader title="Hello" titleSize="large" />);
        expect(container.querySelector(".gd-ui-kit-dialog-header__title--size-large")).toBeInTheDocument();
    });
});

describe("UiDialogFooter", () => {
    it("renders children", () => {
        renderWithIntl(
            <UiDialogFooter>
                <button>ok</button>
            </UiDialogFooter>,
        );
        expect(screen.getByRole("button", { name: "ok" })).toBeInTheDocument();
    });

    it("applies the divider modifier when divider is true", () => {
        const { container } = renderWithIntl(
            <UiDialogFooter divider>
                <button>ok</button>
            </UiDialogFooter>,
        );
        expect(container.querySelector(".gd-ui-kit-dialog-footer--divider")).toBeInTheDocument();
    });

    it("omits the divider modifier by default", () => {
        const { container } = renderWithIntl(
            <UiDialogFooter>
                <button>ok</button>
            </UiDialogFooter>,
        );
        expect(container.querySelector(".gd-ui-kit-dialog-footer--divider")).not.toBeInTheDocument();
    });
});
