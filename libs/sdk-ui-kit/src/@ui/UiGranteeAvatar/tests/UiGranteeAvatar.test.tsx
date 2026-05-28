// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiGranteeAvatar } from "../UiGranteeAvatar.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiGranteeAvatar", () => {
    it("renders the 'User' aria-label for the user kind", () => {
        renderWithIntl(<UiGranteeAvatar kind="user" />);
        expect(screen.getByRole("img", { name: "User" })).toBeInTheDocument();
    });

    it("renders the 'User group' aria-label for the group kind", () => {
        renderWithIntl(<UiGranteeAvatar kind="group" />);
        expect(screen.getByRole("img", { name: "User group" })).toBeInTheDocument();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiGranteeAvatar kind="user" dataTestId="my-avatar" />);
        expect(screen.getByTestId("my-avatar")).toBeInTheDocument();
    });
});
