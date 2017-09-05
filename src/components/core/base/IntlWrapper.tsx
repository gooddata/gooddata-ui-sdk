import * as React from 'react';
import { IntlProvider } from 'react-intl';

import * as enUS from '../../../translations/en-US.json';
import * as deDE from '../../../translations/de-DE.json';
import * as esES from '../../../translations/es-ES.json';
import * as frFR from '../../../translations/fr-FR.json';
import * as jaJP from '../../../translations/ja-JP.json';
import * as nlNL from '../../../translations/nl-NL.json';
import * as ptBR from '../../../translations/pt-BR.json';
import * as ptPT from '../../../translations/pt-PT.json';

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
