// (C) 2024-2025 GoodData Corporation
import { translationUtils } from "@gooddata/util";

import { de_DE } from "./bundles/de-DE.localization-bundle.js";
import { en_AU } from "./bundles/en-AU.localization-bundle.js";
import { en_GB } from "./bundles/en-GB.localization-bundle.js";
import { en_US } from "./bundles/en-US.localization-bundle.js";
import { es_419 } from "./bundles/es-419.localization-bundle.js";
import { es_ES } from "./bundles/es-ES.localization-bundle.js";
import { fi_FI } from "./bundles/fi-FI.localization-bundle.js";
import { fr_CA } from "./bundles/fr-CA.localization-bundle.js";
import { fr_FR } from "./bundles/fr-FR.localization-bundle.js";
import { it_IT } from "./bundles/it-IT.localization-bundle.js";
import { ja_JP } from "./bundles/ja-JP.localization-bundle.js";
import { ko_KR } from "./bundles/ko-KR.localization-bundle.js";
import { nl_NL } from "./bundles/nl-NL.localization-bundle.js";
import { pl_PL } from "./bundles/pl-PL.localization-bundle.js";
import { pt_BR } from "./bundles/pt-BR.localization-bundle.js";
import { pt_PT } from "./bundles/pt-PT.localization-bundle.js";
import { ru_RU } from "./bundles/ru-RU.localization-bundle.js";
import { tr_TR } from "./bundles/tr-TR.localization-bundle.js";
import { zh_Hans } from "./bundles/zh-Hans.localization-bundle.js";
import { zh_Hant } from "./bundles/zh-Hant.localization-bundle.js";
import { zh_HK } from "./bundles/zh-HK.localization-bundle.js";

export const translations: { [locale: string]: Record<string, string> } = {
    "de-DE": de_DE,
    "en-AU": en_AU,
    "en-GB": en_GB,
    "en-US": translationUtils.removeMetadata(en_US),
    "es-419": es_419,
    "es-ES": es_ES,
    "fi-FI": fi_FI,
    "fr-CA": fr_CA,
    "fr-FR": fr_FR,
    "it-IT": it_IT,
    "ja-JP": ja_JP,
    "nl-NL": nl_NL,
    "pt-BR": pt_BR,
    "pt-PT": pt_PT,
    "ru-RU": ru_RU,
    "zh-Hans": zh_Hans,
    "zh-Hant": zh_Hant,
    "zh-HK": zh_HK,
    "tr-TR": tr_TR,
    "pl-PL": pl_PL,
    "ko-KR": ko_KR,
};
