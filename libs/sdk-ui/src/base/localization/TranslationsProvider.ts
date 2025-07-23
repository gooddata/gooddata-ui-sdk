// (C) 2007-2025 GoodData Corporation
import { memo } from "react";
import { IntlShape, useIntl } from "react-intl";
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
export const IntlTranslationsProvider = memo(function TranslationsProvider({
    children,
}: ITranslationsProviderOwnProps) {
    const intl = useIntl();

    const translationProps: ITranslationsComponentProps = {
        numericSymbols: getNumericSymbols(intl),
        emptyHeaderString: emptyHeaderTitleFromIntl(intl),
        intl,
    };
    return children(translationProps);
});
