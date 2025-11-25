// (C) 2025 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { messagesMap } from "@gooddata/sdk-ui";

import { useKeyboardNavigationTarget } from "../useKeyboardNavigationTarget.js";

describe("useKeyboardNavigationTarget", () => {
    const renderHook = () => {
        const DefaultLocale = "en-US";
        const onFocus = vi.fn();

        const messages = messagesMap[DefaultLocale];

        function Component() {
            const { targetRef } = useKeyboardNavigationTarget({
                label: "Test label",
                tabIndex: 1,
                navigationId: "test-id",
                onFocus,
            });

            return <div data-testid="target" ref={targetRef} />;
        }

        const res = render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <Component />
            </IntlProvider>,
        );

        return {
            res,
            onFocus,
        };
    };

    it("render and update target", () => {
        renderHook();

        expect(screen.getByTestId("target")).toBeInTheDocument();
        expect(screen.getByTestId("target").outerHTML).toBe(
            `<div data-testid="target" id="test-id" tabindex="1" role="navigation" aria-label="Test label"></div>`,
        );
    });

    it("check focus call", () => {
        const { onFocus } = renderHook();

        const div = screen.getByTestId("target");

        expect(onFocus).not.toHaveBeenCalled();

        div.focus();

        expect(onFocus).toHaveBeenCalled();
    });
});
