// (C) 2026 GoodData Corporation

import { act, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";
import { MOBILE_VIEWPORT } from "../../test/viewport.js";

import { type ILanguageMobileSelectProps, LanguageMobileSelect } from "./LanguageMobileSelect.js";

const requiredProps = {
    currentLanguage: "default",
    defaultLanguage: "en-US",
    languages: ["en-US"],
    changeLanguage: () => Promise.resolve(),
    onClose: () => {},
} satisfies ILanguageMobileSelectProps;

beforeEach(() => {
    window.happyDOM.setViewport(MOBILE_VIEWPORT);
});

describe("LanguageMobileSelect", () => {
    it("should show a full screen dialog with the note, search and the languages, with the current one selected", async () => {
        render(
            <LanguageMobileSelect
                {...requiredProps}
                currentLanguage="de-DE"
                defaultLanguage="en-US"
                languages={["en-US", "de-DE"]}
            />,
        );

        expect(await screen.findByRole("dialog", { name: "Change language" })).toHaveTextContent(
            "Note: Changes the interface only, not dashboard content.",
        );
        expect(screen.getByRole("combobox", { name: "Search languages" })).toHaveAttribute(
            "placeholder",
            "Search…",
        );
        expect(screen.getByRole("option", { name: "Default (English US)", selected: false })).toBeVisible();
        expect(screen.getByRole("option", { name: "English (US)", selected: false })).toBeVisible();
        expect(screen.getByRole("option", { name: "Deutsch", selected: true })).toBeVisible();
    });

    it("should find a language by its English name and hide the default language while searching", async () => {
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                defaultLanguage="en-US"
                languages={["en-US", "de-DE"]}
            />,
        );

        await user.type(await screen.findByRole("combobox", { name: "Search languages" }), "german");

        expect(screen.getByRole("option", { name: "Deutsch" })).toBeVisible();
        expect(screen.getByRole("option", { name: "Deutsch" })).toHaveAttribute("lang", "de-DE");
        expect(screen.queryByRole("option", { name: "English (US)" })).not.toBeInTheDocument();
        expect(screen.queryByRole("option", { name: "Default (English US)" })).not.toBeInTheDocument();
    });

    it("should tell when no language matches the search", async () => {
        const { user } = render(<LanguageMobileSelect {...requiredProps} />);

        await user.type(await screen.findByRole("combobox", { name: "Search languages" }), "abrakadabra");

        expect(screen.getByText("No matching language.")).toBeVisible();
    });

    it("should save the tapped language right away", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                languages={["en-US", "de-DE"]}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));

        expect(changeLanguage.mock.calls).toEqual([["de-DE"]]);
    });

    it("should save the default language when it is tapped", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                currentLanguage="de-DE"
                defaultLanguage="en-US"
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Default (English US)" }));

        expect(changeLanguage.mock.calls).toEqual([["default"]]);
    });

    it("should close once the tapped language is saved", async () => {
        let finishSaving = () => {};
        const changeLanguage = () => new Promise<void>((resolve) => (finishSaving = resolve));
        const onClose = vi.fn();
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                languages={["en-US", "de-DE"]}
                onClose={onClose}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));

        expect(onClose).not.toHaveBeenCalled();

        await act(async () => finishSaving());

        expect(onClose).toHaveBeenCalled();
    });

    it("should close on close button", async () => {
        const onClose = vi.fn();
        const { user } = render(<LanguageMobileSelect {...requiredProps} onClose={onClose} />);

        await user.click(await screen.findByRole("button", { name: "Close" }));

        expect(onClose).toHaveBeenCalled();
    });

    it("should not save when the current language is tapped", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                currentLanguage="de-DE"
                languages={["en-US", "de-DE"]}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));

        expect(changeLanguage).not.toHaveBeenCalled();
    });

    it("should show a progress toast and the tapped language as selected while saving, and clear the toast once saved", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const changeLanguage = () => new Promise<void>((resolve) => setTimeout(resolve, 20000));
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                currentLanguage="default"
                defaultLanguage="en-US"
                languages={["en-US", "de-DE"]}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));
        // The progress toast should not auto close while saving
        await act(() => vi.advanceTimersByTimeAsync(10000));

        expect(
            within(screen.getByRole("region", { name: "1 notification" })).getByRole("status"),
        ).toHaveTextContent("Changing language…");
        expect(screen.getByRole("option", { name: "Deutsch", selected: true })).toBeVisible();
        expect(screen.getByRole("option", { name: "Default (English US)", selected: false })).toBeVisible();

        await act(() => vi.advanceTimersByTimeAsync(10000)); // After `changeLanguage()` saves

        // The progress toast should be cleared once saved
        expect(screen.queryByText("Changing language…")).not.toBeInTheDocument();
    });

    it("should show an error toast and the current language again when saving fails, and clear it on the next tap and when closing", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const changeLanguage = () => new Promise<void>((_, reject) => setTimeout(reject, 1000));
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                currentLanguage="default"
                defaultLanguage="en-US"
                languages={["en-US", "de-DE"]}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));
        await act(() => vi.advanceTimersByTimeAsync(1000)); // After `changeLanguage()` saves

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");
        expect(screen.queryByText("Changing language…")).not.toBeInTheDocument();
        expect(screen.getByRole("option", { name: "Default (English US)", selected: true })).toBeVisible();

        await user.click(screen.getByRole("option", { name: "Deutsch" }));

        // The error toast should be cleared after tapping the language again.
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        await act(() => vi.advanceTimersByTimeAsync(1000)); // After `changeLanguage()` saves

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");

        // The error toast should not auto close
        await act(() => vi.advanceTimersByTimeAsync(10000));

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");

        // Within the dialog because the error toast has also its own "Close" button
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));

        // The error toast should be cleared once the view closes
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not allow closing or tapping another language while saving", async () => {
        const changeLanguage = vi.fn(() => new Promise<void>(() => {}));
        const onClose = vi.fn();
        const { user } = render(
            <LanguageMobileSelect
                {...requiredProps}
                changeLanguage={changeLanguage}
                languages={["en-US", "de-DE"]}
                onClose={onClose}
            />,
        );

        await user.click(await screen.findByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("option", { name: "English (US)" }));
        // Within the dialog, as the progress toast has its own "Close" button
        await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
        await user.keyboard("{Escape}");

        expect(changeLanguage.mock.calls).toEqual([["de-DE"]]);
        expect(screen.getByRole("option", { name: "Deutsch", selected: true })).toBeVisible();
        expect(onClose).not.toHaveBeenCalled();
    });
});
