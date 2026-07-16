// (C) 2026 GoodData Corporation

import { memoize } from "lodash-es";

import {
    DEFAULT_LANGUAGE,
    DEFAULT_MESSAGES as DEFAULT_MESSAGES_SDK_UI,
    type ILocale,
    type ITranslations,
    resolveLocale,
    resolveMessages as resolveMessagesSdkUi,
} from "@gooddata/sdk-ui";
import { removeMetadata } from "@gooddata/util";

import enUS from "../../translations/en-US.json" with { type: "json" };

// English (default) messages for this library's own keys, used as the fallback
// for locales that are missing keys.
const DEFAULT_OWN_MESSAGES: ITranslations = removeMetadata(enUS);

type LocaleOptions = Record<ILocale, () => Promise<ITranslations>>;

const asyncMessagesMap: LocaleOptions = {
    "en-US": () => Promise.resolve(DEFAULT_OWN_MESSAGES),
    "en-US-x-24h": () => Promise.resolve(DEFAULT_OWN_MESSAGES),
    "de-DE": () => import("../../translations/de-DE.json").then((module) => module.default),
    "es-ES": () => import("../../translations/es-ES.json").then((module) => module.default),
    "fr-FR": () => import("../../translations/fr-FR.json").then((module) => module.default),
    "ja-JP": () => import("../../translations/ja-JP.json").then((module) => module.default),
    "nl-NL": () => import("../../translations/nl-NL.json").then((module) => module.default),
    "pt-BR": () => import("../../translations/pt-BR.json").then((module) => module.default),
    "pt-PT": () => import("../../translations/pt-PT.json").then((module) => module.default),
    "zh-Hans": () => import("../../translations/zh-Hans.json").then((module) => module.default),
    "sl-SI": () => import("../../translations/sl-SI.json").then((module) => module.default),
    "en-AU": () => import("../../translations/en-AU.json").then((module) => module.default),
    "en-GB": () => import("../../translations/en-GB.json").then((module) => module.default),
    "es-419": () => import("../../translations/es-419.json").then((module) => module.default),
    "fi-FI": () => import("../../translations/fi-FI.json").then((module) => module.default),
    "fr-CA": () => import("../../translations/fr-CA.json").then((module) => module.default),
    "it-IT": () => import("../../translations/it-IT.json").then((module) => module.default),
    "ko-KR": () => import("../../translations/ko-KR.json").then((module) => module.default),
    "pl-PL": () => import("../../translations/pl-PL.json").then((module) => module.default),
    "ru-RU": () => import("../../translations/ru-RU.json").then((module) => module.default),
    "tr-TR": () => import("../../translations/tr-TR.json").then((module) => module.default),
    "zh-HK": () => import("../../translations/zh-HK.json").then((module) => module.default),
    "zh-Hant": () => import("../../translations/zh-Hant.json").then((module) => module.default),
    "id-ID": () => import("../../translations/id-ID.json").then((module) => module.default),
    "th-TH": () => import("../../translations/th-TH.json").then((module) => module.default),
    "vi-VN": () => import("../../translations/vi-VN.json").then((module) => module.default),
    "uk-UA": () => import("../../translations/uk-UA.json").then((module) => module.default),
};

const defaultSdkUiMessages = DEFAULT_MESSAGES_SDK_UI[DEFAULT_LANGUAGE];

export const DEFAULT_MESSAGES: Record<string, ITranslations> = {
    [DEFAULT_LANGUAGE]: {
        ...defaultSdkUiMessages,
        ...DEFAULT_OWN_MESSAGES, // app messages should override sdk messages
    },
};

async function resolveMessagesInternal(locale: string): Promise<ITranslations> {
    const validatedLocale = resolveLocale(locale);

    try {
        const [hostAppMessages, sdkUiMessages] = await Promise.all([
            asyncMessagesMap[validatedLocale](),
            resolveMessagesSdkUi(validatedLocale),
        ]);

        // sdk-ui already falls back to English for its own keys; app messages override sdk messages
        return {
            ...DEFAULT_OWN_MESSAGES,
            ...sdkUiMessages,
            ...hostAppMessages,
        };
    } catch (error) {
        // Translation chunks are content-hashed and may have been removed by a redeploy
        // while the tab was open. Fall back to bundled en-US so the chrome still renders;
        // the global `vite:preloadError` handler will reload the page shortly after.
        console.warn(
            `[host-runtime/translations] Failed to load locale "${validatedLocale}", falling back to ${DEFAULT_LANGUAGE}.`,
            error,
        );
        return DEFAULT_MESSAGES[DEFAULT_LANGUAGE];
    }
}

/**
 * Resolves translation messages for the given locale.
 * Memoized to cache promises and prevent duplicate async imports.
 */
export const resolveMessages: (locale: string) => Promise<ITranslations> = memoize(resolveMessagesInternal);
