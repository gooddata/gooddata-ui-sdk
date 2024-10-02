// (C) 2024 GoodData Corporation

import * as React from "react";
import { ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ListItemProps } from "../types.js";
import { renderDetails } from "../utils/renderDetails.js";
import { renderItemIcon } from "../utils/renderItemIcon.js";
import { UpdatedDate } from "./UpdateDate.js";
import { renderLock } from "../utils/renderLock.js";
import { SearchListItem } from "../SearchListItem.js";
import { getAreaLabel } from "../utils/getAreaLabel.js";

const CoreAnnotatedResultsItem: React.FC<ListItemProps<ISemanticSearchResultItem>> = (props) => {
    const { listItem } = props;
    const lockIcon = renderLock(listItem);

    return (
        <SearchListItem
            {...props}
            renderIcon={renderItemIcon}
            renderDetails={renderDetails}
            getAreaLabel={getAreaLabel}
        >
            <span className="gd-semantic-search__results-item__text__row">
                {lockIcon}
                <span className="gd-semantic-search__results-item__text__ellipsis">
                    {listItem.item.title}
                </span>
            </span>
            <span className="gd-semantic-search__results-item__text__row">
                {listItem.parentRef ? (
                    <span className="gd-semantic-search__results-item__text__ellipsis">
                        {listItem.parentRef.sourceObjectTitle}
                    </span>
                ) : null}
                <span>
                    <UpdatedDate listItem={listItem} />
                </span>
            </span>
        </SearchListItem>
    );
};

/**
 * A single result item in the search results.
 * @internal
 */
export const AnnotatedResultsItem = React.memo(CoreAnnotatedResultsItem);
