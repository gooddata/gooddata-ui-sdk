// (C) 2025 GoodData Corporation
import React from "react";
import { Icon, type IUiTreeviewItemProps } from "@gooddata/sdk-ui-kit";
import { SearchItem } from "../SearchItem.js";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export function HistorySearchTreeViewItem(props: IUiTreeviewItemProps<string>) {
    const { item, isFocused, level, onSelect, onHover } = props;
    const theme = useTheme();
    const intl = useIntl();
    const ariaLabel = intl.formatMessage({ id: "semantic-search.previous-search" });

    return (
        <SearchItem
            ariaLabel={ariaLabel}
            level={level}
            onClick={onSelect}
            onHover={onHover}
            isFocused={isFocused}
            icon={<Icon.HistoryBack color={theme?.palette?.complementary?.c5 ?? "#B0BECA"} />}
        >
            <span className="gd-semantic-search__results-item__text__row">
                <span className="gd-semantic-search__results-item__text__ellipsis">{item.stringTitle}</span>
            </span>
        </SearchItem>
    );
}
