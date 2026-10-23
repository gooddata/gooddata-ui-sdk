// (C) 2021-2026 GoodData Corporation

import { memoize } from "lodash-es";

import {
    type ILocale,
    type ITranslations,
    DEFAULT_MESSAGES as SDK_DEFAULT_MESSAGES,
    resolveMessages as resolveSdkMessages,
} from "@gooddata/sdk-ui";
// The share dialog's `objectShare.*` ids live in sdk-ui-ext, not the sdk-ui layer.
import {
    DEFAULT_MESSAGES as EXT_DEFAULT_MESSAGES,
    resolveMessages as resolveExtMessages,
} from "@gooddata/sdk-ui-ext/internal";
import { removeMetadata } from "@gooddata/util";

import en_US from "./en-US.json" with { type: "json" };

// English (default) app messages, used as the fallback for locales that are missing keys.
// The composed sdk layer already falls back to English for its own keys.
const DEFAULT_APP_MESSAGES: ITranslations = removeMetadata(en_US);

export const DEFAULT_LANGUAGE: ILocale = "en-US";
export const DEFAULT_MESSAGES: Record<string, ITranslations> = {
    [DEFAULT_LANGUAGE]: {
        ...SDK_DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
        ...EXT_DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
        ...DEFAULT_APP_MESSAGES, // app messages should override sdk messages
    },
};

const asyncComponentTranslations: { [locale: string]: () => Promise<ITranslations> } = {
    "en-US": () => Promise.resolve(DEFAULT_APP_MESSAGES),
    "en-US-x-24h": () => Promise.resolve(DEFAULT_APP_MESSAGES),
    "de-DE": () => import("./de-DE.json").then((module) => module.default),
    "en-AU": () => import("./en-AU.json").then((module) => module.default),
    "en-GB": () => import("./en-GB.json").then((module) => module.default),
    "es-419": () => import("./es-419.json").then((module) => module.default),
    "es-ES": () => import("./es-ES.json").then((module) => module.default),
    "fi-FI": () => import("./fi-FI.json").then((module) => module.default),
    "fr-CA": () => import("./fr-CA.json").then((module) => module.default),
    "fr-FR": () => import("./fr-FR.json").then((module) => module.default),
    "it-IT": () => import("./it-IT.json").then((module) => module.default),
    "ja-JP": () => import("./ja-JP.json").then((module) => module.default),
    "ko-KR": () => import("./ko-KR.json").then((module) => module.default),
    "nl-NL": () => import("./nl-NL.json").then((module) => module.default),
    "pt-BR": () => import("./pt-BR.json").then((module) => module.default),
    "pt-PT": () => import("./pt-PT.json").then((module) => module.default),
    "ru-RU": () => import("./ru-RU.json").then((module) => module.default),
    "zh-Hans": () => import("./zh-Hans.json").then((module) => module.default),
    "zh-Hant": () => import("./zh-Hant.json").then((module) => module.default),
    "zh-HK": () => import("./zh-HK.json").then((module) => module.default),
    "tr-TR": () => import("./tr-TR.json").then((module) => module.default),
    "pl-PL": () => import("./pl-PL.json").then((module) => module.default),
    "sl-SI": () => import("./sl-SI.json").then((module) => module.default),
    "id-ID": () => import("./id-ID.json").then((module) => module.default),
    "th-TH": () => import("./th-TH.json").then((module) => module.default),
    "vi-VN": () => import("./vi-VN.json").then((module) => module.default),
    "uk-UA": () => import("./uk-UA.json").then((module) => module.default),
};

/**
 * Asynchronously loads translations for the specified locale.
 * Merges SDK translations with component-specific translations.
 * Component translations take precedence over SDK translations.
 *
 * @param locale - The locale to load translations for
 * @returns Promise resolving to merged translations object
 * @internal
 */
const resolveMessagesInternal = async (locale: string): Promise<ITranslations> => {
    const componentLoader =
        asyncComponentTranslations[locale] || asyncComponentTranslations[DEFAULT_LANGUAGE];

    const [componentMessages, sdkMessages, extMessages] = await Promise.all([
        componentLoader(),
        resolveSdkMessages(locale),
        resolveExtMessages(locale),
    ]);

    return {
        ...DEFAULT_APP_MESSAGES,
        ...sdkMessages,
        ...extMessages,
        ...componentMessages,
    };
};

/**
 * Resolves translation messages for the given locale.
 * Memoized to cache promises and prevent duplicate async imports.
 *
 * @internal
 */
export const resolveMessages: (locale: string) => Promise<ITranslations> = memoize(resolveMessagesInternal);

/**
 * Validates if a locale has translations available in the messages map.
 * Falls back to DEFAULT_LANGUAGE if the locale is not found.
 *
 * @param messages - Map of locale codes to translation records
 * @param locale - The locale to validate
 * @returns The validated locale or DEFAULT_LANGUAGE if not found
 * @internal
 */
export function validateLocaleForMessagesMap(
    messages: Record<string, Record<string, string>>,
    locale: string,
): string {
    return messages[locale] ? locale : DEFAULT_LANGUAGE;
}
