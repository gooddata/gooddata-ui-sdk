// (C) 2024-2025 GoodData Corporation

import { Icon } from "@gooddata/sdk-ui-kit";
import { ListItemProps } from "../types.js";
import { SearchListItem } from "../SearchListItem.js";
import { ITheme } from "@gooddata/sdk-model";
import { defineMessage, IntlShape, useIntl } from "react-intl";

const renderIcon = (_: any, theme?: ITheme) => (
    <Icon.HistoryBack color={theme?.palette?.complementary?.c5 ?? "#B0BECA"} />
);

const previousSearch = defineMessage({ id: "semantic-search.previous-search" });

const getAreaLabel = (intl: IntlShape) => () => intl.formatMessage(previousSearch);

/**
 * A single history item.
 * @internal
 */
export function HistoryItem(props: ListItemProps<string>) {
    const intl = useIntl();

    return (
        <SearchListItem
            {...props}
            renderIcon={renderIcon}
            getAreaLabel={getAreaLabel(intl)}
            className="gd-semantic-search__results-item--history"
        >
            <span className="gd-semantic-search__results-item__text__row">
                <span className="gd-semantic-search__results-item__text__ellipsis">
                    {props.listItem.item}
                </span>
            </span>
        </SearchListItem>
    );
}
