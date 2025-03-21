// (C) 2007-2025 GoodData Corporation
import merge from "lodash/merge.js";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import { en_US } from "./bundles/en-US.js";
import { de_DE } from "./bundles/de-DE.js";
import { es_ES } from "./bundles/es-ES.js";
import { fr_FR } from "./bundles/fr-FR.js";
import { ja_JP } from "./bundles/ja-JP.js";
import { nl_NL } from "./bundles/nl-NL.js";
import { pt_BR } from "./bundles/pt-BR.js";
import { pt_PT } from "./bundles/pt-PT.js";
import { zh_Hans } from "./bundles/zh-Hans.js";
import { ru_RU } from "./bundles/ru-RU.js";
import { it_IT } from "./bundles/it-IT.js";
import { es_419 } from "./bundles/es-419.js";
import { fr_CA } from "./bundles/fr-CA.js";
import { en_GB } from "./bundles/en-GB.js";
import { en_AU } from "./bundles/en-AU.js";
import { fi_FI } from "./bundles/fi-FI.js";
import { zh_Hant } from "./bundles/zh-Hant.js";
import { zh_HK } from "./bundles/zh-HK.js";

const sdkUiDashboardTranslations: { [locale: string]: Record<string, string> } = {
    "en-US": translationUtils.removeMetadata(en_US),
    "de-DE": de_DE,
    "es-ES": es_ES,
    "fr-FR": fr_FR,
    "ja-JP": ja_JP,
    "nl-NL": nl_NL,
    "pt-BR": pt_BR,
    "pt-PT": pt_PT,
    "zh-Hans": zh_Hans,
    "ru-RU": ru_RU,
    "it-IT": it_IT,
    "es-419": es_419,
    "fr-CA": fr_CA,
    "en-GB": en_GB,
    "en-AU": en_AU,
    "fi-FI": fi_FI,
    "zh-Hant": zh_Hant,
    "zh-HK": zh_HK,
};

/**
 * @internal
 */
export const translations = merge(
    {},
    // we also need the sdk-ui translations
    sdkUiTranslations,
    sdkUiDashboardTranslations,
);
