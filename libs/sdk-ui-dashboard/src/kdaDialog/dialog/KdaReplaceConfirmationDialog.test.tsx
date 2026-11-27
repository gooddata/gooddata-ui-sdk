// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { createInternalIntl } from "../../presentation/localization/createInternalIntl.js";

import { KdaReplaceConfirmationDialog } from "./KdaReplaceConfirmationDialog.js";

function renderDialog() {
    const intl = createInternalIntl();
    render(
        <RawIntlProvider value={intl}>
            <KdaReplaceConfirmationDialog isOpen onCancel={vi.fn()} onConfirm={vi.fn()} />
        </RawIntlProvider>,
    );
    return intl;
}

describe("KdaReplaceConfirmationDialog", () => {
    it("names the dialog by its title and describes it by its message", () => {
        const intl = renderDialog();
        const headline = intl.formatMessage({ id: "kdaDialog.replaceConfirmation.headline" });
        const message = intl.formatMessage({ id: "kdaDialog.replaceConfirmation.message" });

        // The overlay is visibility:hidden in jsdom until it is positioned, hence `hidden: true`
        // and checking the referenced elements instead of the computed name and description.
        const dialog = screen.getByRole("dialog", { hidden: true });
        const labelledBy = dialog.getAttribute("aria-labelledby");
        const describedBy = dialog.getAttribute("aria-describedby");

        expect(labelledBy).toBeTruthy();
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(labelledBy!)).toHaveTextContent(headline);
        expect(document.getElementById(describedBy!)).toHaveTextContent(message);
    });

    it("describes the initially focused close button by the message, not by the title", () => {
        const intl = renderDialog();
        const message = intl.formatMessage({ id: "kdaDialog.replaceConfirmation.message" });

        const dialog = screen.getByRole("dialog", { hidden: true });
        const closeButton = screen.getByTestId("close_dialog");
        expect(closeButton).toHaveAttribute("aria-label", "Close dialog");
        expect(closeButton).toHaveAttribute("aria-describedby", dialog.getAttribute("aria-describedby"));
        expect(closeButton).not.toHaveAttribute("aria-describedby", dialog.getAttribute("aria-labelledby"));
        expect(document.getElementById(closeButton.getAttribute("aria-describedby")!)).toHaveTextContent(
            message,
        );
    });
});
