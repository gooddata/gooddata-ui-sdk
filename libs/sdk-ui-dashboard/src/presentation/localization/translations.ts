// (C) 2007-2022 GoodData Corporation
import merge from "lodash/merge.js";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";
import { translationUtils } from "@gooddata/util";

import enUS from "./bundles/en-US.js";
import deDE from "./bundles/de-DE.js";
import esES from "./bundles/es-ES.js";
import frFR from "./bundles/fr-FR.js";
import jaJP from "./bundles/ja-JP.js";
import nlNL from "./bundles/nl-NL.js";
import ptBR from "./bundles/pt-BR.js";
import ptPT from "./bundles/pt-PT.js";
import zhHans from "./bundles/zh-Hans.js";
import ruRU from "./bundles/ru-RU.js";

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
