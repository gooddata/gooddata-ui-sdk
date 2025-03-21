// (C) 2024-2025 GoodData Corporation
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
};
