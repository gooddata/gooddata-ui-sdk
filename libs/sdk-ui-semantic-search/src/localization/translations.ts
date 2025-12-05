// (C) 2024-2025 GoodData Corporation
import { memoize, merge } from "lodash-es";

import {
    DEFAULT_MESSAGES as DEFAULT_MESSAGES_SDK_UI,
    ITranslations,
    resolveMessages as resolveMessagesSdkUi,
} from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import { en_US } from "./bundles/en-US.localization-bundle.js";

const asyncSemanticSearchTranslations: { [locale: string]: () => Promise<ITranslations> } = {
    "en-US": () => Promise.resolve(translationUtils.removeMetadata(en_US)),
    "de-DE": () => import("./bundles/de-DE.localization-bundle.js").then((module) => module.de_DE),
    "en-AU": () => import("./bundles/en-AU.localization-bundle.js").then((module) => module.en_AU),
    "en-GB": () => import("./bundles/en-GB.localization-bundle.js").then((module) => module.en_GB),
    "es-419": () => import("./bundles/es-419.localization-bundle.js").then((module) => module.es_419),
    "es-ES": () => import("./bundles/es-ES.localization-bundle.js").then((module) => module.es_ES),
    "fi-FI": () => import("./bundles/fi-FI.localization-bundle.js").then((module) => module.fi_FI),
    "fr-CA": () => import("./bundles/fr-CA.localization-bundle.js").then((module) => module.fr_CA),
    "fr-FR": () => import("./bundles/fr-FR.localization-bundle.js").then((module) => module.fr_FR),
    "it-IT": () => import("./bundles/it-IT.localization-bundle.js").then((module) => module.it_IT),
    "ja-JP": () => import("./bundles/ja-JP.localization-bundle.js").then((module) => module.ja_JP),
    "nl-NL": () => import("./bundles/nl-NL.localization-bundle.js").then((module) => module.nl_NL),
    "pt-BR": () => import("./bundles/pt-BR.localization-bundle.js").then((module) => module.pt_BR),
    "pt-PT": () => import("./bundles/pt-PT.localization-bundle.js").then((module) => module.pt_PT),
    "ru-RU": () => import("./bundles/ru-RU.localization-bundle.js").then((module) => module.ru_RU),
    "zh-Hans": () => import("./bundles/zh-Hans.localization-bundle.js").then((module) => module.zh_Hans),
    "zh-Hant": () => import("./bundles/zh-Hant.localization-bundle.js").then((module) => module.zh_Hant),
    "zh-HK": () => import("./bundles/zh-HK.localization-bundle.js").then((module) => module.zh_HK),
    "tr-TR": () => import("./bundles/tr-TR.localization-bundle.js").then((module) => module.tr_TR),
    "pl-PL": () => import("./bundles/pl-PL.localization-bundle.js").then((module) => module.pl_PL),
    "ko-KR": () => import("./bundles/ko-KR.localization-bundle.js").then((module) => module.ko_KR),
    "sl-SI": () => import("./bundles/sl-SI.localization-bundle.js").then((module) => module.sl_SI),
};

/**
 * Asynchronously loads translations for the specified locale, merging sdk-ui-semantic-search translations
 * with sdk-ui translations.
 *
 * @param locale - The locale to load translations for
 * @returns Promise resolving to merged translations object
 * @internal
 */
const resolveMessagesInternal = async (locale: string): Promise<ITranslations> => {
    const semanticSearchLoader =
        asyncSemanticSearchTranslations[locale] || asyncSemanticSearchTranslations["en-US"];
    const [semanticSearchTranslations, sdkUiTranslations] = await Promise.all([
        semanticSearchLoader(),
        resolveMessagesSdkUi(locale),
    ]);
    return merge({}, sdkUiTranslations, semanticSearchTranslations);
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
        ...translationUtils.removeMetadata(en_US),
        ...DEFAULT_MESSAGES_SDK_UI[DEFAULT_LANGUAGE],
    },
};
