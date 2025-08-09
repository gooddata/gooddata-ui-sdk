// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import type { IUiTreeviewItemProps } from "@gooddata/sdk-ui-kit";
import { SearchItemIcon } from "./internal/SearchItemIcon.js";
import { SearchItemDetails } from "./internal/SearchItemDetails.js";
import { SearchItem } from "./SearchItem.js";
import { getAriaLabel } from "./utils/getAriaLabel.js";

type Props = IUiTreeviewItemProps<ISemanticSearchResultItem>;

/**
 * A single result item in the search results.
 * @internal
 */
export function SemanticSearchItem(props: Props) {
    const { item, level, isFocused, onSelect, onHover, ariaAttributes } = props;
    return (
        <SearchItem
            ariaAttributes={{
                ...ariaAttributes,
                "aria-label": getAriaLabel(item.data),
            }}
            level={level}
            onClick={onSelect}
            onHover={onHover}
            isFocused={isFocused}
            icon={<SearchItemIcon item={item.data} />}
            details={<SearchItemDetails item={item.data} />}
        >
            <span className="gd-semantic-search__results-item__text__row">
                <span className="gd-semantic-search__results-item__text__ellipsis">{item.stringTitle}</span>
            </span>
        </SearchItem>
    );
}
