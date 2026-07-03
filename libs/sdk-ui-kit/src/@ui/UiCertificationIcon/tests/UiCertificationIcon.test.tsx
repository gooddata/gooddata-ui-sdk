// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiCertificationIcon } from "../UiCertificationIcon.js";

const certificationMessages = {
    "uiKit.certification.tooltip.title": "Certified",
    "uiKit.certification.tooltip.certifiedBy": "Certified by",
    "uiKit.certification.tooltip.certifiedAt": "Certified at",
};

const renderWithIntl = (ui: ReactNode) =>
    render(
        <IntlProvider
            locale={DEFAULT_LANGUAGE}
            messages={{ ...DEFAULT_MESSAGES[DEFAULT_LANGUAGE], ...certificationMessages }}
        >
            {ui}
        </IntlProvider>,
    );

describe("UiCertificationIcon", () => {
    it("renders certification icon when certified", () => {
        const { container } = renderWithIntl(<UiCertificationIcon certification={{ status: "CERTIFIED" }} />);

        expect(container.querySelector(".gd-ui-kit-certification-icon")).toBeInTheDocument();
    });

    it("renders certification icon when certified with message and audit details", () => {
        const { container } = renderWithIntl(
            <UiCertificationIcon
                certification={{
                    status: "CERTIFIED",
                    message: "Approved by finance team",
                    certifiedBy: "Jane Doe",
                    certifiedAt: new Date("2026-01-15T10:00:00.000Z"),
                }}
            />,
        );

        expect(container.querySelector(".gd-ui-kit-certification-icon")).toBeInTheDocument();
    });

    it("exposes a keyboard-focusable trigger with accessible label", () => {
        renderWithIntl(<UiCertificationIcon certification={{ status: "CERTIFIED" }} />);

        const trigger = screen.getByLabelText("Certified");
        expect(trigger).toHaveAttribute("tabindex", "0");
    });

    it("links tooltip content to the trigger for screen readers", () => {
        renderWithIntl(<UiCertificationIcon certification={{ status: "CERTIFIED" }} />);

        const trigger = screen.getByLabelText("Certified");
        const describedBy = trigger.getAttribute("aria-describedby");

        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).toHaveClass("sr-only");
    });

    it("uses custom accessible label when provided", () => {
        renderWithIntl(
            <UiCertificationIcon
                certification={{ status: "CERTIFIED" }}
                accessibilityConfig={{ ariaLabel: "Trusted certification" }}
            />,
        );

        expect(screen.getByLabelText("Trusted certification")).toBeInTheDocument();
    });
});
