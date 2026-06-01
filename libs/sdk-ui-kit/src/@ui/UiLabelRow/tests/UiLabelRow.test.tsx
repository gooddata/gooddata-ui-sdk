// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiLabelRow } from "../UiLabelRow.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiLabelRow", () => {
    it("renders the label", () => {
        renderWithIntl(<UiLabelRow label="Customer ID" kind="primary" />);
        expect(screen.getByText("Customer ID")).toBeInTheDocument();
    });

    it("renders the caller-supplied suffix", () => {
        renderWithIntl(<UiLabelRow label="Customer ID" kind="primary" suffix="(Primary)" />);
        expect(screen.getByText("(Primary)")).toBeInTheDocument();
    });

    it("renders no suffix when none is supplied", () => {
        renderWithIntl(<UiLabelRow label="Customer Email" />);
        expect(screen.getByText("Customer Email")).toBeInTheDocument();
        expect(screen.queryByText(/^\(/)).not.toBeInTheDocument();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(<UiLabelRow label="X" dataTestId="my-row" />);
        expect(screen.getByTestId("my-row")).toBeInTheDocument();
    });
});
