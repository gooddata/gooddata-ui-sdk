// (C) 2007-2026 GoodData Corporation

import { memo } from "react";

import { type IntlShape, type WrappedComponentProps, injectIntl } from "react-intl";

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
    return [messages["k"], messages["m"], messages["g"], messages["t"], messages["p"], messages["e"]].map(
        (desc) => intl.formatMessage(desc),
    );
};

/**
 * @internal
 */
export type ITranslationsProviderProps = ITranslationsProviderOwnProps & WrappedComponentProps;

/**
 * @internal
 */
export const TranslationsProvider = memo(function TranslationsProvider(props: ITranslationsProviderProps) {
    const translationProps: ITranslationsComponentProps = {
        numericSymbols: getNumericSymbols(props.intl),
        emptyHeaderString: emptyHeaderTitleFromIntl(props.intl),
        intl: props.intl,
    };
    return props.children(translationProps);
});

/**
 * @internal
 */
export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
