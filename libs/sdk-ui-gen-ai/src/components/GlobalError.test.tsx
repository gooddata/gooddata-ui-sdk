// (C) 2026 GoodData Corporation

import { act, cleanup, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it } from "vitest";

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";

import { GlobalError } from "./GlobalError.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

const nextFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

function renderError(autofocus: boolean) {
    return render(
        <IntlProvider locale="en" messages={messages}>
            <GlobalError autofocus={autofocus} errorDetails="details" clearError={() => {}} />
        </IntlProvider>,
    );
}

afterEach(() => {
    cleanup();
});

describe("GlobalError", () => {
    it("moves focus to its first action when autofocus is set", async () => {
        renderError(true);

        await nextFrame();

        expect(document.activeElement).toBe(screen.getAllByRole("button")[0]);
    });

    it("leaves focus where it is without autofocus", async () => {
        renderError(false);

        await nextFrame();

        expect(document.activeElement).toBe(document.body);
    });
});
