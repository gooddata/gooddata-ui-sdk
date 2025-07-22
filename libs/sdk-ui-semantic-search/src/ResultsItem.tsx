// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ListItemProps } from "./types.js";
import { renderItemIcon } from "./utils/renderItemIcon.js";
import { renderDetails } from "./utils/renderDetails.js";
import { SearchListItem } from "./SearchListItem.js";
import { getAreaLabel } from "./utils/getAreaLabel.js";

/**
 * A single result item in the search results.
 * @internal
 */
export const ResultsItem: React.FC<ListItemProps<ISemanticSearchResultItem, ISemanticSearchRelationship>> = (
    props,
) => {
    return (
        <SearchListItem
            {...props}
            renderIcon={renderItemIcon}
            renderDetails={renderDetails}
            getAreaLabel={getAreaLabel}
            renderItem={(item) => (
                <>
                    <span className="gd-semantic-search__results-item__text__row">
                        <span className="gd-semantic-search__results-item__text__ellipsis">
                            {item.item.title}
                        </span>
                    </span>
                </>
            )}
        />
    );
};
