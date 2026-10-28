// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { type ILocale, isLocale } from "@gooddata/sdk-model";
import {
    type IPlatformContext,
    type IPluggableAppTelemetryCallbacks,
} from "@gooddata/sdk-pluggable-application-model";
import { DEFAULT_LANGUAGE } from "@gooddata/sdk-ui";

import { getBackend } from "../platformContext/backend.js";

import { rememberLanguageChange } from "./LanguageChangedToast.js";
import { LANGUAGES, type LanguageChoice } from "./languages.js";
import { trackOwnLanguageSave } from "./languageTelemetry.js";

/**
 * @internal
 */
export interface ILanguages {
    currentLanguage: LanguageChoice;
    defaultLanguage: ILocale;
    languages: ILocale[];
    changeLanguage: (language: LanguageChoice) => Promise<void>;
}

export function useLanguages(
    ctx: IPlatformContext,
    telemetry?: IPluggableAppTelemetryCallbacks,
): ILanguages | undefined {
    const defaultLanguage = useDefaultLanguage(ctx.currentWorkspaceId);

    // The SPI can't tell whether the user has a LOCALE of their own, so a language different from the default one
    // counts as theirs. One they picked although it's the default one shows as Default, which reads the same.
    const resolvedLanguage = isLocale(ctx.preferredLocale) ? ctx.preferredLocale : undefined;
    const currentLanguage: LanguageChoice =
        !resolvedLanguage || resolvedLanguage === defaultLanguage ? "default" : resolvedLanguage;

    const changeLanguage = useCallback(
        (language: LanguageChoice) =>
            changeOwnLanguage(language, {
                settings: getBackend().currentUser().settings(),
                track: (to, outcome) => trackOwnLanguageSave(telemetry, currentLanguage, to, outcome),
                // A page reload, as reloading the platform context isn't enough: on workspace routes, the language
                // comes from the workspace settings, which the backend's caching keeps until the page reloads.
                rememberChange: rememberLanguageChange,
                reload: () => window.location.reload(),
            }),
        [telemetry, currentLanguage],
    );

    if (!defaultLanguage) {
        return undefined;
    }

    return { currentLanguage, defaultLanguage, languages: LANGUAGES, changeLanguage };
}

/**
 * The language without the user's own: of the workspace on workspace routes, of the organization otherwise.
 */
function useDefaultLanguage(workspaceId: string | undefined): ILocale | undefined {
    const [defaultLanguage, setDefaultLanguage] = useState<ILocale>();

    useEffect(() => {
        let isCurrent = true;
        const backend = getBackend();
        const settings = workspaceId
            ? backend.workspace(workspaceId).settings().getSettings()
            : backend
                  .organizations()
                  .getCurrentOrganization()
                  .then((organization) => organization.settings().getSettings());

        void settings
            .then(({ locale }) => (isLocale(locale) ? locale : DEFAULT_LANGUAGE))
            // the organization settings need an organization permission; without it, the platform default applies
            .catch(() => DEFAULT_LANGUAGE)
            .then((language) => {
                if (isCurrent && isLocale(language)) {
                    setDefaultLanguage(language);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, [workspaceId]);

    return defaultLanguage;
}

export interface IChangeOwnLanguageDependencies {
    settings: Pick<IUserSettingsService, "setLocale" | "deleteLocale">;
    track: (language: LanguageChoice, outcome: "success" | "error") => void;
    // For the success toast after the reload
    rememberChange: () => void;
    reload: () => void;
}

export async function changeOwnLanguage(
    language: LanguageChoice,
    { settings, track, rememberChange, reload }: IChangeOwnLanguageDependencies,
) {
    try {
        await (language === "default" ? settings.deleteLocale() : settings.setLocale(language));
    } catch (error) {
        track(language, "error");
        throw error;
    }
    track(language, "success");
    rememberChange();
    reload();
}
