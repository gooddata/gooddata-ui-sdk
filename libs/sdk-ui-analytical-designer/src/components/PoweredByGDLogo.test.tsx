// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { createStore } from "../create_store.js";
import { poweredByGDCClicked } from "../sagas/powered_by_gdc/powered_by_gdc_ui_actions.js";

import { PoweredByGDLogo } from "./PoweredByGDLogo.js";

vi.hoisted(() => {
    vi.resetModules();
});

const { mockIsPoweredByGDLogoPresent, mockPoweredByGDLogoLink } = vi.hoisted(() => ({
    mockIsPoweredByGDLogoPresent: vi.fn(),
    mockPoweredByGDLogoLink: vi.fn(),
}));

vi.mock("../selectors/PoweredByLogoSelector.js", () => ({
    isPoweredByGDLogoPresent: mockIsPoweredByGDLogoPresent,
    poweredByGDLogoLink: mockPoweredByGDLogoLink,
}));

describe("PoweredByGDLogo", () => {
    const createComponent = ({ isPresent = true, logoLink = "" } = {}) => {
        mockIsPoweredByGDLogoPresent.mockReturnValue(isPresent);
        mockPoweredByGDLogoLink.mockReturnValue(logoLink);

        const { store } = createStore();
        const dispatchSpy = vi.spyOn(store, "dispatch");

        return {
            ...render(
                <Provider store={store}>
                    <PoweredByGDLogo />
                </Provider>,
            ),
            dispatchSpy,
        };
    };

    describe("render", () => {
        it.each([
            ["not render", false],
            ["render", true],
        ])("should %s if 'isPresent' is %s", (_: string, isPresent: boolean) => {
            const { container } = createComponent({ isPresent });
            expect(!!container.querySelectorAll(".gd-powered-by-logo-wrapper").length).toBe(isPresent);
        });
    });
    describe("href link", () => {
        it("should open link from selector in a new windiw", () => {
            const logoLink = "www.something.com/test";
            const { container } = createComponent({ logoLink });
            const link = container.querySelector("a");
            expect(link).toHaveAttribute("href", logoLink);
        });
    });
    describe("logging", () => {
        it('should dispatch "poweredByGDCClicked" when clicked', () => {
            const { container, dispatchSpy } = createComponent();
            expect(dispatchSpy).not.toHaveBeenCalledWith(poweredByGDCClicked());
            fireEvent.click(container.querySelector(".gd-powered-by-logo-wrapper"));
            expect(dispatchSpy).toHaveBeenCalledWith(poweredByGDCClicked());
        });
    });
});
