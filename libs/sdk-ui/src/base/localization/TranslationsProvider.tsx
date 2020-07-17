// (C) 2007-2018 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps, IntlShape } from "react-intl";

export interface ITranslationsProviderOwnProps {
    children: any;
}

export interface ITranslationsComponentProps {
    numericSymbols: string[];
    emptyHeaderString: string;
    intl: IntlShape;
}

export const getNumericSymbols = (intl: IntlShape): string[] => {
    return [
        "visualization.numericValues.k",
        "visualization.numericValues.m",
        "visualization.numericValues.g",
        "visualization.numericValues.t",
        "visualization.numericValues.p",
        "visualization.numericValues.e",
    ].map((id: string) => intl.formatMessage({ id }));
};

export type ITranslationsProviderProps = ITranslationsProviderOwnProps & WrappedComponentProps;

export class TranslationsProvider extends React.PureComponent<ITranslationsProviderProps> {
    public render() {
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

export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
