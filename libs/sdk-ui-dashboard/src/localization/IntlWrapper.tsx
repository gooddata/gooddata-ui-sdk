// (C) 2007-2019 GoodData Corporation
import React from "react";
import { IntlProvider } from "react-intl";
import { DefaultLocale } from "@gooddata/sdk-ui";

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
        const { locale } = this.props;
        return (
            <IntlProvider locale={locale} messages={translations[locale]}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
