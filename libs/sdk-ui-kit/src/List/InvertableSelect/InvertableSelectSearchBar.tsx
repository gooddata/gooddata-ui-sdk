// (C) 2007-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

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
            className={cx([
                "gd-invertable-select-search-input gd-list-searchfield gd-flex-item-mobile",
                className,
            ])}
            value={searchString}
            onChange={onSearch}
            placeholder={searchPlaceholder ?? intl.formatMessage({ id: "gs.list.search.placeholder" })}
            autofocus
            clearOnEsc
            isSearch
            isSmall={isSmall}
        />
    );
}
