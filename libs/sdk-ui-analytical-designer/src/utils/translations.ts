// (C) 2007-2026 GoodData Corporation

import { type IntlShape, type MessageDescriptor, createIntl as createIntlNative } from "react-intl";

import { type ILocale, type ITranslations } from "@gooddata/sdk-ui";
import {
    DEFAULT_MESSAGES as DEFAULT_MESSAGES_SDK_UI_EXT,
    resolveMessages as extResolveMessages,
} from "@gooddata/sdk-ui-ext/internal";
import { removeMetadata } from "@gooddata/util";

import en_US from "../translations/en-US.json" with { type: "json" };
import { type ICatalogEntry } from "../typings/state_objects.js";

export const DEFAULT_LANGUAGE: ILocale = "en-US";

// English (default) app messages, used as the fallback for locales that are missing keys.
// The sdk layer (sdk-ui / sdk-ui-ext) already falls back to English for its own keys.
const DEFAULT_APP_MESSAGES: ITranslations = removeMetadata(en_US);

export const DEFAULT_MESSAGES: Record<string, ITranslations> = {
    [DEFAULT_LANGUAGE]: {
        ...DEFAULT_MESSAGES_SDK_UI_EXT[DEFAULT_LANGUAGE],
        ...DEFAULT_APP_MESSAGES, // app messages should override sdk messages
    },
};

const asyncAnalyticalDesignerTranslations: { [locale: string]: () => Promise<ITranslations> } = {
    "en-US": () => Promise.resolve(DEFAULT_APP_MESSAGES),
    "en-US-x-24h": () => Promise.resolve(DEFAULT_APP_MESSAGES), // 24-hour format uses same translations as en-US
    "de-DE": () => import("../translations/de-DE.json").then((module) => module.default),
    "en-AU": () => import("../translations/en-AU.json").then((module) => module.default),
    "en-GB": () => import("../translations/en-GB.json").then((module) => module.default),
    "es-419": () => import("../translations/es-419.json").then((module) => module.default),
    "es-ES": () => import("../translations/es-ES.json").then((module) => module.default),
    "fi-FI": () => import("../translations/fi-FI.json").then((module) => module.default),
    "fr-CA": () => import("../translations/fr-CA.json").then((module) => module.default),
    "fr-FR": () => import("../translations/fr-FR.json").then((module) => module.default),
    "it-IT": () => import("../translations/it-IT.json").then((module) => module.default),
    "ja-JP": () => import("../translations/ja-JP.json").then((module) => module.default),
    "ko-KR": () => import("../translations/ko-KR.json").then((module) => module.default),
    "nl-NL": () => import("../translations/nl-NL.json").then((module) => module.default),
    "pt-BR": () => import("../translations/pt-BR.json").then((module) => module.default),
    "pt-PT": () => import("../translations/pt-PT.json").then((module) => module.default),
    "ru-RU": () => import("../translations/ru-RU.json").then((module) => module.default),
    "zh-Hans": () => import("../translations/zh-Hans.json").then((module) => module.default),
    "zh-Hant": () => import("../translations/zh-Hant.json").then((module) => module.default),
    "zh-HK": () => import("../translations/zh-HK.json").then((module) => module.default),
    "tr-TR": () => import("../translations/tr-TR.json").then((module) => module.default),
    "pl-PL": () => import("../translations/pl-PL.json").then((module) => module.default),
    "sl-SI": () => import("../translations/sl-SI.json").then((module) => module.default),
    "id-ID": () => import("../translations/id-ID.json").then((module) => module.default),
    "th-TH": () => import("../translations/th-TH.json").then((module) => module.default),
    "vi-VN": () => import("../translations/vi-VN.json").then((module) => module.default),
    "uk-UA": () => import("../translations/uk-UA.json").then((module) => module.default),
};

/**
 * Asynchronously loads translations for the specified locale.
 *
 * @param locale - The locale to load translations for
 * @returns Promise resolving to translations object
 * @internal
 */
export const resolveMessages: (locale: ILocale) => Promise<ITranslations> = async (locale: ILocale) => {
    const loader =
        asyncAnalyticalDesignerTranslations[locale] || asyncAnalyticalDesignerTranslations[DEFAULT_LANGUAGE];
    const [messages, extMessages] = await Promise.all([loader(), extResolveMessages(locale)]);
    return {
        ...DEFAULT_APP_MESSAGES, // English (default) fallback for this app's own keys
        ...extMessages, // sdk messages (the sdk layer already falls back to English for its own keys)
        ...messages, // locale app messages override everything
    };
};

export function createIntl(locale: ILocale, messages: Record<string, string>): IntlShape {
    return createIntlNative({ locale, messages });
}

export function getCatalogItemTitle(item: ICatalogEntry | null | undefined, intl: IntlShape) {
    return item?.intl ? intl.formatMessage({ id: item?.title }) : item?.title;
}

export function isLocale(locale: string): locale is ILocale {
    return !!asyncAnalyticalDesignerTranslations[locale as ILocale];
}

export function validateLocale(locale: string): ILocale {
    return isLocale(locale) ? locale : DEFAULT_LANGUAGE;
}

export function createFakeTestIntl(): IntlShape {
    // a REAL intl underneath, with only formatMessage faked to echo the descriptor id
    const intl = createIntlNative({ locale: DEFAULT_LANGUAGE, messages: {}, onError: () => {} });
    return {
        ...intl,
        // the fake always answers a string; IntlShape's rich-text overload (ReactNode[]) cannot be
        // satisfied by it, hence the property-scoped cast
        formatMessage: ((descriptor: MessageDescriptor, values: Record<string, string> = {}): string => {
            const pairs: string[] = Object.getOwnPropertyNames(values).reduce((acc, key) => {
                acc.push(`${key}:${values[key]}`);
                return acc;
            }, []);
            const suffix = pairs.length ? ` with values { ${pairs.join(", ")} }` : "";
            return `(translated ${descriptor.id}${suffix})`;
        }) as IntlShape["formatMessage"],
    };
}
