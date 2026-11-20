// (C) 2007-2026 GoodData Corporation

import { type KeyboardEvent } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Input } from "../../Form/Input.js";

/**
 * @internal
 */
export interface IInvertableSelectSearchBarProps {
    className?: string;
    isSmall?: boolean;
    searchString?: string;
    searchPlaceholder?: string;
    onSearch: (searchString: string) => void;
    onEscKeyPress?: (e: KeyboardEvent) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    propagateEscapeWhenEmpty?: boolean;
}

/**
 * @internal
 */
export function InvertableSelectSearchBar({
    className,
    isSmall,
    searchString,
    onSearch,
    onEscKeyPress,
    searchPlaceholder,
    onKeyDown,
    propagateEscapeWhenEmpty,
}: IInvertableSelectSearchBarProps) {
    const intl = useIntl();

    return (
        <Input
            className={cx(["gd-invertable-select-search-input gd-flex-item-mobile", className])}
            value={searchString}
            onChange={onSearch as any}
            onEscKeyPress={onEscKeyPress}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder ?? intl.formatMessage({ id: "gs.list.search.placeholder" })}
            autofocus
            clearOnEsc
            propagateEscapeWhenEmpty={propagateEscapeWhenEmpty}
            isSearch
            isSmall={isSmall}
            type="search"
            accessibilityConfig={{
                ariaLabel: intl.formatMessage({ id: "gs.list.acessibility.search.label" }),
            }}
        />
    );
}
