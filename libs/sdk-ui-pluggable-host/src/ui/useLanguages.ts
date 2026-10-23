// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type ILocale, isLocale } from "@gooddata/sdk-model";
import {
    type IPlatformContext,
    type IPluggableAppTelemetryCallbacks,
} from "@gooddata/sdk-pluggable-application-model";
import { DEFAULT_LANGUAGE } from "@gooddata/sdk-ui";

import { getBackend } from "../platformContext/backend.js";

import { LANGUAGES } from "./languages.js";
import { trackOwnLanguageSave } from "./languageTelemetry.js";

/**
 * @internal
 */
export interface ILanguages {
    /** The user's own language (their LOCALE setting), `undefined` when they use the default one. */
    currentLanguage: ILocale | undefined;
    /** The language the user gets without their own: the one of the workspace or organization. */
    defaultLanguage: ILocale;
    /** The languages the user can switch the interface to, in the order to show them. */
    languages: ILocale[];
    /** Saves the language as the LOCALE setting of the current user. */
    setLanguage: (language: ILocale) => Promise<void>;
    /** Deletes the LOCALE setting of the current user, so that the default language applies again. */
    deleteLanguage: () => Promise<void>;
}

/**
 * The languages for the user's own interface language control (ATEAM-25). `undefined` until the default language
 * is loaded.
 *
 * @internal
 */
export function useLanguages(
    ctx: IPlatformContext,
    telemetry?: IPluggableAppTelemetryCallbacks,
): ILanguages | undefined {
    const defaultLanguage = useDefaultLanguage(ctx.currentWorkspaceId);

    // The SPI can't tell whether the user has a LOCALE of their own, so a language different from the default one
    // counts as theirs. One they picked although it's the default one shows as Default, which reads the same.
    const resolvedLanguage = isLocale(ctx.preferredLocale) ? ctx.preferredLocale : undefined;
    const currentLanguage = resolvedLanguage === defaultLanguage ? undefined : resolvedLanguage;

    const saveLanguage = useCallback(
        async (save: () => Promise<void>, language: ILocale | undefined) => {
            try {
                await save();
            } catch (error) {
                trackOwnLanguageSave(telemetry, currentLanguage, language, "error");
                throw error;
            }
            trackOwnLanguageSave(telemetry, currentLanguage, language, "success");
            // A page reload, as reloading the platform context isn't enough: on workspace routes, the language comes
            // from the workspace settings, which the backend's caching keeps until the page reloads.
            window.location.reload();
        },
        [telemetry, currentLanguage],
    );

    const setLanguage = useCallback(
        (language: ILocale) =>
            saveLanguage(() => getBackend().currentUser().settings().setLocale(language), language),
        [saveLanguage],
    );

    const deleteLanguage = useCallback(
        () => saveLanguage(() => getBackend().currentUser().settings().deleteLocale(), undefined),
        [saveLanguage],
    );

    if (!defaultLanguage) {
        return undefined;
    }

    return { currentLanguage, defaultLanguage, languages: LANGUAGES, setLanguage, deleteLanguage };
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
