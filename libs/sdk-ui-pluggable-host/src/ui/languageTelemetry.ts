// (C) 2026 GoodData Corporation

import { type ILocale } from "@gooddata/sdk-model";
import { type IPluggableAppTelemetryCallbacks } from "@gooddata/sdk-pluggable-application-model";

import { type LanguageChoice } from "./languages.js";

// Events carry only language codes. Never add names of people or workspaces.
const LOCALIZATION_CATEGORY = "localization";

const INHERITED_LANGUAGE = "inherit";

export type LanguageSettingsEntry = "userMenu";

// Workspace and organization settings arrive resolved, so a route tells where the user is, not who set the language.
export type DisplayLanguageContext = "own" | "workspaceRoute" | "orgRoute";

function trackLocalizationEvent(
    telemetry: IPluggableAppTelemetryCallbacks | undefined,
    action: string,
    name: string,
    stats: Record<string, string>,
) {
    try {
        telemetry?.trackEvent(action, { category: LOCALIZATION_CATEGORY, action, label: name, stats });
    } catch (error) {
        console.warn("[languageTelemetry] Failed to track a language event:", error);
    }
}

export function trackLanguageSettingsOpen(
    telemetry: IPluggableAppTelemetryCallbacks | undefined,
    entry: LanguageSettingsEntry,
    displayLanguage: ILocale,
    context: DisplayLanguageContext,
) {
    trackLocalizationEvent(telemetry, "user_settings_open", `${displayLanguage}:${context}`, { entry });
}

// The default language is the one that follows the workspace or organization.
export function trackOwnLanguageSave(
    telemetry: IPluggableAppTelemetryCallbacks | undefined,
    from: LanguageChoice,
    to: LanguageChoice,
    outcome: "success" | "error",
) {
    trackLocalizationEvent(
        telemetry,
        "own_language_save",
        `${trackedLanguage(from)}→${trackedLanguage(to)}`,
        { outcome },
    );
}

function trackedLanguage(language: LanguageChoice): string {
    return language === "default" ? INHERITED_LANGUAGE : language;
}
