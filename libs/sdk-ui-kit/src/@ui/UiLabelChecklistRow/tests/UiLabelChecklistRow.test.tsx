// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiLabelChecklistRow } from "../UiLabelChecklistRow.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiLabelChecklistRow", () => {
    it("renders the label + caller-supplied suffix", () => {
        renderWithIntl(
            <UiLabelChecklistRow label="Customer ID" kind="primary" suffix="(Primary)" checked disabled />,
        );
        expect(screen.getByText("Customer ID")).toBeInTheDocument();
        expect(screen.getByText("(Primary)")).toBeInTheDocument();
    });

    it("emits onChange(true) when an unchecked row is clicked", () => {
        const onChange = vi.fn();
        renderWithIntl(<UiLabelChecklistRow label="Customer Email" checked={false} onChange={onChange} />);
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("toggles when the row label is clicked (not just the checkbox)", () => {
        const onChange = vi.fn();
        renderWithIntl(<UiLabelChecklistRow label="Customer Email" checked={false} onChange={onChange} />);
        fireEvent.click(screen.getByText("Customer Email"));
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("checkbox is named by the row label via aria-labelledby", () => {
        renderWithIntl(<UiLabelChecklistRow label="Customer Email" checked={false} />);
        const checkbox = screen.getByRole("checkbox");
        const labelledById = checkbox.getAttribute("aria-labelledby");
        expect(labelledById).toBeTruthy();
        expect(document.getElementById(labelledById!)).toHaveTextContent("Customer Email");
    });

    it("does not emit onChange when disabled", () => {
        const onChange = vi.fn();
        renderWithIntl(
            <UiLabelChecklistRow label="Customer ID" kind="primary" checked disabled onChange={onChange} />,
        );
        const checkbox = screen.getByRole("checkbox");
        fireEvent.click(checkbox);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("forwards dataTestId", () => {
        renderWithIntl(<UiLabelChecklistRow label="X" checked={false} dataTestId="my-row" />);
        expect(screen.getByTestId("my-row")).toBeInTheDocument();
    });
});
