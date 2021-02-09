// (C) 2019 GoodData Corporation
import React from "react";
import { IntlProvider, IntlShape, createIntl } from "react-intl";
import { DefaultLocale, ILocale } from "@gooddata/sdk-ui";

import { translations } from "./translations";

export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    return createIntl({ locale, messages: translations[locale] });
}

interface IInternalIntlWrapperProps {
    locale?: string;
}

export class InternalIntlWrapper extends React.PureComponent<IInternalIntlWrapperProps> {
    public static defaultProps: IInternalIntlWrapperProps = {
        locale: DefaultLocale,
    };
    public render(): React.ReactNode {
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={translations[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
