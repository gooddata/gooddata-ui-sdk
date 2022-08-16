// (C) 2007-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { Input } from "../../Form";

/**
 * @internal
 */
export interface IInvertableSelectSearchBarProps {
    searchString?: string;
    searchPlaceholder?: string;
    onSearch: (searchString: string) => void;
}

/**
 * @internal
 */
export function InvertableSelectSearchBar(props: IInvertableSelectSearchBarProps) {
    const { searchString, onSearch, searchPlaceholder } = props;
    const intl = useIntl();

    return (
        <Input
            className="gd-list-searchfield gd-flex-item-mobile"
            value={searchString}
            onChange={onSearch}
            placeholder={searchPlaceholder ?? intl.formatMessage({ id: "gs.list.search.placeholder" })}
            autofocus
            clearOnEsc
            isSearch
            isSmall
        />
    );
}
