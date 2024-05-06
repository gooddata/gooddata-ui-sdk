// (C) 2007-2024 GoodData Corporation
import merge from "lodash/merge.js";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import enUS from "./bundles/en-US.json";
import deDE from "./bundles/de-DE.json";
import esES from "./bundles/es-ES.json";
import frFR from "./bundles/fr-FR.json";
import jaJP from "./bundles/ja-JP.json";
import nlNL from "./bundles/nl-NL.json";
import ptBR from "./bundles/pt-BR.json";
import ptPT from "./bundles/pt-PT.json";
import zhHans from "./bundles/zh-Hans.json";
import ruRU from "./bundles/ru-RU.json";
import itIT from "./bundles/it-IT.json";
import es419 from "./bundles/es-419.json";
import frCA from "./bundles/fr-CA.json";
import enGB from "./bundles/en-GB.json";

const sdkUiDashboardTranslations: { [locale: string]: Record<string, string> } = {
    "en-US": translationUtils.removeMetadata(enUS),
    "de-DE": deDE,
    "es-ES": esES,
    "fr-FR": frFR,
    "ja-JP": jaJP,
    "nl-NL": nlNL,
    "pt-BR": ptBR,
    "pt-PT": ptPT,
    "zh-Hans": zhHans,
    "ru-RU": ruRU,
    "it-IT": itIT,
    "es-419": es419,
    "fr-CA": frCA,
    "en-GB": enGB,
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
