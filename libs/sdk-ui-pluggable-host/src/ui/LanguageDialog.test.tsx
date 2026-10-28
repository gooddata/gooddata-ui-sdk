// (C) 2026 GoodData Corporation

import { act, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { render } from "../../test/render.js";

import { type ILanguageDialogProps, LanguageDialog } from "./LanguageDialog.js";

const requiredProps = {
    currentLanguage: "default",
    defaultLanguage: "en-US",
    languages: ["en-US", "de-DE"],
    changeLanguage: () => Promise.resolve(),
    onClose: () => {},
} satisfies ILanguageDialogProps;

afterEach(() => {
    vi.useRealTimers();
});

describe("LanguageDialog", () => {
    it("should show a dialog with a language select, a note and cancel and apply buttons", async () => {
        render(<LanguageDialog {...requiredProps} />);

        // NOTE: The dialog shows once it's positioned, a moment after it renders
        expect(await screen.findByRole("dialog", { name: "Change language" })).toBeVisible();
        // NOTE: The select is named by its value and its label, and describes itself by the note
        expect(screen.getByRole("button", { name: "Default (English US) Change language" })).toBeVisible();
        expect(screen.getByRole("button", { name: /Change language/ })).toHaveAccessibleDescription(
            "Note: Changes the interface only, not dashboard content.",
        );
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Apply" })).toBeVisible();
    });

    it("should show the user's own language in the select", async () => {
        render(<LanguageDialog {...requiredProps} currentLanguage="de-DE" />);

        expect(await screen.findByRole("button", { name: "Deutsch Change language" })).toBeVisible();
    });

    it("should find a language by its English name and hide the default language while searching", async () => {
        const { user } = render(<LanguageDialog {...requiredProps} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.type(screen.getByRole("combobox", { name: "Search languages" }), "german");

        expect(screen.getByRole("option", { name: "Deutsch" })).toBeVisible();
        // NOTE: Screen readers can then read the name in its own language
        expect(screen.getByRole("option", { name: "Deutsch" })).toHaveAttribute("lang", "de-DE");
        expect(screen.queryByRole("option", { name: "English (US)" })).not.toBeInTheDocument();
        expect(screen.queryByRole("option", { name: "Default (English US)" })).not.toBeInTheDocument();
    });

    it("should tell when no language matches the search", async () => {
        const { user } = render(<LanguageDialog {...requiredProps} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.type(screen.getByRole("combobox", { name: "Search languages" }), "abrakadabra");

        expect(screen.getByText("No matching language.")).toBeVisible();
    });

    it("should save the picked language on apply", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const { user } = render(<LanguageDialog {...requiredProps} changeLanguage={changeLanguage} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(changeLanguage.mock.calls).toEqual([["de-DE"]]);
    });

    it("should save the default language when it is applied", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const { user } = render(
            <LanguageDialog {...requiredProps} currentLanguage="de-DE" changeLanguage={changeLanguage} />,
        );

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Default (English US)" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(changeLanguage.mock.calls).toEqual([["default"]]);
    });

    it("should close once the picked language is saved", async () => {
        let finishSaving = () => {};
        const changeLanguage = () => new Promise<void>((resolve) => (finishSaving = resolve));
        const onClose = vi.fn();
        const { user } = render(
            <LanguageDialog {...requiredProps} changeLanguage={changeLanguage} onClose={onClose} />,
        );

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(onClose).not.toHaveBeenCalled(); // NOTE: Still saving

        await act(async () => finishSaving());

        expect(onClose).toHaveBeenCalled();
    });

    it("should close on cancel without saving", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const onClose = vi.fn();
        const { user } = render(
            <LanguageDialog {...requiredProps} changeLanguage={changeLanguage} onClose={onClose} />,
        );

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalled();
        expect(changeLanguage).not.toHaveBeenCalled();
    });

    it("should only close when the language is applied unchanged", async () => {
        const changeLanguage = vi.fn(() => Promise.resolve());
        const onClose = vi.fn();
        const { user } = render(
            <LanguageDialog
                {...requiredProps}
                currentLanguage="de-DE"
                changeLanguage={changeLanguage}
                onClose={onClose}
            />,
        );

        await user.click(await screen.findByRole("button", { name: "Apply" }));

        expect(onClose).toHaveBeenCalled();
        expect(changeLanguage).not.toHaveBeenCalled();
    });

    it("should close only the select on escape in it, and the dialog on the next escape", async () => {
        const onClose = vi.fn();
        const { user } = render(<LanguageDialog {...requiredProps} onClose={onClose} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.keyboard("{Escape}");

        expect(screen.getByRole("button", { name: /Change language/, expanded: false })).toBeVisible();
        expect(onClose).not.toHaveBeenCalled();

        await user.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalled();
    });

    it("should show apply as pending while the language is saving", async () => {
        const changeLanguage = () => new Promise<void>(() => {});
        const { user } = render(<LanguageDialog {...requiredProps} changeLanguage={changeLanguage} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(
            within(screen.getByRole("button", { name: "Apply" })).getByRole("progressbar", {
                name: "Loading…",
            }),
        ).toBeVisible();
    });

    it("should show an error toast when saving fails, and clear it when apply is clicked again", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1 });
        const changeLanguage = () => new Promise<void>((_, reject) => setTimeout(reject, 1000));
        const { user } = render(<LanguageDialog {...requiredProps} changeLanguage={changeLanguage} />);

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));
        await act(() => vi.advanceTimersByTimeAsync(1000)); // After `changeLanguage()` saves

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");

        await user.click(screen.getByRole("button", { name: "Apply" }));

        // The error toast should be cleared after clicking "Apply" again.
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();

        await act(() => vi.advanceTimersByTimeAsync(1000)); // After `changeLanguage()` saves

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");

        // The error toast should not auto close
        await act(() => vi.advanceTimersByTimeAsync(10000));

        expect(screen.getByRole("alert")).toHaveTextContent("We couldn't change the language. Try again.");

        await user.click(screen.getByRole("button", { name: "Cancel" }));

        // The error toast should be cleared once the dialog closes
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not allow closing while the language is saving", async () => {
        const changeLanguage = () => new Promise<void>(() => {});
        const onClose = vi.fn();
        const { user } = render(
            <LanguageDialog {...requiredProps} changeLanguage={changeLanguage} onClose={onClose} />,
        );

        await user.click(await screen.findByRole("button", { name: /Change language/ }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));
        await user.click(screen.getByRole("button", { name: "Cancel" }));
        await user.click(screen.getByRole("button", { name: "Close" }));
        await user.keyboard("{Escape}");

        expect(onClose).not.toHaveBeenCalled();
    });
});
