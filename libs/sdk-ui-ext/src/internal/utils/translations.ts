// (C) 2019-2026 GoodData Corporation

import { memoize, merge } from "lodash-es";
import type { IntlShape } from "react-intl";

import {
    DEFAULT_MESSAGES as DEFAULT_MESSAGES_SDK_UI,
    type ITranslations,
    resolveMessages as sdkUiresolveMessages,
} from "@gooddata/sdk-ui";
// eslint-disable-next-line import/order
import { removeMetadata } from "@gooddata/util";
// eslint-disable-next-line import/order
import type { IDropdownItem } from "../interfaces/Dropdown.js";

export function getTranslation(
    translationId: string | undefined,
    intl?: IntlShape,
    values: { [key: string]: string } = {},
): string {
    if (!translationId) {
        return "";
    }
    return intl ? intl.formatMessage({ id: translationId }, values) : translationId;
}

export function getTranslatedDropdownItems(dropdownItems: IDropdownItem[], intl: IntlShape): IDropdownItem[] {
    return dropdownItems.map((item: IDropdownItem) => {
        const translatedTitleProp = item.title ? { title: getTranslation(item.title, intl) } : {};
        const translatedInfoProp = item.info ? { info: getTranslation(item.info, intl) } : {};
        return { ...item, ...translatedTitleProp, ...translatedInfoProp };
    });
}

import { en_US } from "../translations/en-US.localization-bundle.js";

const asyncSdkUiExtTranslations: { [locale: string]: () => Promise<ITranslations> } = {
    "en-US": () => Promise.resolve(removeMetadata(en_US)),
    "de-DE": () => import("../translations/de-DE.localization-bundle.js").then((module) => module.de_DE),
    "es-ES": () => import("../translations/es-ES.localization-bundle.js").then((module) => module.es_ES),
    "fr-FR": () => import("../translations/fr-FR.localization-bundle.js").then((module) => module.fr_FR),
    "ja-JP": () => import("../translations/ja-JP.localization-bundle.js").then((module) => module.ja_JP),
    "nl-NL": () => import("../translations/nl-NL.localization-bundle.js").then((module) => module.nl_NL),
    "pt-BR": () => import("../translations/pt-BR.localization-bundle.js").then((module) => module.pt_BR),
    "pt-PT": () => import("../translations/pt-PT.localization-bundle.js").then((module) => module.pt_PT),
    "zh-Hans": () =>
        import("../translations/zh-Hans.localization-bundle.js").then((module) => module.zh_Hans),
    "ru-RU": () => import("../translations/ru-RU.localization-bundle.js").then((module) => module.ru_RU),
    "it-IT": () => import("../translations/it-IT.localization-bundle.js").then((module) => module.it_IT),
    "es-419": () => import("../translations/es-419.localization-bundle.js").then((module) => module.es_419),
    "fr-CA": () => import("../translations/fr-CA.localization-bundle.js").then((module) => module.fr_CA),
    "en-GB": () => import("../translations/en-GB.localization-bundle.js").then((module) => module.en_GB),
    "en-AU": () => import("../translations/en-AU.localization-bundle.js").then((module) => module.en_AU),
    "fi-FI": () => import("../translations/fi-FI.localization-bundle.js").then((module) => module.fi_FI),
    "zh-Hant": () =>
        import("../translations/zh-Hant.localization-bundle.js").then((module) => module.zh_Hant),
    "zh-HK": () => import("../translations/zh-HK.localization-bundle.js").then((module) => module.zh_HK),
    "tr-TR": () => import("../translations/tr-TR.localization-bundle.js").then((module) => module.tr_TR),
    "pl-PL": () => import("../translations/pl-PL.localization-bundle.js").then((module) => module.pl_PL),
    "ko-KR": () => import("../translations/ko-KR.localization-bundle.js").then((module) => module.ko_KR),
    "sl-SI": () => import("../translations/sl-SI.localization-bundle.js").then((module) => module.sl_SI),
};

/**
 * Asynchronously loads translations for the specified locale, merging sdk-ui-ext translations
 * with sdk-ui translations.
 *
 * @param locale - The locale to load translations for
 * @returns Promise resolving to merged translations object
 * @internal
 */
const resolveMessagesInternal = async (locale: string): Promise<ITranslations> => {
    const sdkUiExtLoader = asyncSdkUiExtTranslations[locale] || asyncSdkUiExtTranslations["en-US"];
    const [sdkUiExtTranslations, sdkUiTranslations] = await Promise.all([
        sdkUiExtLoader(),
        sdkUiresolveMessages(locale),
    ]);
    return merge({}, sdkUiTranslations, sdkUiExtTranslations);
};

/**
 * Resolves translation messages for the given locale.
 * Memoized to cache promises and prevent duplicate async imports.
 *
 * @internal
 */
export const resolveMessages: (locale: string) => Promise<ITranslations> = memoize(resolveMessagesInternal);

export const DEFAULT_LANGUAGE = "en-US";
export const DEFAULT_MESSAGES = {
    [DEFAULT_LANGUAGE]: {
        ...removeMetadata(en_US),
        ...DEFAULT_MESSAGES_SDK_UI[DEFAULT_LANGUAGE],
    },
};
