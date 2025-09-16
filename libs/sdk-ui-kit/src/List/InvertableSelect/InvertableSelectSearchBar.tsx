// (C) 2007-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { Input } from "../../Form/index.js";

/**
 * @internal
 */
export interface IInvertableSelectSearchBarProps {
    className?: string;
    isSmall?: boolean;
    searchString?: string;
    searchPlaceholder?: string;
    onSearch: (searchString: string) => void;
}

/**
 * @internal
 */
export function InvertableSelectSearchBar(props: IInvertableSelectSearchBarProps) {
    const { className, isSmall, searchString, onSearch, searchPlaceholder } = props;
    const intl = useIntl();

    return (
        <Input
            className={cx(["gd-invertable-select-search-input gd-flex-item-mobile", className])}
            value={searchString}
            onChange={onSearch}
            placeholder={searchPlaceholder ?? intl.formatMessage({ id: "gs.list.search.placeholder" })}
            autofocus
            clearOnEsc
            isSearch
            isSmall={isSmall}
            type="search"
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "gs.list.acessibility.search.label" }),
            }}
        />
    );
}
