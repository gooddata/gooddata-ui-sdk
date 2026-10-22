// (C) 2026 GoodData Corporation

import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ILocale } from "@gooddata/sdk-model";

import { render } from "../../test/render.js";

import { type ILanguageDialogProps, LanguageDialog } from "./LanguageDialog.js";

const requiredProps = {
    currentLanguage: undefined,
    defaultLanguage: "en-US",
    languages: ["en-US", "de-DE"],
    setLanguage: () => Promise.resolve(),
    deleteLanguage: () => Promise.resolve(),
    onClose: () => {},
} satisfies ILanguageDialogProps;

describe("LanguageDialog", () => {
    it("should show a dialog with a language select, a note and cancel and apply buttons", async () => {
        render(<LanguageDialog {...requiredProps} />);

        // NOTE: The dialog shows once it's positioned, a moment after it renders
        expect(await screen.findByRole("dialog", { name: "Change language" })).toBeVisible();
        // NOTE: The select is named by its value and its label, and describes itself by the note
        expect(screen.getByRole("button", { name: "Default (English US) Change language" })).toBeVisible();
        expect(
            screen.getByRole("button", { name: "Default (English US) Change language" }),
        ).toHaveAccessibleDescription("Note: Changes the interface only, not dashboard content.");
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Apply" })).toBeVisible();
    });

    it("should show the user's own language in the select", async () => {
        render(<LanguageDialog {...requiredProps} currentLanguage="de-DE" />);

        expect(await screen.findByRole("button", { name: "Deutsch Change language" })).toBeVisible();
    });

    it("should find a language by its English name and hide the default language while searching", async () => {
        const { user } = render(<LanguageDialog {...requiredProps} />);

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.type(screen.getByRole("combobox", { name: "Search languages" }), "german");

        expect(screen.getByRole("option", { name: "Deutsch" })).toBeVisible();
        // NOTE: Screen readers can then read the name in its own language
        expect(screen.getByRole("option", { name: "Deutsch" })).toHaveAttribute("lang", "de-DE");
        expect(screen.queryByRole("option", { name: "English (US)" })).not.toBeInTheDocument();
        expect(screen.queryByRole("option", { name: "Default (English US)" })).not.toBeInTheDocument();
    });

    it("should tell when no language matches the search", async () => {
        const { user } = render(<LanguageDialog {...requiredProps} />);

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.type(screen.getByRole("combobox", { name: "Search languages" }), "abrakadabra");

        expect(screen.getByText("No matching language.")).toBeVisible();
    });

    it("should save the picked language on apply", async () => {
        const setLanguage = vi.fn<(language: ILocale) => Promise<void>>(() => Promise.resolve());
        const deleteLanguage = vi.fn<() => Promise<void>>(() => Promise.resolve());
        const { user } = render(
            <LanguageDialog {...requiredProps} setLanguage={setLanguage} deleteLanguage={deleteLanguage} />,
        );

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(setLanguage.mock.calls).toEqual([["de-DE"]]);
        expect(deleteLanguage).not.toHaveBeenCalled();
    });

    it("should delete the user's own language when the default one is applied", async () => {
        const setLanguage = vi.fn<(language: ILocale) => Promise<void>>(() => Promise.resolve());
        const deleteLanguage = vi.fn<() => Promise<void>>(() => Promise.resolve());
        const { user } = render(
            <LanguageDialog
                {...requiredProps}
                currentLanguage="de-DE"
                setLanguage={setLanguage}
                deleteLanguage={deleteLanguage}
            />,
        );

        await user.click(await screen.findByRole("button", { name: "Deutsch Change language" }));
        await user.click(screen.getByRole("option", { name: "Default (English US)" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(deleteLanguage).toHaveBeenCalledTimes(1);
        expect(setLanguage).not.toHaveBeenCalled();
    });

    it("should close once the picked language is saved", async () => {
        let finishSaving = () => {};
        const setLanguage = () => new Promise<void>((resolve) => (finishSaving = resolve));
        const onClose = vi.fn<() => void>();
        const { user } = render(
            <LanguageDialog {...requiredProps} setLanguage={setLanguage} onClose={onClose} />,
        );

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Apply" }));

        expect(onClose).not.toHaveBeenCalled(); // NOTE: Still saving

        await act(async () => finishSaving());

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should close on cancel without saving", async () => {
        const setLanguage = vi.fn<(language: ILocale) => Promise<void>>(() => Promise.resolve());
        const deleteLanguage = vi.fn<() => Promise<void>>(() => Promise.resolve());
        const onClose = vi.fn<() => void>();
        const { user } = render(
            <LanguageDialog
                {...requiredProps}
                setLanguage={setLanguage}
                deleteLanguage={deleteLanguage}
                onClose={onClose}
            />,
        );

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.click(screen.getByRole("option", { name: "Deutsch" }));
        await user.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(setLanguage).not.toHaveBeenCalled();
        expect(deleteLanguage).not.toHaveBeenCalled();
    });

    it("should only close when the language is applied unchanged", async () => {
        const setLanguage = vi.fn<(language: ILocale) => Promise<void>>(() => Promise.resolve());
        const onClose = vi.fn<() => void>();
        const { user } = render(
            <LanguageDialog
                {...requiredProps}
                currentLanguage="de-DE"
                setLanguage={setLanguage}
                onClose={onClose}
            />,
        );

        await user.click(await screen.findByRole("button", { name: "Apply" }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(setLanguage).not.toHaveBeenCalled();
    });

    it("should close only the select on escape in it, and the dialog on the next escape", async () => {
        const onClose = vi.fn<() => void>();
        const { user } = render(<LanguageDialog {...requiredProps} onClose={onClose} />);

        await user.click(await screen.findByRole("button", { name: "Default (English US) Change language" }));
        await user.keyboard("{Escape}");

        expect(
            screen.getByRole("button", { name: "Default (English US) Change language", expanded: false }),
        ).toBeVisible();
        expect(onClose).not.toHaveBeenCalled();

        await user.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
