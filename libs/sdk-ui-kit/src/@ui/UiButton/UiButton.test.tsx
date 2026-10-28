// (C) 2026 GoodData Corporation

import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { type IUiButtonProps, UiButton } from "./UiButton.js";

const requiredProps = {
    label: "Label",
} satisfies IUiButtonProps;

describe("UiButton", () => {
    it("should support pending state and keep the button disabled in that case", async () => {
        const onClick = vi.fn();
        const { user } = render(<UiButton {...requiredProps} label="Apply" isPending onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Apply" });
        /**
         * We could also assert `screen.getByRole("button", { name: "Apply Loading…" })`, but it doesn't work
         * in Testing Library as opposed to real browser behavior for example with Vitest Browser Mode.
         */
        expect(within(button).getByRole("progressbar", { name: "Loading…" })).toBeVisible();
        expect(button).toHaveAttribute("aria-disabled", "true");
        /**
         * Native `disabled` attribute causes lost focus if user presses button with Enter and then `isPending`
         * state is set. Therefore assert that we are not using native `disabled` attribute.
         *
         * Ideally, we would test directly that the element does keep its focus after Enter. However, the problem
         * is that happy-dom (Testing Library) is only a mock of a browser and does not replicate this real browser
         * behavior with native `disabled` attribute. Vitest Browser Mode, which uses a real browser instead of
         * mocked one would be helpful for situations like that.
         */
        expect(button).not.toBeDisabled();

        await user.click(button);
        await user.keyboard("{Enter}");

        expect(onClick).not.toHaveBeenCalled();
    });

    it("should not submit a form with a pending button", async () => {
        const onSubmit = vi.fn();
        const { user } = render(
            <form onSubmit={onSubmit}>
                <input />
                <UiButton {...requiredProps} type="submit" isPending />
            </form>,
        );

        // If the form has a submit button, and user presses Enter on input, the browser behavior is to click the submit button itself.
        await user.type(screen.getByRole("textbox"), "{Enter}");
        await user.click(screen.getByRole("button"));

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should not loose focus if both isPending and isDisabled are passed by callers", () => {
        render(<UiButton {...requiredProps} isPending isDisabled />);

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-disabled", "true");
        /**
         * Assert that not natively disabled to not lose focus after click/enter due to accessibility. Check comment above for why
         * we assert it like that instead of the wanted behavior.
         */
        expect(button).not.toBeDisabled();
    });
});
