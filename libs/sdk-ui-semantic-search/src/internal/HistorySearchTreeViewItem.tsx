// (C) 2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type IUiTreeviewItemProps, Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { SearchItem } from "../SearchItem.js";

const { HistoryBack: HistoryBackIcon } = Icon;

/**
 * @internal
 */
export function HistorySearchTreeViewItem({
    item,
    isFocused,
    level,
    onSelect,
    onHover,
    ariaAttributes,
}: IUiTreeviewItemProps<string>) {
    const theme = useTheme();
    const intl = useIntl();
    const ariaLabel = intl.formatMessage(
        { id: "semantic-search.previous-search" },
        { query: item.stringTitle },
    );

    return (
        <SearchItem
            ariaAttributes={{
                ...ariaAttributes,
                "aria-label": ariaLabel,
            }}
            level={level}
            onClick={onSelect}
            onHover={onHover}
            isFocused={isFocused}
            icon={<HistoryBackIcon color={theme?.palette?.complementary?.c5 ?? "#B0BECA"} />}
        >
            <span className="gd-semantic-search__results-item__text__row">
                <span className="gd-semantic-search__results-item__text__ellipsis">{item.stringTitle}</span>
            </span>
        </SearchItem>
    );
}
