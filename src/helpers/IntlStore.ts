// (C) 2007-2018 GoodData Corporation
import { InjectedIntl, IntlProvider } from 'react-intl';
import isEmpty = require('lodash/isEmpty');
import { Localization } from '@gooddata/typings';
import { DEFAULT_LOCALE } from '../constants/localization';

import * as enUS from '../translations/en-US.json';
import * as deDE from '../translations/de-DE.json';
import * as esES from '../translations/es-ES.json';
import * as frFR from '../translations/fr-FR.json';
import * as jaJP from '../translations/ja-JP.json';
import * as nlNL from '../translations/nl-NL.json';
import * as ptBR from '../translations/pt-BR.json';
import * as ptPT from '../translations/pt-PT.json';

const messagesMap = {
    'en-US': enUS,
    'de-DE': deDE,
    'es-ES': esES,
    'fr-FR': frFR,
    'ja-JP': jaJP,
    'nl-NL': nlNL,
    'pt-BR': ptBR,
    'pt-PT': ptPT
};

const intlStore = {};

function createIntl(locale: Localization.ILocale): InjectedIntl {
    const intlProvider = new IntlProvider({ locale, messages: messagesMap[locale] }, {});
    return intlProvider.getChildContext().intl;
}

function getIntl(locale: Localization.ILocale = DEFAULT_LOCALE): InjectedIntl {
    let usedLocale = locale;
    if (isEmpty(locale)) {
        usedLocale = DEFAULT_LOCALE;
    }

    return intlStore[usedLocale] || (intlStore[usedLocale] = createIntl(usedLocale));
}

function getTranslation(translationId: string, locale: Localization.ILocale): string {
    const intl = getIntl(locale);
    return intl.formatMessage({ id: translationId, defaultMessage: translationId });
}

export default {
    getIntl,
    getTranslation
};
