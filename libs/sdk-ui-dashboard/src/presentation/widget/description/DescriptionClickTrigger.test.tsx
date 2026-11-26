// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../localization/IntlWrapper.js";

import { DescriptionClickTrigger } from "./DescriptionClickTrigger.js";
import { type IDescriptionClickTriggerProps } from "./types.js";

// `isolate: false` shares one module graph per worker; make sure the real modules are used.
vi.hoisted(() => {
    vi.resetModules();
});

const props: IDescriptionClickTriggerProps = {
    className: "widget-description-test",
    description: "Custom column description",
    useReferences: false,
    filters: [],
    isExecutionInputLoading: false,
    execConfig: {},
    separators: { decimal: ".", thousand: "," },
    restrictedReferences: [],
    parameterDisplayValues: undefined,
};

function renderTrigger(overrides: Partial<IDescriptionClickTriggerProps> = {}) {
    render(
        <BackendProvider backend={dummyBackend()}>
            <WorkspaceProvider workspace="ws-1">
                <IntlWrapper>
                    <DescriptionClickTrigger {...props} {...overrides} />
                </IntlWrapper>
            </WorkspaceProvider>
        </BackendProvider>,
    );
    return screen.getByRole("button", { name: "Description" });
}

describe("DescriptionClickTrigger", () => {
    it("should toggle with Space and close with Escape, keeping focus on the trigger", () => {
        const button = renderTrigger();
        button.focus();
        expect(button).toHaveAttribute("aria-expanded", "false");

        fireEvent.keyDown(button, { key: " " });
        expect(button).toHaveAttribute("aria-expanded", "true");

        fireEvent.keyDown(button, { key: "Escape" });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(document.activeElement).toBe(button);

        fireEvent.keyDown(button, { key: "Enter" });
        expect(button).toHaveAttribute("aria-expanded", "true");
        fireEvent.keyDown(button, { key: "Enter" });
        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should close with Escape pressed inside the description and return focus to the trigger", async () => {
        const button = renderTrigger({ description: "See [the docs](https://www.example.com/docs)" });
        button.focus();
        fireEvent.keyDown(button, { key: "Enter" });
        expect(button).toHaveAttribute("aria-expanded", "true");

        const link = await screen.findByRole("link", { name: "the docs" });
        link.focus();
        fireEvent.keyDown(link, { key: "Escape" });

        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(document.activeElement).toBe(button);
    });

    it("should not stop propagation of Escape when the overlay is closed", () => {
        const button = renderTrigger();
        let reachedParent = false;
        const listener = () => {
            reachedParent = true;
        };
        document.addEventListener("keydown", listener);

        fireEvent.keyDown(button, { key: "Escape" });

        document.removeEventListener("keydown", listener);
        expect(reachedParent).toBe(true);
    });
});
