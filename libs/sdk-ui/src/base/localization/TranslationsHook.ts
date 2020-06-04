// (C) 2020 GoodData Corporation
import { useIntl } from "react-intl";
import { getNumericSymbols } from "./TranslationsProvider";

/**
 * @internal
 */
export function useNumbericSymbols(): string[] {
    const intl = useIntl();
    return getNumericSymbols(intl);
}
