// (C) 2007-2019 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { DefaultLocale, TranslationsCustomizationProvider } from "@gooddata/sdk-ui";

import { translations } from "./translations";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale: string;
}

/**
 * @internal
 */
export class IntlWrapper extends React.PureComponent<IIntlWrapperProps> {
    public static defaultProps: IIntlWrapperProps = {
        locale: DefaultLocale,
    };

    public render(): React.ReactNode {
        const { children, locale } = this.props;
        return (
            <TranslationsCustomizationProvider
                translations={translations[locale]}
                render={(translations) => (
                    <IntlProvider key={locale} locale={locale} messages={translations}>
                        {children}
                    </IntlProvider>
                )}
            />
        );
    }
}
