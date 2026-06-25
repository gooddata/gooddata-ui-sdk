// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { UiGeneralAccessRadio } from "../UiGeneralAccessRadio.js";

const renderWithIntl = (ui: React.ReactNode) =>
    render(
        <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
            {ui}
        </IntlProvider>,
    );

describe("UiGeneralAccessRadio", () => {
    it("checks the Restricted row when value is RESTRICTED", () => {
        renderWithIntl(<UiGeneralAccessRadio value="RESTRICTED" onChange={() => {}} />);
        const restricted = screen.getByRole("radio", { name: /Restricted/ }) as HTMLInputElement;
        const workspace = screen.getByRole("radio", { name: /All workspace members/ }) as HTMLInputElement;
        expect(restricted.checked).toBe(true);
        expect(workspace.checked).toBe(false);
    });

    it("checks the workspace row when value is WORKSPACE", () => {
        renderWithIntl(<UiGeneralAccessRadio value="WORKSPACE" onChange={() => {}} />);
        const workspace = screen.getByRole("radio", { name: /All workspace members/ }) as HTMLInputElement;
        expect(workspace.checked).toBe(true);
    });

    it("calls onChange with the picked value when the workspace row is clicked", () => {
        const onChange = vi.fn();
        renderWithIntl(<UiGeneralAccessRadio value="RESTRICTED" onChange={onChange} />);
        fireEvent.click(screen.getByRole("radio", { name: /All workspace members/ }));
        expect(onChange).toHaveBeenCalledWith("WORKSPACE");
    });

    it("renders the workspaceControls slot on the workspace row", () => {
        renderWithIntl(
            <UiGeneralAccessRadio
                value="WORKSPACE"
                onChange={() => {}}
                workspaceControls={<button>controls</button>}
            />,
        );
        expect(screen.getByRole("button", { name: "controls" })).toBeInTheDocument();
    });

    it("renders the localized description text", () => {
        renderWithIntl(<UiGeneralAccessRadio value="RESTRICTED" onChange={() => {}} />);
        expect(
            screen.getByText("Only people and groups added above can access this object."),
        ).toBeInTheDocument();
        expect(screen.getByText("Everyone in this workspace can view this object.")).toBeInTheDocument();
    });

    it("reflects the workspace level in the workspace description", () => {
        const { rerender } = renderWithIntl(
            <UiGeneralAccessRadio value="WORKSPACE" onChange={() => {}} workspaceLevel="VIEW" />,
        );
        expect(screen.getByText("Everyone in this workspace can view this object.")).toBeInTheDocument();

        rerender(
            <IntlProvider locale={DEFAULT_LANGUAGE} messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}>
                <UiGeneralAccessRadio value="WORKSPACE" onChange={() => {}} workspaceLevel="SHARE" />
            </IntlProvider>,
        );
        expect(
            screen.getByText("Everyone in this workspace can view and share this object."),
        ).toBeInTheDocument();
    });

    it("forwards dataTestId to the root element", () => {
        renderWithIntl(
            <UiGeneralAccessRadio value="RESTRICTED" onChange={() => {}} dataTestId="general-access" />,
        );
        expect(screen.getByTestId("general-access")).toBeInTheDocument();
    });
});
