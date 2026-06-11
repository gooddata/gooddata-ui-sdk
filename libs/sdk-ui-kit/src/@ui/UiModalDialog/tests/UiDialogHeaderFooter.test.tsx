// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiDialogFooter } from "../UiDialogFooter.js";
import { UiDialogHeader } from "../UiDialogHeader.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

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
