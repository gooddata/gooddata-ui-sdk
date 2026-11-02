// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type IUserSettingsService } from "@gooddata/sdk-backend-spi";
import { DefaultLocale, type ILocale, type ISettings, isLocale } from "@gooddata/sdk-model";
import {
    type IPlatformContext,
    type IPluggableAppTelemetryCallbacks,
} from "@gooddata/sdk-pluggable-application-model";

import { getBackend } from "../platformContext/backend.js";

import { isHeaderHidden } from "./chromeHelpers.js";
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
    const defaultLanguage = useDefaultLanguage(ctx);

    // The SPI can't tell whether the user has a LOCALE of their own, so a language different from the default one
    // counts as theirs. One they picked although it's the default one shows as Default, which reads the same.
    const currentLanguage: LanguageChoice =
        !ctx.preferredLocale || ctx.preferredLocale === defaultLanguage ? "default" : ctx.preferredLocale;

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

function useDefaultLanguage(
    ctx: Pick<IPlatformContext, "currentWorkspaceId" | "settings" | "embeddingMode" | "isExportMode">,
): ILocale | undefined {
    const { currentWorkspaceId, settings } = ctx;

    const isEnabled = settings.enableUserLanguageChange === true && !isHeaderHidden(ctx);
    const [defaultLanguage, setDefaultLanguage] = useState<{
        workspaceId: string | undefined;
        language: ILocale;
    }>();

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        let isCurrent = true;
        void getDefaultLanguage(
            { currentWorkspaceId },
            {
                getWorkspaceSettings: (id) => getBackend().workspace(id).settings().getSettings(),
                getOrganizationSettings: () =>
                    getBackend()
                        .organizations()
                        .getCurrentOrganization()
                        .then((organization) => organization.settings().getSettings()),
            },
        ).then((language) => {
            if (isCurrent) {
                setDefaultLanguage({ workspaceId: currentWorkspaceId, language });
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [currentWorkspaceId, isEnabled, settings]);

    /**
     * Do not return the default language of the previous workspace while the effect
     * is loading the default language of the new workspace (when switching workspaces).
     */
    return defaultLanguage && defaultLanguage.workspaceId === currentWorkspaceId
        ? defaultLanguage.language
        : undefined;
}

export interface IGetDefaultLanguageDependencies {
    getWorkspaceSettings: (workspaceId: string) => Promise<ISettings>;
    getOrganizationSettings: () => Promise<ISettings>;
}

export async function getDefaultLanguage(
    { currentWorkspaceId }: Pick<IPlatformContext, "currentWorkspaceId">,
    { getWorkspaceSettings, getOrganizationSettings }: IGetDefaultLanguageDependencies,
): Promise<ILocale> {
    try {
        const { locale } = await (currentWorkspaceId
            ? getWorkspaceSettings(currentWorkspaceId)
            : getOrganizationSettings());
        return isLocale(locale) ? locale : DefaultLocale;
    } catch {
        // If the settings can't be read, the platform default applies
        return DefaultLocale;
    }
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
