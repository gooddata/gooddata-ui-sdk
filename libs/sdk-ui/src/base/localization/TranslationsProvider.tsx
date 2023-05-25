// (C) 2007-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";
import { messages } from "../../locales.js";
import { emptyHeaderTitleFromIntl } from "./intlUtils.js";

/**
 * @internal
 */
export interface ITranslationsProviderOwnProps {
    children: any;
}

/**
 * @internal
 */
export interface ITranslationsComponentProps {
    numericSymbols: string[];
    emptyHeaderString: string;
    intl: IntlShape;
}

const getNumericSymbols = (intl: IntlShape): string[] => {
    return [messages.k, messages.m, messages.g, messages.t, messages.p, messages.e].map((desc) =>
        intl.formatMessage(desc),
    );
};

/**
 * @internal
 */
export type ITranslationsProviderProps = ITranslationsProviderOwnProps & WrappedComponentProps;

/**
 * @internal
 */
export class TranslationsProvider extends React.PureComponent<ITranslationsProviderProps> {
    public render() {
        const props: ITranslationsComponentProps = {
            numericSymbols: getNumericSymbols(this.props.intl),
            emptyHeaderString: emptyHeaderTitleFromIntl(this.props.intl),
            intl: this.props.intl,
        };
        return this.props.children(props);
    }
}

/**
 * @internal
 */
export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
