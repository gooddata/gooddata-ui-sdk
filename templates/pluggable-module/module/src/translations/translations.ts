// (C) 2026 GoodData Corporation

import { memoize } from "lodash-es";

import {
    type ILocale,
    type ITranslations,
    DEFAULT_MESSAGES as SDK_DEFAULT_MESSAGES,
    resolveMessages as resolveSdkMessages,
} from "@gooddata/sdk-ui";
import { removeMetadata } from "@gooddata/util";

import en_US from "./en-US.json" with { type: "json" };

export const DEFAULT_LANGUAGE: ILocale = "en-US";
export const DEFAULT_MESSAGES: Record<string, ITranslations> = {
    [DEFAULT_LANGUAGE]: {
        ...SDK_DEFAULT_MESSAGES[DEFAULT_LANGUAGE],
        ...removeMetadata(en_US),
    },
};

const loadLocale = (importFn: () => Promise<{ default: unknown }>): (() => Promise<ITranslations>) => {
    return () => importFn().then((module) => removeMetadata(module.default || module));
};

type LocaleOptions = Record<ILocale, () => Promise<ITranslations>>;

const asyncComponentTranslations: LocaleOptions = {
    "en-US": () => Promise.resolve(removeMetadata(en_US)),
    "en-US-x-24h": () => Promise.resolve(removeMetadata(en_US)),
    "de-DE": loadLocale(() => import("./de-DE.json")),
    "en-AU": loadLocale(() => import("./en-AU.json")),
    "en-GB": loadLocale(() => import("./en-GB.json")),
    "es-419": loadLocale(() => import("./es-419.json")),
    "es-ES": loadLocale(() => import("./es-ES.json")),
    "fi-FI": loadLocale(() => import("./fi-FI.json")),
    "fr-CA": loadLocale(() => import("./fr-CA.json")),
    "fr-FR": loadLocale(() => import("./fr-FR.json")),
    "id-ID": loadLocale(() => import("./id-ID.json")),
    "it-IT": loadLocale(() => import("./it-IT.json")),
    "ja-JP": loadLocale(() => import("./ja-JP.json")),
    "ko-KR": loadLocale(() => import("./ko-KR.json")),
    "nl-NL": loadLocale(() => import("./nl-NL.json")),
    "pl-PL": loadLocale(() => import("./pl-PL.json")),
    "pt-BR": loadLocale(() => import("./pt-BR.json")),
    "pt-PT": loadLocale(() => import("./pt-PT.json")),
    "ru-RU": loadLocale(() => import("./ru-RU.json")),
    "sl-SI": loadLocale(() => import("./sl-SI.json")),
    "th-TH": loadLocale(() => import("./th-TH.json")),
    "tr-TR": loadLocale(() => import("./tr-TR.json")),
    "vi-VN": loadLocale(() => import("./vi-VN.json")),
    "zh-Hans": loadLocale(() => import("./zh-Hans.json")),
    "zh-Hant": loadLocale(() => import("./zh-Hant.json")),
    "uk-UA": loadLocale(() => import("./uk-UA.json")),
    "zh-HK": loadLocale(() => import("./zh-HK.json")),
};

const resolveMessagesInternal = async (locale: string): Promise<ITranslations> => {
    const componentLoader =
        asyncComponentTranslations[locale as ILocale] || asyncComponentTranslations[DEFAULT_LANGUAGE];

    const [componentMessages, sdkMessages] = await Promise.all([
        componentLoader(),
        resolveSdkMessages(locale),
    ]);

    return { ...sdkMessages, ...componentMessages };
};

export const resolveMessages: (locale: string) => Promise<ITranslations> = memoize(resolveMessagesInternal);
