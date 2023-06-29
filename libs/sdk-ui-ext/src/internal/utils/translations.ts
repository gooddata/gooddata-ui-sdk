// (C) 2019-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import merge from "lodash/merge.js";
import { translationUtils } from "@gooddata/util";
import { messagesMap as sdkUiTranslations } from "@gooddata/sdk-ui";

import enUS from "../translations/en-US.json";
import deDE from "../translations/de-DE.json";
import esES from "../translations/es-ES.json";
import frFR from "../translations/fr-FR.json";
import jaJP from "../translations/ja-JP.json";
import nlNL from "../translations/nl-NL.json";
import ptBR from "../translations/pt-BR.json";
import ptPT from "../translations/pt-PT.json";
import zhHans from "../translations/zh-Hans.json";
import ruRU from "../translations/ru-RU.json";
import { IDropdownItem } from "../interfaces/Dropdown.js";

export function getTranslation(
    translationId: string,
    intl: IntlShape,
    values: { [key: string]: string } = {},
): string {
    return intl ? intl.formatMessage({ id: translationId }, values) : translationId;
}

export function getTranslatedDropdownItems(dropdownItems: IDropdownItem[], intl: IntlShape): IDropdownItem[] {
    return dropdownItems.map((item: IDropdownItem) => {
        const translatedTitleProp = item.title ? { title: getTranslation(item.title, intl) } : {};
        const translatedInfoProp = item.info ? { info: getTranslation(item.info, intl) } : {};
        return { ...item, ...translatedTitleProp, ...translatedInfoProp };
    });
}

const sdkUiExtTranslations: { [locale: string]: Record<string, string> } = {
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
export const translations: { [locale: string]: Record<string, string> } = merge(
    sdkUiTranslations, // we use also some of the sdk-ui strings here so we need to merge them in here
    sdkUiExtTranslations,
);
