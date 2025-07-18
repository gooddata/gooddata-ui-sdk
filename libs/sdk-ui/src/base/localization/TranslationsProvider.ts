// (C) 2007-2025 GoodData Corporation
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
export function TranslationsProvider({ children, intl }: ITranslationsProviderProps) {
    const props: ITranslationsComponentProps = {
        numericSymbols: getNumericSymbols(intl),
        emptyHeaderString: emptyHeaderTitleFromIntl(intl),
        intl,
    };

    return children(props);
}

/**
 * @internal
 */
export const IntlTranslationsProvider = injectIntl<"intl", ITranslationsProviderProps>(TranslationsProvider);
