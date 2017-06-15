import * as React from 'react';
import { IntlProvider } from 'react-intl';

import enUS from '../../translations/en-US';
import deDE from '../../translations/de-DE';
import esES from '../../translations/es-ES';
import frFR from '../../translations/fr-FR';
import jaJP from '../../translations/ja-JP';
import nlNL from '../../translations/nl-NL';
import ptBR from '../../translations/pt-BR';
import ptPT from '../../translations/pt-PT';

export const messagesMap = {
    'en-US': enUS,
    'de-DE': deDE,
    'es-ES': esES,
    'fr-FR': frFR,
    'ja-JP': jaJP,
    'nl-NL': nlNL,
    'pt-BR': ptBR,
    'pt-PT': ptPT
};

export const DEFAULT_LOCALE = 'en-US';

export interface IIntlWrapperProps {
    locale: string;
}

export class IntlWrapper extends React.PureComponent<IIntlWrapperProps, null> {
    public static defaultProps: IIntlWrapperProps = {
        locale: DEFAULT_LOCALE
    };
    public render() {
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={messagesMap[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
