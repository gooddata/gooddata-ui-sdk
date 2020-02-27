// (C) 2007-2018 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";

/**
 * @internal
 */
export interface ITranslationsProviderProps {
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

/**
 * @internal
 */
export class TranslationsProvider extends React.PureComponent<
    ITranslationsProviderProps & WrappedComponentProps
> {
    public render() {
        const props: ITranslationsComponentProps = {
            numericSymbols: this.getNumericSymbols(),
            emptyHeaderString: this.getEmptyHeaderString(),
            intl: this.props.intl,
        };
        return this.props.children(props);
    }

    private getEmptyHeaderString() {
        const emptyValueTranslation = this.props.intl.formatMessage({ id: "visualization.emptyValue" });
        return `(${emptyValueTranslation})`;
    }

    private getNumericSymbols() {
        return [
            "visualization.numericValues.k",
            "visualization.numericValues.m",
            "visualization.numericValues.g",
            "visualization.numericValues.t",
            "visualization.numericValues.p",
            "visualization.numericValues.e",
        ].map((id: string) => this.props.intl.formatMessage({ id }));
    }
}

/**
 * @internal
 */
export const IntlTranslationsProvider = injectIntl(TranslationsProvider);
