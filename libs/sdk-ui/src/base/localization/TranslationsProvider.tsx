// (C) 2007-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";
import { messages } from "../../locales";

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
    public render(): React.ReactNode {
        const props: ITranslationsComponentProps = {
            numericSymbols: getNumericSymbols(this.props.intl),
            emptyHeaderString: this.getEmptyHeaderString(),
            intl: this.props.intl,
        };
        return this.props.children(props);
    }

    private getEmptyHeaderString() {
        const emptyValueTranslation = this.props.intl.formatMessage({ id: "visualization.emptyValue" });
        return `(${emptyValueTranslation})`;
    }
}

/**
 * @internal
 */
export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
