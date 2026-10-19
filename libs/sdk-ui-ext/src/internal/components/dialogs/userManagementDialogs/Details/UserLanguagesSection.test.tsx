// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ILocalizationStatistics, type IUserLocalizationSettings } from "@gooddata/sdk-backend-spi";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { type ListMode } from "../types.js";

import { languageOptions } from "./userLanguages.js";
import { UserLanguagesSection } from "./UserLanguagesSection.js";

function renderSection(
    languages: IUserLocalizationSettings | undefined,
    mode: ListMode = "VIEW",
    onChange = vi.fn(),
    isError = false,
    statistics?: ILocalizationStatistics,
) {
    render(
        <IntlWrapper>
            <UserLanguagesSection
                languages={languages}
                mode={mode}
                isError={isError}
                statistics={statistics}
                onChange={onChange}
            />
        </IntlWrapper>,
    );
    return onChange;
}

const row = (label: string) =>
    screen.getByText(label).closest<HTMLElement>(".gd-user-management-dialog-detail-row")!;
const dropdownOf = (label: string) => screen.getByRole("combobox", { name: label });
const option = (name: string) => screen.getByRole("option", { name });

describe("UserLanguagesSection", () => {
    it("shows each language the user set and which ones are not set", () => {
        renderSection({ METADATA_LOCALE: "es-ES" });

        expect(row("Metadata language")).toHaveTextContent("Spanish (Spain)");
        expect(row("Metadata language")).toHaveTextContent("es-ES");
        expect(row("Interface language")).toHaveTextContent("Not set");
        expect(row("Data language")).toHaveTextContent("Not set");
    });

    it("shows an error for an interface language GoodData does not offer", () => {
        renderSection({ LOCALE: "es-MX", METADATA_LOCALE: "es-MX" });

        expect(screen.getByText(/Language not supported/)).toHaveTextContent(
            "Error: Language not supported – English (United States) shows instead.",
        );
        expect(screen.getAllByText(/Language not supported/)).toHaveLength(1);
    });

    it("does not show an error for an interface language", () => {
        renderSection({ LOCALE: "es-ES" });

        expect(screen.queryByText(/Language not supported/)).not.toBeInTheDocument();
    });

    it("shows no notice under the metadata and data languages", () => {
        renderSection({ LOCALE: "fr-FR", METADATA_LOCALE: "es-ES", DATA_LOCALE: "es-ES" });

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(screen.queryByText(/Warning|Note/)).not.toBeInTheDocument();
    });

    it("does not show notices while editing", () => {
        renderSection({ LOCALE: "es-MX" }, "EDIT");

        expect(screen.queryByText(/Language not supported/)).not.toBeInTheDocument();
    });

    it("says when the languages could not be loaded", () => {
        renderSection(undefined, "VIEW", vi.fn(), true);

        expect(screen.getByText("The languages could not be loaded.")).toBeInTheDocument();
        expect(screen.queryByText("Interface language")).not.toBeInTheDocument();
    });

    it("changes a language from the list", () => {
        const onChange = renderSection({ LOCALE: "ko-KR" }, "EDIT");

        fireEvent.click(dropdownOf("Metadata language"));
        fireEvent.click(within(option("German (Germany) (de-DE)")).getByText("German (Germany) (de-DE)"));

        expect(onChange).toHaveBeenCalledWith({
            LOCALE: "ko-KR",
            METADATA_LOCALE: "de-DE",
        });
    });

    it("removes a language with Not set", () => {
        const onChange = renderSection({ LOCALE: "ko-KR", DATA_LOCALE: "es-ES" }, "EDIT");

        fireEvent.click(dropdownOf("Interface language"));
        fireEvent.click(
            within(option("Not set, follows each workspace")).getByText("Not set, follows each workspace"),
        );

        expect(onChange).toHaveBeenCalledWith({ DATA_LOCALE: "es-ES" });
    });

    it("picks a language with the keyboard", () => {
        const onChange = renderSection({}, "EDIT");

        fireEvent.click(dropdownOf("Data language"));
        const listbox = screen.getByRole("listbox", { name: "Data language" });
        fireEvent.keyDown(listbox, { code: "ArrowDown" });
        fireEvent.keyDown(listbox, { code: "Enter" });

        expect(onChange).toHaveBeenCalledWith({
            DATA_LOCALE: languageOptions("DATA_LOCALE", undefined, "en-US")[0],
        });
    });

    it("offers only the languages the statistics list for metadata", () => {
        renderSection({}, "EDIT", vi.fn(), false, {
            metadata: { locales: [{ locale: "de-DE" }] },
            data: { locales: [] },
        });

        fireEvent.click(dropdownOf("Metadata language"));

        expect(screen.getAllByRole("option").map((item) => item.textContent)).toEqual([
            "Not set, follows each workspace",
            "German (Germany) (de-DE)",
        ]);
    });

    it("keeps a current language the interface does not offer in the list", () => {
        renderSection({ LOCALE: "es-MX" }, "EDIT");

        fireEvent.click(dropdownOf("Interface language"));

        expect(option("Spanish (Mexico) (es-MX)")).toBeInTheDocument();
    });
});
