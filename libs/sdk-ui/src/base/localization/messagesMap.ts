// (C) 2007-2025 GoodData Corporation
import { memoize } from "lodash-es";

import { translationUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface ITranslations {
    [key: string]: string;
}

import { en_US } from "./bundles/en-US.localization-bundle.js";

const asyncMessagesMap: { [locale: string]: () => Promise<ITranslations> } = {
    "en-US": () => Promise.resolve(translationUtils.removeMetadata(en_US)),
    "de-DE": () => import("./bundles/de-DE.localization-bundle.js").then((module) => module.de_DE),
    "es-ES": () => import("./bundles/es-ES.localization-bundle.js").then((module) => module.es_ES),
    "fr-FR": () => import("./bundles/fr-FR.localization-bundle.js").then((module) => module.fr_FR),
    "ja-JP": () => import("./bundles/ja-JP.localization-bundle.js").then((module) => module.ja_JP),
    "nl-NL": () => import("./bundles/nl-NL.localization-bundle.js").then((module) => module.nl_NL),
    "pt-BR": () => import("./bundles/pt-BR.localization-bundle.js").then((module) => module.pt_BR),
    "pt-PT": () => import("./bundles/pt-PT.localization-bundle.js").then((module) => module.pt_PT),
    "zh-Hans": () => import("./bundles/zh-Hans.localization-bundle.js").then((module) => module.zh_Hans),
    "ru-RU": () => import("./bundles/ru-RU.localization-bundle.js").then((module) => module.ru_RU),
    "it-IT": () => import("./bundles/it-IT.localization-bundle.js").then((module) => module.it_IT),
    "es-419": () => import("./bundles/es-419.localization-bundle.js").then((module) => module.es_419),
    "fr-CA": () => import("./bundles/fr-CA.localization-bundle.js").then((module) => module.fr_CA),
    "en-GB": () => import("./bundles/en-GB.localization-bundle.js").then((module) => module.en_GB),
    "en-AU": () => import("./bundles/en-AU.localization-bundle.js").then((module) => module.en_AU),
    "fi-FI": () => import("./bundles/fi-FI.localization-bundle.js").then((module) => module.fi_FI),
    "zh-Hant": () => import("./bundles/zh-Hant.localization-bundle.js").then((module) => module.zh_Hant),
    "zh-HK": () => import("./bundles/zh-HK.localization-bundle.js").then((module) => module.zh_HK),
    "tr-TR": () => import("./bundles/tr-TR.localization-bundle.js").then((module) => module.tr_TR),
    "pl-PL": () => import("./bundles/pl-PL.localization-bundle.js").then((module) => module.pl_PL),
    "ko-KR": () => import("./bundles/ko-KR.localization-bundle.js").then((module) => module.ko_KR),
    "sl-SI": () => import("./bundles/sl-SI.localization-bundle.js").then((module) => module.sl_SI),
};

export const resolveMessagesInternal = async (locale: string): Promise<ITranslations> => {
    if (asyncMessagesMap[locale]) {
        return asyncMessagesMap[locale]();
    }
    return asyncMessagesMap["en-US"]();
};

/**
 * @internal
 */
export const resolveMessages: (locale: string) => Promise<ITranslations> = memoize(resolveMessagesInternal);

/**
 * @internal
 */
export const DEFAULT_LANGUAGE = "en-US";

/**
 * @internal
 */
export const DEFAULT_MESSAGES = { [DEFAULT_LANGUAGE]: translationUtils.removeMetadata(en_US) };
