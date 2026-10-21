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
    workspaceStatistics?: ILocalizationStatistics[],
) {
    render(
        <IntlWrapper>
            <UserLanguagesSection
                languages={languages}
                mode={mode}
                isError={isError}
                statistics={statistics}
                workspaceStatistics={workspaceStatistics}
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

    it("warns about the workspaces without a translation", () => {
        renderSection({ METADATA_LOCALE: "es-ES", DATA_LOCALE: "es-ES" }, "VIEW", vi.fn(), false, undefined, [
            { metadata: { locales: [{ locale: "es-ES" }] }, data: { locales: [] } },
            { metadata: { locales: [] }, data: { locales: [] } },
            { metadata: { locales: [] }, data: { locales: [] } },
        ]);

        expect(screen.getByText(/No translation in/)).toHaveTextContent(
            "Warning: No translation in 2 of their workspaces.",
        );
        expect(screen.getByText(/original values/)).toHaveTextContent(
            "Warning: No translation – original values show instead.",
        );
    });

    it("announces the translation notes, which arrive after the languages", () => {
        const languages = { LOCALE: "fr-FR", METADATA_LOCALE: "es-ES" };
        const section = (workspaceStatistics?: ILocalizationStatistics[]) => (
            <IntlWrapper>
                <UserLanguagesSection
                    languages={languages}
                    mode="VIEW"
                    isError={false}
                    workspaceStatistics={workspaceStatistics}
                />
            </IntlWrapper>
        );
        const { rerender } = render(section());
        const alertRegions = screen.getAllByRole("alert");
        const statusRegions = screen.getAllByRole("status");
        expect(alertRegions).toHaveLength(2);
        expect(statusRegions).toHaveLength(2);
        [...alertRegions, ...statusRegions].forEach((region) => expect(region).toBeEmptyDOMElement());

        rerender(
            section([
                { metadata: { locales: [{ locale: "fr-FR" }] }, data: { locales: [{ locale: "fr-FR" }] } },
            ]),
        );

        expect(screen.getAllByRole("alert")).toEqual(alertRegions);
        expect(screen.getAllByRole("status")).toEqual(statusRegions);
        expect(alertRegions[0]).toHaveTextContent("No translation");
        expect(statusRegions[0]).toBeEmptyDOMElement();
        expect(alertRegions[1]).toBeEmptyDOMElement();
        expect(statusRegions[1]).toHaveTextContent("Translation available");
    });

    it("notes no translation the organization default already uses", () => {
        const { container } = render(
            <IntlWrapper>
                <UserLanguagesSection
                    languages={{ LOCALE: "fr-FR" }}
                    mode="VIEW"
                    isError={false}
                    workspaceStatistics={[
                        {
                            metadata: { locales: [{ locale: "fr-FR" }] },
                            data: { locales: [{ locale: "fr-FR" }] },
                        },
                    ]}
                    organizationLanguages={{ METADATA_LOCALE: "fr-FR" }}
                />
            </IntlWrapper>,
        );

        expect(container.querySelector(".s-user-language-notice-METADATA_LOCALE")).toBeNull();
        expect(container.querySelector(".s-user-language-notice-DATA_LOCALE")).toHaveTextContent(
            "Translation available",
        );
    });

    it("shows no translation notice without workspace statistics", () => {
        renderSection({ LOCALE: "fr-FR", METADATA_LOCALE: "es-ES", DATA_LOCALE: "es-ES" });

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
